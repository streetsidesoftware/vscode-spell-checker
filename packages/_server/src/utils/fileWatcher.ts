import watch from 'node-watch';
import { FSWatcher } from 'fs';
import { Disposable } from 'vscode-languageserver/node';

export type Listener = (eventType?: string, filename?: string) => void;

export class FileWatcher implements Disposable {
    private watchedFile = new Map<string, FSWatcher>();
    private listeners = new Set<Listener>();

    readonly dispose = (): void => {
        this.clear();
    };

    readonly trigger: Listener = (eventType?: string, filename?: string): void => {
        this.notifyListeners(eventType, filename);
    };

    listen(fn: Listener): Disposable {
        this.listeners.add(fn);
        return {
            dispose: () => {
                this.listeners.delete(fn);
            },
        };
    }

    addFile(filename: string): void {
        if (!this.watchedFile.has(filename)) {
            this.watchedFile.set(filename, watch(filename, { persistent: false }, this.trigger));
        }
    }

    clearFile(filename: string): void {
        this.watchedFile.get(filename)?.close();
        this.watchedFile.delete(filename);
    }

    clear(): void {
        for (const w of this.watchedFile.values()) {
            w.close();
        }
        this.watchedFile.clear();
    }

    private notifyListeners(eventType?: string, filename?: string) {
        for (const listener of this.listeners) {
            listener(eventType, filename);
        }
    }
}
