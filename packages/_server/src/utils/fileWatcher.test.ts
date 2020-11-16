import watch from 'node-watch';
import { FSWatcher } from 'fs';
import { FileWatcher } from './fileWatcher';

jest.mock('node-watch');

const mockWatch = watch as jest.MockedFunction<typeof watch>;

describe('Validate FileWatcher', () => {
    beforeEach(() => {
        mockWatch.mockClear();
    });

    test('', () => {
        const mockInfo = implementWatch();
        const watcher = new FileWatcher();
        const listener = jest.fn();
        const listener2 = jest.fn();
        const dListener = watcher.listen(listener);
        watcher.addFile('file1');
        watcher.addFile('file2');
        watcher.addFile('file3');

        // Add the same file twice
        watcher.addFile('file2');

        mockInfo.trigger('update', 'file1');
        mockInfo.trigger('update', 'file2');
        watcher.listen(listener2);
        mockInfo.trigger('remove', 'file2');

        // stop watching file1
        watcher.clearFile('file1');
        mockInfo.trigger('update', 'file1');

        // just for fun
        watcher.clearFile('file1');

        dListener.dispose();
        // trigger again to see if the listener was called.
        mockInfo.trigger('update', 'file3');
        watcher.dispose();

        expect(mockWatch).toHaveBeenNthCalledWith(1, 'file1', expect.objectContaining({ persistent: false }), expect.any(Function));
        expect(mockWatch).toHaveBeenNthCalledWith(2, 'file2', expect.objectContaining({ persistent: false }), expect.any(Function));
        expect(mockWatch).toHaveBeenNthCalledWith(3, 'file3', expect.objectContaining({ persistent: false }), expect.any(Function));
        expect(mockWatch).toHaveBeenCalledTimes(3);

        expect(listener).toHaveBeenNthCalledWith(1, 'update', 'file1');
        expect(listener).toHaveBeenNthCalledWith(2, 'update', 'file2');
        expect(listener).toHaveBeenNthCalledWith(3, 'remove', 'file2');
        expect(listener).toHaveBeenCalledTimes(3);

        expect(listener2).toHaveBeenNthCalledWith(1, 'remove', 'file2');
        expect(listener2).toHaveBeenNthCalledWith(2, 'update', 'file3');
        expect(listener2).toHaveBeenCalledTimes(2);

        expect(mockInfo.getWatchers('file1')[0].isClosed()).toBe(true);
        expect(mockInfo.getWatchers('file2')[0].isClosed()).toBe(true);
        expect(mockInfo.getWatchers('file3')[0].isClosed()).toBe(true);
    });
});

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

function implementWatch() {
    const mock = mockWatch;
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
            close: jest.fn(() => {
                isClosed = true;
            }),
            isClosed: () => isClosed,
            callback,
            getWatchedPaths,
            addListener: jest.fn(),
            on: jest.fn(),
            once: jest.fn(),
            prependListener: jest.fn(),
            prependOnceListener: jest.fn(),
            removeAllListeners: jest.fn(),
            removeListener: jest.fn(),
            setMaxListeners: jest.fn(),
            off: jest.fn(),
            getMaxListeners: jest.fn(),
            listenerCount: jest.fn(),
            listeners: jest.fn(),
            emit: jest.fn(),
            rawListeners: jest.fn(),
            eventNames: jest.fn(),
        };

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

    function getWatchers(filename: string) {
        return [...(callbacks.get(filename)?.values() || [])];
    }

    mock.mockImplementation(addCallback);

    return {
        mock,
        callbacks,
        trigger,
        getWatchers,
    };
}
