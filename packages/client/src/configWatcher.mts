import { opMap, pipe } from '@cspell/cspell-pipe/sync';
import { defaultConfigFilenames } from 'cspell-lib';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, Event, Uri } from 'vscode';
import * as vscode from 'vscode';

export interface ConfigWatcher extends Disposable {
    on: Event<Uri>;
    onDidChangeConfig: Event<Uri>;
    scanWorkspaceForConfigFiles(cancellationToken?: vscode.CancellationToken): Promise<Uri[]>;
}

export function createConfigWatcher(): ConfigWatcher {
    return new ConfigWatcherImpl();
}

const excludeConfigFiles = new Set(['cspell.yml', 'cspell.yaml', '.cspell.yml', '.cspell.yaml']);

class ConfigWatcherImpl implements ConfigWatcher {
    #disposables = createDisposableList(undefined, 'ConfigWatcher');
    #watcher: vscode.FileSystemWatcher | undefined;
    #emitter = new vscode.EventEmitter<Uri>();
    #configFileNames: string[] = getConfigFileNames();

    constructor() {
        this.#disposables.push(this.#emitter);
    }

    dispose() {
        this.#disposables.dispose();
        this.#watcher = undefined;
    }

    get on() {
        return this.onDidChangeConfig;
    }

    get onDidChangeConfig() {
        this.#createWatcher();
        return this.#emitter.event;
    }

    #createWatcher() {
        if (this.#watcher) return this.#watcher;
        const watcher = vscode.workspace.createFileSystemWatcher(`**/{${this.#configFileNames.join(',')}}`);
        this.#disposables.push(
            watcher,
            watcher.onDidChange(this.#onConfigChange),
            watcher.onDidCreate(this.#onConfigChange),
            watcher.onDidDelete(this.#onConfigChange),
        );

        this.#watcher = watcher;
        return watcher;
    }

    #onConfigChange = (uri: vscode.Uri) => {
        this.#emitter.fire(uri);
    };

    async scanWorkspaceForConfigFiles(cancellationToken?: vscode.CancellationToken): Promise<Uri[]> {
        // console.log('scanWorkspaceForConfigFiles %o', this.#configFileNames);

        const found = await vscode.workspace.findFiles(
            `**/{${this.#configFileNames.join(',')}}`,
            '**/node_modules/**',
            undefined,
            cancellationToken,
        );

        const pkgUris = found.filter((uri) => uri.path.endsWith('/package.json'));
        const result: Uri[] = found.filter((uri) => !uri.path.endsWith('/package.json'));

        const pkgUrisWidthConfig = pipe(
            pkgUris,
            prefetchIterable(3),
            opMap((uri) => ({ uri, hasConfig: filterPackageJson(uri) })),
        );

        for (const { uri, hasConfig } of pkgUrisWidthConfig) {
            if (await hasConfig) {
                result.push(uri);
            }
        }

        return result;
    }
}

async function filterPackageJson(uri: vscode.Uri): Promise<boolean> {
    if (!uri.path.endsWith('/package.json')) return true;

    try {
        const decoder = new TextDecoder();
        const pkgRaw = decoder.decode(await vscode.workspace.fs.readFile(uri));
        const pkg = JSON.parse(pkgRaw);
        return 'cspell' in pkg;
    } catch {
        return false;
    }
}

function prefetchIterable<T>(size: number): (iterable: Iterable<T>) => Iterable<T> {
    function* fn(iterable: Iterable<T>): Iterable<T> {
        const buffer: T[] = [];

        for (const value of iterable) {
            buffer.push(value);
            if (buffer.length >= size - 1) {
                const value = buffer[0];
                buffer.shift();
                yield value;
            }
        }

        yield* buffer;
    }

    return fn;
}

function getConfigFileNames() {
    const cfgFileNames = new Set<string>();

    for (const cfg of defaultConfigFilenames) {
        const parts = cfg.split('/');
        if (parts.length === 1) {
            if (!excludeConfigFiles.has(cfg)) {
                cfgFileNames.add(cfg);
            }
            continue;
        }
        const tail = parts[parts.length - 1];
        if (!cfgFileNames.has(tail)) {
            cfgFileNames.add(cfg);
        }
    }

    return [...cfgFileNames];
}
