import assert from 'node:assert';
import readline from 'node:readline/promises';
import { formatWithOptions } from 'node:util';

import camelize from 'camelize';
import * as vscode from 'vscode';

import { clearScreen, crlf, eraseLine, green, red, yellow } from './ansiUtils.mjs';
import { Application, Command, defArg, defOpt } from './args.mjs';
import { cmdCheckDocuments } from './cmdCheck.mjs';
import { cmdLs } from './cmdLs.mjs';
import { cmdSuggestions } from './cmdSuggestions.mjs';
import { traceWord } from './cmdTrace.mjs';
import { consoleDebug } from './consoleDebug.mjs';
import { emitterToReadStream, emitterToWriteStream } from './emitterToWriteStream.mjs';
import type { DirEntry } from './fsUtils.mjs';
import { currentDirectory, globSearch, readDir, resolvePath, toRelativeWorkspacePath } from './fsUtils.mjs';
import { globsToGlob } from './globUtils.mjs';
import { commandLineBuilder, parseCommandLineIntoArgs } from './parseCommandLine.mjs';

const defaultWidth = 80;

export function createTerminal() {
    const pty = new Repl();
    const terminal = vscode.window.createTerminal({ name: 'Spell Checker REPL', pty });
    terminal.show();
}

export function registerTerminalProfileProvider(): vscode.Disposable {
    return vscode.window.registerTerminalProfileProvider('cSpell.terminal-profile', {
        provideTerminalProfile: () => {
            return new vscode.TerminalProfile({ name: 'Spell Checker REPL', pty: new Repl() });
        },
    });
}

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
    #cancellationTokenSource: vscode.CancellationTokenSource | undefined;
    #rl: readline.Interface | undefined;
    #closed = false;
    #dimensions: vscode.TerminalDimensions | undefined;
    #application: Application | undefined;

    // constructor() {}

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
            return this.#getApplication().exec(argv, this.log);
        };

        this.#prompt(parseAsync());
    };

    #getApplication(): Application {
        if (this.#application) return this.#application;
        const app = new Application('CSpell REPL');
        const cmdCheck = new Command(
            'check',
            'Spell check the files matching the globs.',
            { ...defArg('globs', 'string[]', 'File glob patterns.') },
            {},
            (args) => this.#cmdCheck(args.args.globs),
        );

        const cmdEcho = new Command(
            'echo',
            'Echo the values.',
            { ...defArg('values', 'string[]', 'Echo the values to the console.') },
            {},
            (args) => this.#cmdEcho(args.args.values),
        );

        const cmdTrace = new Command(
            'trace',
            'Trace which dictionaries contain the word.',
            { ...defArg('word', 'string', 'The word to trace.', true) },
            {
                ...defOpt('all', 'boolean', 'Show all dictionaries.', ''),
                ...defOpt('only-found', 'boolean', 'Show only found dictionaries.', 'f'),
                ...defOpt('only-enabled', 'boolean', 'Show only enabled dictionaries.', ''),
                ...defOpt('filetype', 'string', 'The file type to use. Example: `python`', 't'),
                ...defOpt('allow-compound-words', 'boolean', 'Allow compound words.', ''),
            },
            (args) => this.#cmdTrace(args.args, args.options),
        );

        const cmdSuggest = new Command(
            'suggestions',
            'Generate suggestions for a word.',
            { ...defArg('word', 'string', 'The word to make suggestions.', true) },
            { ...defOpt('max', 'number', 'The maximum number of suggestions to generate.', '') },
            (args) => this.#cmdSuggestions(args.args.word, args.options),
        );

        const cmdPwd = new Command('pwd', 'Print the current working directory.', {}, {}, () => this.#cmdPwd());

        const cmdCd = new Command(
            'cd',
            'Change the current working directory.',
            { ...defArg('path', 'string', 'The path to change to.') },
            {},
            (args) => this.#cmdCd(args.args.path),
        );

        const cmdLs = new Command(
            'ls',
            'List the directory contents.',
            { ...defArg('paths', 'string[]', 'The paths to list.') },
            {},
            (args) => this.#cmdLs(args.args),
        );

        const cmdEnv = new Command(
            'env',
            'Show environment variables.',
            { ...defArg('filter', 'string[]', 'Optional filter.') },
            {},
            (args) => this.#cmdEnv(args.args.filter),
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
            (args) => this.showHelp(args.args.command),
        );

        const cmdCls = new Command('cls', 'Clear the screen.', {}, {}, () => this.#output(clearScreen()));

        const cmdInfo = new Command('info', 'Show information about the REPL.', {}, {}, () => {
            this.log('CSpell REPL');
            this.log('Type "help" or "?" for help.');
            this.log('Working Directory: %s', green(this.#cwd.toString(true)));
            this.log('Dimensions: %o', this.#dimensions);
        });

        const commands = [cmdCheck, cmdEcho, cmdTrace, cmdPwd, cmdCd, cmdLs, cmdEnv, cmdExit, cmdHelp, cmdCls, cmdInfo, cmdSuggest];
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
                    this.#cancellationTokenSource?.dispose();
                    this.#cancellationTokenSource = undefined;
                } else {
                    if (this.#cancellationTokenSource) {
                        // It is busy, do not display the prompt.
                        // It is possible to get here if the dimensions of the window change
                        // while in the middle of an action.
                        return;
                    }
                }
            } catch (e) {
                if (e instanceof Error) {
                    this.error(e.message);
                }
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
        const { log, error } = this;
        const output = this.#output;

        let pattern = globsToGlob(globs);
        if (!pattern) {
            pattern = await this.#rl?.question('File glob pattern: ', this.#abortable);
        }
        if (!pattern) return;

        output(eraseLine() + 'Gathering Files...');

        const cfgSearchExclude = vscode.workspace.getConfiguration('search.exclude') as Record<string, boolean>;
        const searchExclude = Object.keys(cfgSearchExclude).filter((k) => cfgSearchExclude[k] === true);
        const excludePattern = globsToGlob(searchExclude);
        const files = await globSearch(
            pattern,
            this.#cwd || currentDirectory(),
            excludePattern,
            undefined,
            this.#getCancellationTokenForAction(),
        );

        log(eraseLine() + 'Checking...');

        await cmdCheckDocuments(files, { log, error, output, cancellationToken: this.#getCancellationTokenForAction(), width: this.width });
    }

    async #cmdEcho(globs: string[] | undefined) {
        consoleDebug('Repl.cmdEcho');
        this.log((globs || []).join(' '));
    }

    getCommandNames() {
        return this.#getApplication().getCommandNames().sort();
    }

    completer = async (line: string): Promise<[string[], string]> => {
        const commands = this.getCommandNames();
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
                return this.#completeWithOptions(current, this.getCommandNames());
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
        try {
            const files = await this.readDirEntryNames(current, directoriesOnly ? vscode.FileType.Directory : undefined);
            return this.#completeWithOptions(
                current,
                files.map((f) => (f.startsWith('-') ? `./${f}` : f)),
            );
        } catch {
            return [];
        }
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

    #cmdEnv(filter?: string[] | undefined) {
        consoleDebug('Repl.cmdEnv');
        this.log('Environment:');
        const entries = Object.entries(process.env)
            .filter(([key]) => !filter || filter.find((f) => key.toLowerCase().includes(f)))
            .sort((a, b) => a[0].localeCompare(b[0]));
        for (const [key, value] of entries) {
            this.log(`${green(key)}${yellow('=')}${value}`);
        }
    }

    async #cmdTrace(args: { word?: string | undefined }, options: { all?: boolean | undefined }) {
        consoleDebug('Repl.cmdTrace %o', args);
        const { word } = args;
        if (!word) {
            this.log('No word specified.');
            return;
        }
        const result = await traceWord(word, this.#cwd, { ...camelize(options), width: this.width });
        this.log('%s', result);
    }

    get width() {
        return this.#dimensions?.columns || defaultWidth;
    }

    async #cmdLs(args: { paths?: string[] | undefined }) {
        consoleDebug('Repl.cmdLs %o', args);

        await cmdLs(args.paths, { log: this.log, cwd: this.#cwd, cancellationToken: this.#getCancellationTokenForAction() });
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
            const dirUri = resolvePath(path, this.#cwd);
            const s = await vscode.workspace.fs.stat(dirUri);
            if (s.type & vscode.FileType.Directory) {
                this.#cwd = dirUri;
            } else {
                throw vscode.FileSystemError.FileNotADirectory(dirUri);
            }
        } catch (e) {
            if (e instanceof vscode.FileSystemError) {
                this.log(`"${path}" is not a valid directory.`);
                return;
            }
            this.log('Error: %o', e);
        }
    }

    async #cmdSuggestions(word: string | undefined, _options: { max?: number | undefined }) {
        if (!word) return;
        const result = await cmdSuggestions(word, this.#cwd);
        this.log('%s', result);
    }

    close = () => {
        consoleDebug('Repl.close');
        if (this.#closed) return;
        this.#closed = true;
        this.#cancellationTokenSource?.cancel();
        this.#controller.abort();
        this.#rl?.close();
        this.#readStream.destroy();
        this.#writeStream.destroy();
        this.#emitterOnDidClose.fire();
        this.#cancellationTokenSource?.dispose();
        this.#cancellationTokenSource = undefined;
    };

    log: typeof console.log = (...args) => this.#output(crlf(formatWithOptions({ colors: true }, ...args) + '\n'));
    error: typeof console.error = (...args) => this.#output(red('Error: ') + crlf(formatWithOptions({ colors: true }, ...args) + '\n'));

    #cancelAction = () => this.#cancellationTokenSource?.cancel();

    #createCancellationTokenForAction(): vscode.CancellationToken {
        return this.#createCancellationTokenSourceForAction().token;
    }

    #getCancellationTokenForAction(): vscode.CancellationToken {
        return this.#cancellationTokenSource?.token || this.#createCancellationTokenForAction();
    }

    #createCancellationTokenSourceForAction(): vscode.CancellationTokenSource {
        this.#cancellationTokenSource?.dispose();
        const t = abortControllerToCancellationTokenSource(this.#controller);
        this.#cancellationTokenSource = t;
        return t;
    }
}

function abortControllerToCancellationTokenSource(ac: AbortController): vscode.CancellationTokenSource {
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
