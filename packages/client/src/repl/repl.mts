import assert from 'node:assert';
import readline from 'node:readline/promises';
import stream from 'node:stream';
import { formatWithOptions } from 'node:util';

import styles from 'ansi-styles';
import { parseArgsStringToArgv } from 'string-argv';
import * as vscode from 'vscode';
import type { Arguments } from 'yargs';
import yargs from 'yargs';

export function createTerminal() {
    const pty = new Repl();
    const terminal = vscode.window.createTerminal({ name: 'Spell Checker REPL', pty });
    terminal.show();
}

const debugMode = true;

const consoleError: typeof console.error = debugMode ? console.error : () => undefined;

const commands = ['check', 'cd', 'ls', 'pwd', 'exit', 'help', 'trace', 'echo'].sort();

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

    constructor() {}

    open(dimensions: vscode.TerminalDimensions | undefined) {
        consoleError('Repl.open');
        assert(!this.#rl, 'Repl already open');
        assert(!this.#closed, 'Repl already closed');
        this.#rl = readline.createInterface({
            input: this.#readStream,
            output: this.#writeStream,
            completer: this.completer,
            terminal: true,
        });
        const rl = this.#rl;
        rl.on('SIGTSTP', () => undefined);
        rl.on('SIGINT', this.#cancelAction);
        rl.on('close', () => (consoleError('rl close'), this.close()));
        rl.on('line', this.#processLine);
        if (dimensions) {
            this.#prompt();
        }
    }

    setDimensions() {
        consoleError('Repl.setDimensions');
        this.#updatePrompt();
    }

    dispose = () => {
        consoleError('Repl.dispose');
        this.close();
    };

    #processLine = (line: string) => {
        consoleError('Repl.processLine %o', { line, args: parseArgsStringToArgv(line) });

        const parseAsync = async () => {
            await this.#argsParser(line).parseAsync();
        };

        this.#prompt(parseAsync());
    };

    #argsParser(line: string) {
        const argv = parseArgsStringToArgv(line);

        return yargs(argv)
            .scriptName('')
            .version(false)
            .command<{ globs?: string[] }>({
                command: 'check [globs...]',
                describe: 'Spell check the files matching the globs.',
                handler: async (args) => {
                    await this.#cmdCheck(args.globs);
                },
            })
            .command<{ values?: string[] }>({
                command: 'echo [values...]',
                describe: 'Echo the values.',
                handler: async (args) => {
                    await this.#cmdEcho(args.values);
                },
            })
            .command<{ word: string }>({
                command: 'trace <word>',
                describe: 'Trace which dictionaries contain the word.',
                handler: (args) => {
                    this.log('Tracing... %o', args);
                },
            })
            .command({
                command: 'pwd',
                describe: 'Print the current working directory.',
                handler: () => this.#cmdPwd(),
            })
            .command<{ path?: string }>({
                command: 'cd <path>',
                describe: 'Change the current working directory.',
                handler: (args) => this.#cmdCd(args.path),
            })
            .command<{ path?: string }>({
                command: 'ls',
                describe: 'List the directory contents.',
                handler: (args) => this.#cmdLs(args.path),
            })
            .command({
                command: 'exit',
                describe: 'Exit the REPL.',
                handler: () => {
                    this.log('Exiting...');
                    this.close();
                },
            })
            .command<{ command?: string }>({
                command: 'help [command]',
                describe: 'Show help.',
                handler: async (args) => {
                    this.#argsParser(args.command || '').showHelp((text) => this.log(text));
                },
            })
            .help(false)
            .exitProcess(false)
            .fail((msg, err, _yargs) => {
                this.log('Error: %o', { msg, err });
            });
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
        };
        p();
    }

    #updatePrompt() {
        this.#rl?.setPrompt(`${wd(this.#cwd)} > `);
    }

    async #cmdCheck(globs: string[] | undefined) {
        consoleError('Repl.cmdCheck');
        let pattern: string | undefined;
        if (globs?.length) {
            const patterns = globs.map((g) => g.trim()).filter((g) => g);
            if (patterns.length) {
                pattern = patterns.length > 1 ? `{${patterns.join(',')}}` : patterns[0];
            }
        } else {
            pattern = await this.#rl?.question('File glob pattern: ', this.#abortable);
        }
        if (!pattern) return;

        this.log('Checking...');

        const files = await globSearch(pattern, currentDirectory(), this.#createCancelationTokenForAction());
        files.forEach((f) => this.#output(`File: ${colorText(vscode.workspace.asRelativePath(f, true))}\r\n`));
    }

    async #cmdEcho(globs: string[] | undefined) {
        consoleError('Repl.cmdEcho');
        this.log((globs || []).join(' '));
    }

    completer = async (line: string) => {
        const args = parseArgsStringToArgv(line);
        if (args.length === 1 && line === args[0]) {
            return this.#completeWithOptions(line, commands);
        }

        const parser = this.#argsParser(line);

        const current = await parser.completion('', this.#cmdCompletion).getCompletion(args);

        const lastItem = args[args.length - 1] || '';

        const completions = current.map((c) => line + (c.startsWith(lastItem) ? c.slice(lastItem.length) : c));

        return [completions, line];
    };

    #cmdCompletion = async (current: string, argv: Arguments) => {
        console.error('Repl.cmdCompletion %o', { current, argv });
        if (argv._.length === 1) return [current];
        switch (argv._[0]) {
            case 'check':
                return this.#cmdCheckCompletion(current, argv);
            case 'cd':
                return this.#cmdCdCompletion(current, argv);
            case 'ls':
                return this.#completeWithPath(current, argv, false);
            case 'help':
                return this.#completeWithOptions(current, commands);
        }
        return [];
    };

    #cmdCheckCompletion = async (current: string, argv: Arguments) => {
        if (argv._[0] !== 'check') return [];
        // console.error('Repl.cmdCheckCompletion %o', { current, argv });
        if (argv._.length === 1) return ['check '];

        return this.#completeWithPath(current, argv, false);
    };

    #cmdCdCompletion = async (current: string, argv: Arguments) => {
        if (argv._[0] !== 'cd') return [];
        // console.error('Repl.cmdCdCompletion %o', { current, argv });
        if (argv._.length === 1) return ['cd '];

        return this.#completeWithPath(current, argv, true);
    };

    #completeWithPath = async (current: string, _argv: Arguments, directoriesOnly: boolean) => {
        const files = await this.readDirEntryNames(directoriesOnly ? vscode.FileType.Directory : undefined);
        return this.#completeWithOptions(current, files);
    };

    #completeWithOptions = async (current: string, options: string[]) => {
        // console.error('Repl.completeWithOptions %o', { current, options });
        const matchingCommands = options.filter((c) => c.startsWith(current)).map((c) => c + ' ');
        const prefix = findLongestPrefix(matchingCommands);
        return [prefix && prefix !== current ? [prefix] : matchingCommands, current];
    };

    #cmdPwd() {
        consoleError('Repl.cmdPwd');
        this.log(this.#cwd?.toString(false) || 'No Working Directory');
    }

    async #cmdLs(_path: string | undefined) {
        consoleError('Repl.cmdLs');
        const files = await this.readDir();

        function decorate([name, fileType]: [string, vscode.FileType]): string {
            let show = fileType === vscode.FileType.Directory ? green(name) : name;
            if (name.startsWith('.')) {
                show = styles.dim.open + show + styles.dim.close;
            }
            return show;
        }

        files.map(decorate).forEach((name) => this.log(name));
    }

    async readDir() {
        return await vscode.workspace.fs.readDirectory(this.#cwd);
    }

    async readDirEntryNames(filterType?: vscode.FileType): Promise<string[]> {
        const filterFn = filterType ? ([, type]: [string, vscode.FileType]) => type === filterType : () => true;
        return (await this.readDir()).filter(filterFn).map(([name]) => name);
    }

    async #cmdCd(path?: string) {
        if (!path) {
            return this.#cmdPwd();
        }
        try {
            const newDir = vscode.Uri.joinPath(this.#cwd, path);
            const s = await vscode.workspace.fs.stat(newDir);
            if (s.type === vscode.FileType.Directory) {
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
        consoleError('Repl.close');
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

    #cancelAction = () => this.#cancelationTokenSource?.cancel();

    #createCancelationTokenForAction(): vscode.CancellationToken {
        return this.#createCancelationTokenSourceForAction().token;
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

function emitterToWriteStream(emitter: vscode.EventEmitter<string>): stream.Writable {
    return new stream.Writable({
        write: (chunk, _encoding, callback) => {
            emitter.fire(chunk.toString());
            callback();
        },
    });
}

class ReadableEmitter extends stream.Readable {
    private buffer: string[] = [];
    private paused = true;
    private disposable: vscode.Disposable;
    constructor(emitter: vscode.EventEmitter<string>) {
        super({});
        this.disposable = emitter.event((data) => {
            this.buffer.push(data);
            this.pushBuffer();
        });
    }

    _read() {
        this.paused = false;
        this.pushBuffer();
    }

    _destroy() {
        this.disposable.dispose();
    }

    private pushBuffer() {
        if (this.paused) return;
        for (let data = this.buffer.shift(); data !== undefined && !this.paused; data = this.buffer.shift()) {
            this.push(data);
        }
    }
}

function emitterToReadStream(emitter: vscode.EventEmitter<string>): stream.Readable {
    return new ReadableEmitter(emitter);
}

function wd(uri: vscode.Uri | undefined): string | undefined {
    return uri && vscode.workspace.asRelativePath(uri, true);
}

function currentDirectory(): vscode.Uri {
    return vscode.workspace.workspaceFolders?.[0].uri || uriParent(getCurrentDocumentUri()) || vscode.Uri.file('.');
}

function getCurrentDocumentUri(): vscode.Uri | undefined {
    const editor = vscode.window.activeTextEditor;
    return editor?.document.uri;
}

function uriParent(uri: vscode.Uri | undefined): vscode.Uri | undefined {
    return uri && vscode.Uri.joinPath(uri, '..');
}

async function globSearch(
    pattern: string,
    base: vscode.Uri | undefined,
    cancelationToken?: vscode.CancellationToken,
): Promise<vscode.Uri[]> {
    const pat = base ? new vscode.RelativePattern(base, pattern) : pattern;
    return await vscode.workspace.findFiles(pat, undefined, undefined, cancelationToken);
}

function green(text: string): string {
    return styles.green.open + text + styles.green.close;
}

function crlf(text: string): string {
    return text.replace(/\n/g, '\r\n').replace(/\r+\r/g, '\r');
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
