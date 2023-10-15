import { logError } from '@internal/common-utils/log';
import { toFileUri } from '@internal/common-utils/uriHelper';
import type { FSWatcher } from 'fs';
import { format } from 'util';
import type { Disposable } from 'vscode-languageserver/node.js';

import { nodeWatch } from './nodeWatch.cjs';

export type KnownEvents = 'change' | 'error' | 'close';
export type EventType = KnownEvents | string;

export type Listener = (eventType?: EventType, filename?: string) => void;

type Watcher = Pick<FSWatcher, 'close'>;

export class FileWatcher implements Disposable {
    private watchedFile = new Map<string, Watcher>();
    private listeners = new Set<Listener>();

    /**
     * Stops watching all files.
     */
    readonly dispose = (): void => {
        this.clear();
    };

    /**
     * Trigger an event - exposed for testing.
     * @param eventType - event to trigger
     * @param filename - filename to trigger
     */
    readonly trigger: Listener = (eventType?: EventType, filename?: string): void => {
        this.notifyListeners(eventType, filename);
    };

    /**
     * Add a listener
     * @param fn - function to be called when a file has changed.
     * @returns disposable
     */
    listen(fn: Listener): Disposable {
        this.listeners.add(fn);
        return {
            dispose: () => {
                this.listeners.delete(fn);
            },
        };
    }

    /**
     * Add a file to watch
     * @param filename - absolute path to file to be watched
     * @returns true if it is able to watch the file.
     */
    addFile(filename: string): boolean {
        if (!this.watchedFile.has(filename)) {
            try {
                this.watchedFile.set(filename, watch(filename, this.trigger));
            } catch (e) {
                logError(format(e));
                return false;
            }
        }
        return true;
    }

    /**
     * Stops watching a file.
     * @param filename - absolute path to file to stop watching
     */
    clearFile(filename: string): void {
        this.watchedFile.get(filename)?.close();
        this.watchedFile.delete(filename);
    }

    /**
     * Stops watching all files.
     */
    clear(): void {
        for (const w of this.watchedFile.values()) {
            w.close();
        }
        this.watchedFile.clear();
    }

    /**
     * the list of watched files
     */
    get watchedFiles(): string[] {
        return [...this.watchedFile.keys()];
    }

    private notifyListeners(eventType?: EventType, filename?: string) {
        for (const listener of this.listeners) {
            listener(eventType, filename);
        }
    }
}

function watch(filename: string, callback: (eventType?: EventType, filename?: string) => void): Watcher {
    const uri = toFileUri(filename);
    if (uri.scheme === 'file') {
        return nodeWatch(filename, { persistent: false }, callback);
    }

    return {
        close() {
            callback('close', filename);
        },
    };
}
