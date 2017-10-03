const watch = require('node-watch');

export type Events = 'update' | 'remove' | 'error';

interface Watcher{
    close: () => void;
}

export type Callback = (name: string, event: Events) => void;

interface FileWatcher {
    watcher: Watcher;
    callbacks: Set<Callback>;
}

const watchedFiles = new Map<string, FileWatcher>();

function listener(event: Events, name: string) {
    const watcher = watchedFiles.get(name);
    if (watcher) {
        watcher.callbacks.forEach(fn => fn(name, event));
    }
}

export function isWatching(fileName: string) {
    return !!watchedFiles.get(fileName);
}

export function stopWatching(fileName: string) {
    const watcher = watchedFiles.get(fileName);
    if (watcher) {
        watchedFiles.delete(fileName);
        watcher.watcher.close();
    }
}

export function add(fileName: string, callback: Callback) {
    if (!watchedFiles.has(fileName)) {
        watchedFiles.set(fileName, {
            watcher: watch(fileName, listener) as Watcher,
            callbacks: new Set<Callback>(),
        });
    }
    const watcher = watchedFiles.get(fileName);
    watcher!.callbacks.add(callback);
}

export function dispose() {
    for (const w of watchedFiles.values()) {
        w.watcher.close();
    }
    watchedFiles.clear();
}
