import { FSWatcher } from 'fs';
import nodeWatch from 'node-watch';
import { Mock, vi } from 'vitest';

type NodeWatch = typeof nodeWatch;

export interface NodeWatchMock extends Mock<unknown[], NodeWatch> {
    __trigger(eventType: 'update' | 'remove' | undefined, filename: string): void;
    __getWatchers(filename?: string): Watcher[];
    __reset(): void;
}

type WatcherCallback = (eventType?: 'update' | 'remove', filename?: string) => void;
type FilterReturn = boolean | symbol;

interface Watcher extends FSWatcher {
    /**
     * Returns `true` if the watcher has been closed.
     */
    isClosed(): boolean;

    /**
     * Returns all watched paths.
     */
    getWatchedPaths(): Array<string>;

    callback: WatcherCallback | undefined;
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

const callbacks = new Map<string, Set<Watcher>>();

function getWatchedPaths() {
    return [...callbacks.keys()];
}

function addCallback(pathName: string): Watcher;
function addCallback(pathName: string, options: Options): Watcher;
function addCallback(pathName: string, callback: WatcherCallback): Watcher;
function addCallback(pathName: string, options: Options, callback: WatcherCallback): Watcher;
function addCallback(pathName: string, options?: Options | WatcherCallback, callback?: WatcherCallback): Watcher {
    if (typeof options === 'function') {
        callback = options;
    }

    let isClosed = false;
    const watcher: Watcher = {
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
    };

    function defaultImpl(): Watcher {
        return watcher;
    }

    const cb = callbacks.get(pathName) || new Set<Watcher>();
    cb.add(watcher);
    callbacks.set(pathName, cb);
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

function getWatchers(filename: string | undefined): Watcher[] {
    if (!filename) {
        return [...callbacks.keys()].map(getWatchers).reduce((acc, cur) => acc.concat(cur), []);
    }
    return [...(callbacks.get(filename)?.values() || [])];
}

function reset() {
    callbacks.clear();
}

const mock = vi.fn<[string, Options | WatcherCallback | undefined, WatcherCallback | undefined], Watcher>().mockImplementation(addCallback);

const mockWatcher: NodeWatchMock = mock as unknown as NodeWatchMock;
mockWatcher.__trigger = trigger;
mockWatcher.__getWatchers = getWatchers;
mockWatcher.__reset = reset;

export default mock;
