import { logError } from '@internal/common-utils/log';
import { format } from 'util';
import type { Disposable } from 'vscode-languageserver/node.js';

import type { EventType, Listener, Watcher } from './watchFile.mjs';
import { watchFile } from './watchFile.mjs';

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
    readonly trigger = (eventType?: EventType, filename?: string | null): void => {
        filename ??= undefined;
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
                this.watchedFile.set(filename, watchFile(filename, this.trigger));
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
            try {
                w.close();
            } catch (_e) {
                // ignore
            }
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
