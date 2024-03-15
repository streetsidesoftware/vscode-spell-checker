import assert from 'node:assert';
import readline from 'node:readline/promises';
import stream from 'node:stream';
import { formatWithOptions } from 'node:util';

import styles from 'ansi-styles';
import * as vscode from 'vscode';
import yargs from 'yargs';

import { commandLineBuilder, parseCommandLineIntoArgs } from './parseCommandLine.js';

export function createTerminal() {
    const pty = new Repl();
    const terminal = vscode.window.createTerminal({ name: 'Spell Checker REPL', pty });
    terminal.show();
}

const debugMode = true;

const consoleDebug: typeof console.error = debugMode ? console.debug : () => undefined;

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
        consoleDebug('Repl.open');
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
        rl.on('close', () => (consoleDebug('rl close'), this.close()));
        rl.on('line', this.#processLine);
        if (dimensions) {
            this.log('CSpell REPL');
            this.log('Type "help" or "?" for help.');
            this.#prompt();
        }
    }

    setDimensions() {
        consoleDebug('Repl.setDimensions');
        this.#updatePrompt();
    }

    dispose = () => {
        consoleDebug('Repl.dispose');
        this.close();
    };

    #processLine = (line: string) => {
        consoleDebug('Repl.processLine %o', { line, args: parseCommandLineIntoArgs(line) });

        const parseAsync = async () => {
            if (line === '?') {
                await this.#argsParser('').showHelp((text) => this.log(text));
                return;
            }
            this.#createCancelationTokenForAction();
            await this.#argsParser(line).parseAsync();
        };

        this.#prompt(parseAsync());
    };

    #argsParser(line: string) {
        const argv = parseCommandLineIntoArgs(line);

        return (
            yargs(argv)
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
                .command<{ paths?: string[] }>({
                    command: 'ls [paths...]',
                    describe: 'List the directory contents.',
                    handler: (args) => this.#cmdLs(args.paths),
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
                // .exitProcess(false)
                .fail((msg, err, _yargs) => {
                    this.error('%o', { msg, err });
                })
        );
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
        this.#rl?.setPrompt(`cspell ${green(wd(vscode.Uri.joinPath(this.#cwd, '/')) || '')} > `);
    }

    async #cmdCheck(globs: string[] | undefined) {
        consoleDebug('Repl.cmdCheck');
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

        const files = await globSearch(pattern, currentDirectory(), this.#getCancelationTokenForAction());
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

    async #cmdLs(paths: string[] | undefined) {
        consoleDebug('Repl.cmdLs');

        const readDirEntries = async () => {
            if (!paths?.length) return await this.readDir();
            const results: DirEntry[] = [];
            for (const p of paths) {
                try {
                    results.push(...(await this.searchDir(p)));
                } catch {
                    this.error(`"${p}" is not a valid file or directory.`);
                }
            }
            return results;
        };

        const files = await readDirEntries();
        files.map(decorate).forEach((name) => this.log(name));

        function decorate([name, fileType]: DirEntry): string {
            let show = fileType === vscode.FileType.Directory ? green(name) : name;
            if (name.startsWith('.')) {
                show = styles.dim.open + show + styles.dim.close;
            }
            return show;
        }
    }

    async readDir(relUri?: string | vscode.Uri | undefined): Promise<DirEntry[]> {
        const uri = typeof relUri === 'string' ? vscode.Uri.joinPath(this.#cwd, relUri) : relUri || this.#cwd;
        return await vscode.workspace.fs.readDirectory(uri);
    }

    async searchDir(pattern: string, base?: vscode.Uri): Promise<DirEntry[]> {
        const [searchPattern, searchBase] = normalizePatternBase(pattern, base || this.#cwd);

        consoleDebug('Repl.searchDir %o', { searchPattern, searchBase });

        const files = await globSearch(searchPattern || '*', searchBase, this.#getCancelationTokenForAction());
        const stats = await readStatsForFiles(files, this.#getCancelationTokenForAction());
        const basePath = searchBase.path;

        const dirEntries = stats.map(([uri, stat]) => {
            const relPath = uri.path.slice(basePath.length + 1);
            return [relPath, stat.type] as DirEntry;
        });
        return dirEntries;
    }

    async readDirEntryNames(relativePartialPath: string, filterType?: vscode.FileType): Promise<string[]> {
        const relPath = relativePartialPath.split('/').slice(0, -1).join('/');
        const filterFn = filterType ? ([, type]: Readonly<[string, vscode.FileType]>) => type === filterType : () => true;
        const defaultDir: DirEntry[] = relPath ? [] : [['..', vscode.FileType.Directory]];

        const relPrefix = relPath ? relPath + '/' : '';

        const dirInfo = [...defaultDir, ...(await this.readDir(relPath)).map(([name, type]) => [relPrefix + name, type] as DirEntry)]
            .filter(filterFn)
            .map(([name, type]) => name + (type === vscode.FileType.Directory ? '/' : ''));
        return dirInfo;
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

function emitterToWriteStream(emitter: vscode.EventEmitter<string>): stream.Writable {
    return new stream.Writable({
        write: (chunk, _encoding, callback) => {
            emitter.fire(chunk.toString());
            callback();
        },
    });
}

type DirEntry = [string, vscode.FileType];

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
    if (!uri) return;
    const uriHref = uri.toString().replace(/\/$/, '');
    const folder = vscode.workspace.workspaceFolders?.find((f) => f.uri.toString() === uriHref);
    if (folder) return folder.name + '/';
    return vscode.workspace.asRelativePath(uri, true);
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
    consoleDebug('globSearch %o', { pattern, base, cancelationToken });
    const pat = base ? new vscode.RelativePattern(base, pattern) : pattern;
    const result = await vscode.workspace.findFiles(pat, undefined, undefined, cancelationToken);
    if (cancelationToken?.isCancellationRequested) {
        consoleDebug('globSearch cancelled');
    }
    return result;
}

function green(text: string): string {
    return styles.green.open + text + styles.green.close;
}

function red(text: string): string {
    return styles.red.open + text + styles.red.close;
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

function normalizePatternBase(pattern: string, base: vscode.Uri): [string, vscode.Uri] {
    if (pattern.startsWith('/')) {
        pattern = pattern.slice(1);
        base = vscode.Uri.joinPath(base, '/');
    }
    const relPatterns = ['..', '.'];
    const parts = pattern.split('/');
    let i = 0;
    for (; i < parts.length && relPatterns.includes(parts[i]); ++i) {
        base = vscode.Uri.joinPath(base, parts[i]);
    }
    return [parts.slice(i).join('/'), base];
}

type UriStats = [vscode.Uri, vscode.FileStat];

async function readStatsForFiles(uris: vscode.Uri[], cancelationToken: vscode.CancellationToken): Promise<UriStats[]> {
    consoleDebug('readStatsForFiles %o', { uris: uris.slice(0, 100), length: uris.length, cancelationToken });
    if (cancelationToken.isCancellationRequested) {
        consoleDebug('readStatsForFiles cancelled before starting.');
        return [];
    }

    const results: UriStats[] = [];

    const statsRequests = uris.map((uri) => async () => [uri, await vscode.workspace.fs.stat(uri)] as UriStats);

    for await (const result of asyncQueue(statsRequests, 10)) {
        if (cancelationToken.isCancellationRequested) {
            consoleDebug('readStatsForFiles cancelled');
            break;
        }
        results.push(result);
    }

    return results;
}

async function* asyncQueue<T>(fnValues: Iterable<() => T | Promise<T>>, maxQueue = 10): AsyncIterable<T> {
    function* buffered() {
        let done = false;
        const buffer: Promise<T>[] = [];
        const iter = fnValues[Symbol.iterator]();

        function fill() {
            while (buffer.length < maxQueue) {
                const next = iter.next();
                done = !!next.done;
                if (done) return;
                if (next.done) return;
                buffer.push(Promise.resolve(next.value()));
            }
        }

        fill();

        while (!done && buffer.length) {
            yield buffer[0];
            buffer.shift();
            fill();
        }

        yield* buffer;
    }

    for await (const value of buffered()) {
        yield value;
    }
}
