import assert from 'node:assert';

import type { EmitterEvent, EventEmitter, EventListener } from '@internal/common-utils';
import { createEmitter } from '@internal/common-utils';
import type { Disposable, FileSystemWatcher } from 'vscode';
import { RelativePattern, Uri, workspace } from 'vscode';

import type { Memento } from './memento.mjs';

interface MementoFileData<T> {
    id: 'memento';
    /** the file format version */
    v: 'v1';
    /** the timestamp */
    ts: number;
    /** a signature used to check changes. */
    signature: string;
    data: T;
}

export class MementoFile<T> implements Memento<T>, Disposable {
    #data: T | undefined;
    #emitter: EventEmitter<readonly (keyof T)[] | undefined>;
    /**
     * The signature of the memento. It is changed when the memento is updated.
     * It is used to check if the memento has changed.
     */
    #signature: string | undefined;
    #watcher: FileSystemWatcher;

    constructor(
        readonly uri: Uri,
        data: MementoFileData<T> | undefined,
    ) {
        this.#data = data?.data;
        this.#signature = data?.signature;
        assert(!data || data.id === 'memento', 'Invalid memento data');
        this.#emitter = createEmitter();
        this.#watcher = watchFile(uri, this.#handleFileChange.bind(this));
    }

    keys(): readonly (keyof T)[] {
        return this.#data ? (Object.keys(this.#data) as (keyof T)[]) : [];
    }

    get<K extends keyof T>(key: K): T[K] | undefined;
    get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
    get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] | undefined {
        return (this.#data ? this.#data[key] : undefined) ?? defaultValue;
    }

    async update<K extends keyof T>(key: K, value: T[K] | undefined): Promise<void>;
    async update(data: Partial<T>): Promise<void>;
    async update<K extends keyof T>(keyOrData: K | Partial<T>, value?: T[K] | undefined): Promise<void> {
        const keys: (keyof T)[] = [];
        if (typeof keyOrData === 'string') {
            const key: K = keyOrData;
            this.#data = this.#data ?? ({} as T);
            if (value === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this.#data[key];
            } else {
                this.#data[key] = value;
            }
            keys.push(key);
        } else {
            const data = keyOrData as Partial<T>;
            keys.push(...(Object.keys(data) as K[]));
            this.#data = { ...this.#data, ...data } as T;
        }
        this.#signature = `s${performance.now()}/${performance.now()}`;
        await MementoFile.#save(this.uri, {
            id: 'memento',
            v: 'v1',
            ts: Date.now(),
            signature: this.#signature,
            data: this.#data,
        });
        this.#emitter.fire(keys);
    }

    onDidChange(listener: EventListener<readonly (keyof T)[] | undefined>): ReturnType<EmitterEvent<unknown>> {
        return this.#emitter.event(listener);
    }

    dispose: () => void = () => {
        this.#watcher.dispose();
    };

    #handleFileChange(_uri: Uri) {
        // const a = uri.path.toLowerCase();
        // const b = this.uri.path.toLowerCase();
        // if (a !== b) {
        //     console.error(`Invalid file change: '${a}' !== '${b}'`);
        // }
        this.#loadData().catch(() => undefined);
    }

    async #loadData() {
        const data = await MementoFile.#load<T>(this.uri);
        if (!data) {
            this.#data = undefined;
            return;
        }
        if (data.signature === this.#signature) return;

        this.#data = data.data;
        this.#signature = data.signature;
        this.#emitter.fire(undefined);
    }

    static async #save<T>(uri: Uri, data: MementoFileData<T>): Promise<void> {
        const content = JSON.stringify(data, null, 2);
        await workspace.fs.createDirectory(Uri.joinPath(uri, '..'));
        await workspace.fs.writeFile(uri, Buffer.from(content));
    }

    static async #load<T>(uri: Uri): Promise<MementoFileData<T> | undefined> {
        try {
            const buffer = await workspace.fs.readFile(uri);
            const dc = new TextDecoder();
            const content = dc.decode(buffer);
            return JSON.parse(content);
        } catch {
            return undefined;
        }
    }

    static async createMemento<T>(uri: Uri): Promise<MementoFile<T>> {
        const data = await MementoFile.#load<T>(uri);
        return new MementoFile<T>(uri, data);
    }
}

function watchFile(uri: Uri, listener: (uri: Uri) => void): FileSystemWatcher {
    const dir = Uri.joinPath(uri, '..');
    const base = uri.path.split('/').slice(-1).join('');
    const watcher = workspace.createFileSystemWatcher(new RelativePattern(dir, base));
    watcher.onDidChange(listener);
    watcher.onDidCreate(listener);
    watcher.onDidDelete(listener);
    return watcher;
}
