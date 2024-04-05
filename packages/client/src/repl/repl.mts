import assert from 'node:assert';
import readline from 'node:readline/promises';
import { formatWithOptions } from 'node:util';

import * as vscode from 'vscode';

import { clearScreen, crlf, green, red } from './ansiUtils.mjs';
import { Application, Command } from './args.mjs';
import { cmdLs } from './cmdLs.mjs';
import { consoleDebug } from './consoleDebug.mjs';
import { emitterToReadStream, emitterToWriteStream } from './emitterToWriteStream.mjs';
import type { DirEntry } from './fsUtils.mjs';
import { currentDirectory, globSearch, readDir, toRelativeWorkspacePath } from './fsUtils.mjs';
import { globsToGlob } from './globUtils.mjs';
import { commandLineBuilder, parseCommandLineIntoArgs } from './parseCommandLine.js';

export function createTerminal() {
    const pty = new Repl();
    const terminal = vscode.window.createTerminal({ name: 'Spell Checker REPL', pty });
    terminal.show();
}

const commands = ['check', 'cd', 'ls', 'pwd', 'exit', 'help', 'trace', 'echo', 'cls', 'info'].sort();

class Repl implements vscode.Disposable, vscode.Pseudoterminal {
    readonly #emitterInput = new vscode.EventEmitter<string>();
    readonly #emitterOutput = new vscode.EventEmitter<string>();
    readonly #emitterOnDidClose = new vscode.EventEmitter<void>();
    readonly onDidWrite = this.#emitterOutput.event;
    readonly onDidClose = this.#emitterOnDidClose.event;
    readonly handleInput = (data: string) => this.#emitterInput.fire(data);
    readonly #writeStream = emitterToWriteStream(this.#emitterOutput);
    readonly #readStream = emitterToReadStream(this.#emitterInput);
    readonly #output = (value: string) => this.#emitterOutput.fire(value);
    readonly #controller = new AbortController();
    readonly #abortable = { signal: this.#controller.signal };
    #cwd = currentDirectory();
    #cancelationTokenSource: vscode.CancellationTokenSource | undefined;
    #rl: readline.Interface | undefined;
    #closed = false;
    #dimensions: vscode.TerminalDimensions | undefined;
    #application: Application | undefined;

    constructor() {}

