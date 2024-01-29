import assert from 'assert';
import type { FSWatcher } from 'fs';
import type { MockedFunction } from 'vitest';
import { vi } from 'vitest';

// declare function watch(pathName: PathName): Watcher;
// declare function watch(pathName: PathName, options: Options): Watcher;
declare function watch(pathName: PathName, callback: Callback): Watcher;
// declare function watch(pathName: PathName, options: Options, callback: Callback): Watcher;

type Callback = (eventType?: string, filePath?: string | null) => any;
type PathName = string;
type FilterReturn = boolean | symbol;

interface WatcherInternal extends FSWatcher {
    /**
     * Returns `true` if the watcher has been closed.
     */
    isClosed(): boolean;

    /**
     * Returns all watched paths.
     */
    getWatchedPaths(): Array<string>;
}

type Watcher = Pick<FSWatcher, 'close'>;

type NodeWatch = typeof watch;

type MockedNodeWatch = MockedFunction<NodeWatch>;

export interface NodeWatchMock extends MockedNodeWatch {
    __trigger(eventType: 'update' | 'remove' | undefined, filename: string): void;
    __getWatchers(filename?: string): WatcherInternal[];
    __reset(): void;
}

type WatcherCallback = (eventType?: 'update' | 'remove', filename?: string) => void;

interface WatcherInternal extends FSWatcher {
    /**
     * Returns `true` if the watcher has been closed.
     */
    isClosed(): boolean;

    /**
     * Returns all watched paths.
     */
    getWatchedPaths(): Array<string>;

    callback?: WatcherCallback | undefined;
}

type Options = {
    /**
     * Indicates whether the process should continue to run
     * as long as files are being watched.
     * @default true
     */
    persistent?: boolean;

    /**
     * Indicates whether all subdirectories should be watched.
     * @default false
     */
    recursive?: boolean;

    /**
     * Specifies the character encoding to be used for the filename
     * passed to the listener.
     * @default 'utf8'
     */
    encoding?: string;

    /**
     * Only files which pass this filter (when it returns `true`)
     * will be sent to the listener.
     */
    filter?: RegExp | ((file: string, skip: symbol) => FilterReturn);

    /**
     * Delay time of the callback function.
     * @default 200
     */
    delay?: number;
};

export function addNodeWatchMockImplementation(mock: MockedNodeWatch): NodeWatchMock {
    const callbacks = new Map<string, Set<WatcherInternal>>();

    function getWatchedPaths() {
        return [...callbacks.keys()];
    }

    function addCallback(pathName: PathName): WatcherInternal;
    function addCallback(pathName: PathName, options: Options): WatcherInternal;
    function addCallback(pathName: PathName, callback: WatcherCallback): WatcherInternal;
    function addCallback(pathName: PathName, options: Options, callback: WatcherCallback): WatcherInternal;
    function addCallback(pathName: PathName, options?: Options | WatcherCallback, callback?: WatcherCallback): WatcherInternal {
        if (typeof options === 'function') {
            callback = options;
        }

        let isClosed = false;
        const watcher: WatcherInternal = {
            close: vi.fn(() => {
                isClosed = true;
            }),
            isClosed: () => isClosed,
            callback,
            getWatchedPaths,
            addListener: vi.fn(defaultImpl),
            on: vi.fn(defaultImpl),
            once: vi.fn(defaultImpl),
            prependListener: vi.fn(defaultImpl),
            prependOnceListener: vi.fn(defaultImpl),
            removeAllListeners: vi.fn(),
            removeListener: vi.fn(),
            setMaxListeners: vi.fn(),
            off: vi.fn(),
            getMaxListeners: vi.fn(),
            listenerCount: vi.fn(),
            listeners: vi.fn(),
            emit: vi.fn(),
            rawListeners: vi.fn(),
            eventNames: vi.fn(),
            ref: vi.fn(),
            unref: vi.fn(),
        };

        function defaultImpl(): WatcherInternal {
            return watcher;
        }

        const pathNames = Array.isArray(pathName) ? pathName : [pathName];

        for (const pathName of pathNames) {
            const cb = callbacks.get(pathName) || new Set<WatcherInternal>();
            cb.add(watcher);
            callbacks.set(pathName, cb);
        }

        return watcher;
    }

    function trigger(eventType: 'update' | 'remove' | undefined, filename: string) {
        const cb = callbacks.get(filename);
        if (!cb) {
            throw new Error(`Untracked file ${filename}`);
        }
        for (const c of cb) {
            if (c && !c.isClosed()) {
                c.callback?.(eventType, filename);
            }
        }
    }

    function getWatchers(filename: string | undefined): WatcherInternal[] {
        if (!filename) {
            return [...callbacks.keys()].map(getWatchers).reduce((acc, cur) => acc.concat(cur), []);
        }
        return [...(callbacks.get(filename)?.values() || [])];
    }

    function reset() {
        callbacks.clear();
    }

    mock.mockImplementation(addCallback);

    const mockWatcher: NodeWatchMock = mock as unknown as NodeWatchMock;
    mockWatcher.__trigger = trigger;
    mockWatcher.__getWatchers = getWatchers;
    mockWatcher.__reset = reset;

    return mockWatcher;
}

export function asNodeWatchMock(watcher: NodeWatch): NodeWatchMock {
    const mocked = watcher as unknown as NodeWatchMock;
    assert(typeof mocked.__trigger === 'function');
    return mocked;
}