    open(dimensions: vscode.TerminalDimensions | undefined) {
        consoleDebug('Repl.open');
        assert(!this.#rl, 'Repl already open');
        assert(!this.#closed, 'Repl already closed');
        if (dimensions) {
            this.#dimensions = dimensions;
            this.#writeStream.dimensions = dimensions;
        }
        this.#rl = readline.createInterface({
            input: this.#readStream,
            output: this.#writeStream,
            completer: this.completer,
            terminal: true,
        });
        const rl = this.#rl;
        rl.on('SIGTSTP', () => undefined);
        rl.on('SIGINT', this.#cancelAction);
        rl.on('close', () => (consoleDebug('rl close'), this.close()));
        rl.on('line', this.#processLine);
        this.#dimensions = dimensions;
        if (dimensions) {
            this.log('CSpell REPL');
            this.log('Type "help" or "?" for help.');
            this.#prompt();
        }
    }

    setDimensions(dimensions: vscode.TerminalDimensions) {
        this.#dimensions = dimensions;
        this.#writeStream.dimensions = dimensions;
        consoleDebug('Repl.setDimensions %o', dimensions);
        this.#updatePrompt();
    }

    dispose = () => {
        consoleDebug('Repl.dispose');
        this.close();
    };

    #processLine = (line: string) => {
        line = line.trim();
        consoleDebug('Repl.processLine %o', { line, args: parseCommandLineIntoArgs(line) });

        const parseAsync = async () => {
            if (!line) return;
            if (line === '?') {
                this.showHelp();
                return;
            }

            const argv = parseCommandLineIntoArgs(line);
            return this.#getApplication().exec(argv);
        };

        this.#prompt(parseAsync());
    };

    #getApplication(): Application {
        if (this.#application) return this.#application;
        const app = new Application('repl', 'CSpell REPL', 'Usage: ????');
        const cmdCheck = new Command(
            'check',
            'Spell check the files matching the globs.',
            {
                globs: { type: 'string[]', description: 'File glob patterns.' },
            },
            {},
            async (args) => {
                await this.#cmdCheck(args.args.globs);
            },
        );

        const cmdEcho = new Command(
            'echo',
            'Echo the values.',
            {
                values: { type: 'string[]', description: 'Echo the values to the console.' },
            },
            {},
            async (args) => {
                await this.#cmdEcho(args.args.values);
            },
        );

        const cmdTrace = new Command(
            'trace',
            'Trace which dictionaries contain the word.',
            {
                word: { type: 'string', description: 'The word to trace.' },
            },
            {},
            async (args) => {
                this.log('Tracing... %o', args);
            },
        );

        const cmdPwd = new Command('pwd', 'Print the current working directory.', {}, {}, () => this.#cmdPwd());

        const cmdCd = new Command(
            'cd',
            'Change the current working directory.',
            {
                path: { type: 'string', description: 'The path to change to.' },
            },
            {},
            async (args) => {
                await this.#cmdCd(args.args.path);
            },
        );

        const cmdLs = new Command(
            'ls',
            'List the directory contents.',
            {
                paths: { type: 'string[]', description: 'The paths to list.' },
            },
            {},
            async (args) => {
                await this.#cmdLs(args.args);
            },
        );

        const cmdExit = new Command('exit', 'Exit the REPL.', {}, {}, () => {
            this.log('Exiting...');
            this.close();
        });

        const cmdHelp = new Command(
            'help',
            'Show help.',
            {
                command: { type: 'string', description: 'Show Help', required: false },
            },
            {},
            async (args) => this.showHelp(args.args.command),
        );

        const cmdCls = new Command('cls', 'Clear the screen.', {}, {}, () => this.#output(clearScreen()));

        const cmdInfo = new Command('info', 'Show information about the REPL.', {}, {}, () => {
            this.log('CSpell REPL');
            this.log('Type "help" or "?" for help.');
            this.log('Working Directory: %s', green(this.#cwd.toString(true)));
            this.log('Dimensions: %o', this.#dimensions);
        });

        const commands = [cmdCheck, cmdEcho, cmdTrace, cmdPwd, cmdCd, cmdLs, cmdExit, cmdHelp, cmdCls, cmdInfo];
        app.addCommands(commands);
        this.#application = app;
        return app;
    }

    showHelp(command?: string) {
        this.log(this.#getApplication().getHelp(command));
    }

    #prompt(waitFor?: Promise<unknown>) {
        const p = async () => {
            try {
                await waitFor;
                if (waitFor) {
                    // clean up the action.
                    this.#cancelationTokenSource?.dispose();
                    this.#cancelationTokenSource = undefined;
                } else {
                    if (this.#cancelationTokenSource) {
                        // It is busy, do not display the prompt.
                        // It is possible to get here if the dimensions of the window change
                        // while in the middle of an action.
                        return;
                    }
                }
            } catch {
                // empty
            }
            this.#updatePrompt();
            this.#rl?.prompt();
            if (this.#rl) {
                const { cursor, line, terminal } = this.#rl;
                consoleDebug('cursor pos: %o', { cursorPos: this.#rl.getCursorPos(), dim: this.#dimensions, cursor, line, terminal });
            }
        };
        p();
    }

    #updatePrompt() {
        this.#rl?.setPrompt(`cspell ${green(toRelativeWorkspacePath(vscode.Uri.joinPath(this.#cwd, '/')) || '')} > `);
    }

    async #cmdCheck(globs: string[] | undefined) {
        consoleDebug('Repl.cmdCheck');
        let pattern = globsToGlob(globs);
        if (!pattern) {
            pattern = await this.#rl?.question('File glob pattern: ', this.#abortable);
        }
        if (!pattern) return;

        this.log('Checking...');

        const cfgSearchExclude = vscode.workspace.getConfiguration('search.exclude') as { [key: string]: boolean };
        const searchExclude = Object.keys(cfgSearchExclude).filter((k) => cfgSearchExclude[k] === true);
        const excludePattern = globsToGlob(searchExclude);
        const files = await globSearch(pattern, currentDirectory(), excludePattern, undefined, this.#getCancelationTokenForAction());
        files.forEach((f) => this.#output(`File: ${colorText(vscode.workspace.asRelativePath(f, true))}\r\n`));
    }

    async #cmdEcho(globs: string[] | undefined) {
        consoleDebug('Repl.cmdEcho');
        this.log((globs || []).join(' '));
    }

    completer = async (line: string): Promise<[string[], string]> => {
        if (!line.trim()) return [commands, ''];

        const cmdLine = commandLineBuilder(line);
        const args = cmdLine.args;
        if (args.length === 1 && line === args[0]) {
            return [this.#completeWithOptions(line, commands).map((line) => line + ' '), line];
        }

        const command = args[0];

        const argIndex = cmdLine.hasTrailingSeparator() ? 0 : args.length - 1;
        const current = argIndex ? args[argIndex] : '';
        const results = await this.#cmdCompletion(command, current, args);

        const completions = results.map((c) => {
            const cmd = cmdLine.clone();
            if (argIndex) {
                cmd.setArg(argIndex, c);
            } else {
                cmd.pushArg(c);
            }
            return cmd.line;
        });

        return [completions.filter((c) => c.startsWith(line)), line];
    };

    #cmdCompletion = async (command: string, current: string, args: string[]) => {
        console.error('Repl.cmdCompletion %o', { command, current });
        switch (command) {
            case 'check':
                return this.#cmdCheckCompletion(current);
            case 'cd':
                return this.#cmdCdCompletion(current, args);
            case 'ls':
                return this.#completeWithPath(current, false);
            case 'help':
                return this.#completeWithOptions(current, commands);
        }
        return [];
    };

    #cmdCheckCompletion = async (current: string) => {
        return this.#completeWithPath(current, false);
    };

    #cmdCdCompletion = async (current: string, args: string[]) => {
        if (args.length > 2 || (args.length === 2 && args[1] !== current)) return [];
        return this.#completeWithPath(current, true);
    };

    #completeWithPath = async (current: string, directoriesOnly: boolean) => {
        const files = await this.readDirEntryNames(current, directoriesOnly ? vscode.FileType.Directory : undefined);
        return this.#completeWithOptions(
            current,
            files.map((f) => (f.startsWith('-') ? `./${f}` : f)),
        );
    };

    #completeWithOptions = (current: string, options: string[]): string[] => {
        // console.error('Repl.completeWithOptions %o', { current, options });
        const matchingCommands = options.filter((c) => c.startsWith(current));
        const prefix = findLongestPrefix(matchingCommands);
        return prefix && prefix !== current ? [prefix] : matchingCommands;
    };

    #cmdPwd() {
        consoleDebug('Repl.cmdPwd');
        this.log(this.#cwd?.toString(false) || 'No Working Directory');
    }

    async #cmdLs(args: { paths?: string[] | undefined }) {
        consoleDebug('Repl.cmdLs %o', args);

        await cmdLs(args.paths, { log: this.log, cwd: this.#cwd, cancelationToken: this.#getCancelationTokenForAction() });
    }

    async readDir(relUri?: string | vscode.Uri | undefined): Promise<DirEntry[]> {
        return readDir(relUri, this.#cwd);
    }

    async readDirEntryNames(relativePartialPath: string, filterType?: vscode.FileType): Promise<string[]> {
        const relPath = relativePartialPath.split('/').slice(0, -1).join('/');
        const filterFn = filterType ? ([, type]: Readonly<[string, vscode.FileType]>) => type & filterType : () => true;
        const defaultDir: DirEntry[] = relPath ? [] : [['..', vscode.FileType.Directory]];

        const relPrefix = relPath ? relPath + '/' : '';

        const dirInfo = [...defaultDir, ...(await this.readDir(relPath)).map(([name, type]) => [relPrefix + name, type] as DirEntry)]
            .filter(filterFn)
            .map(([name, type]) => name + (type & vscode.FileType.Directory ? '/' : ''));
        return dirInfo;
    }

    async #cmdCd(path?: string) {
        if (!path) {
            return this.#cmdPwd();
        }
        try {
            const newDir = vscode.Uri.joinPath(this.#cwd, path);
            const s = await vscode.workspace.fs.stat(newDir);
            if (s.type & vscode.FileType.Directory) {
                this.#cwd = newDir;
            } else {
                throw vscode.FileSystemError.FileNotADirectory(newDir);
            }
        } catch (e) {
            if (e instanceof vscode.FileSystemError) {
                this.log(`"${path}" is not a valid directory.`);
                return;
            }
            this.log('Error: %o', e);
        }
    }

    close = () => {
        consoleDebug('Repl.close');
        if (this.#closed) return;
        this.#closed = true;
        this.#cancelationTokenSource?.cancel();
        this.#controller.abort();
        this.#rl?.close();
        this.#readStream.destroy();
        this.#writeStream.destroy();
        this.#emitterOnDidClose.fire();
        this.#cancelationTokenSource?.dispose();
        this.#cancelationTokenSource = undefined;
    };

    log: typeof console.log = (...args) => this.#output(crlf(formatWithOptions({ colors: true }, ...args) + '\n'));
    error: typeof console.error = (...args) => this.#output(red('Error: ') + crlf(formatWithOptions({ colors: true }, ...args) + '\n'));

    #cancelAction = () => this.#cancelationTokenSource?.cancel();

    #createCancelationTokenForAction(): vscode.CancellationToken {
        return this.#createCancelationTokenSourceForAction().token;
    }

    #getCancelationTokenForAction(): vscode.CancellationToken {
        return this.#cancelationTokenSource?.token || this.#createCancelationTokenForAction();
    }

    #createCancelationTokenSourceForAction(): vscode.CancellationTokenSource {
        this.#cancelationTokenSource?.dispose();
        const t = abortControllerToCancelationTokenSource(this.#controller);
        this.#cancelationTokenSource = t;
        return t;
    }
}

function colorText(text: string): string {
    return green(text);
}

function abortControllerToCancelationTokenSource(ac: AbortController): vscode.CancellationTokenSource {
    const t = new vscode.CancellationTokenSource();
    ac.signal.onabort = () => t.cancel();
    return t;
}

function findLongestPrefix(values: string[]): string {
    if (!values.length) return '';
    let val = values[0];
    for (const v of values) {
        let i = 0;
        for (; i < val.length && i < v.length; ++i) {
            if (val[i] !== v[i]) break;
        }
        val = val.slice(0, i);
        if (!val) return val;
    }
    return val;
}
