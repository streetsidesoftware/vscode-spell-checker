import type { Disposable } from 'vscode';
import { env, Uri } from 'vscode';

import { logErrors } from '../util/errorHandlers.js';
import { squelch } from '../util/errors.js';
import type { LogEntry, LogEntryBase } from './EventLog.mjs';
import { MementoFile } from './mementoFile.mjs';

export interface EventLogger {
    readonly eventLog: readonly LogEntryBase[];
    log(event: LogEntry): void;
    /**
     * Log that the extension was activated.
     */
    logActivate(): void;
    /**
     * Log a word replacement.
     * @param word - The word being replaced.
     * @param suggestion - The suggestion being used.
     */
    logReplace(word: string, suggestion: string): void;
    flush(): Promise<void>;
}

export function createReplaceEvent(word: string, suggestion: string): LogEntry {
    return [Date.now(), 0, 'replace', 1, word, suggestion];
}

export function createActivateEvent(): LogEntry {
    return [Date.now(), 0, 'activate', 1];
}

interface LocalEventLogData {
    machineId: string;
    ts: number;
    log: LogEntry[];
}

class EventLoggerImpl implements EventLogger, Disposable {
    #data: MementoFile<LocalEventLogData> | undefined;
    #pData: Promise<MementoFile<LocalEventLogData>>;
    #pending: LogEntry[] = [];
    #pFlush: Promise<void> | undefined = undefined;
    #timeout: NodeJS.Timeout | undefined = undefined;

    constructor(readonly uriStorageDir: Uri) {
        this.#pData = MementoFile.createMemento<LocalEventLogData>(Uri.joinPath(uriStorageDir, 'eventLog.json'));
        this.#pData.then((data) => (this.#data = data)).catch(squelch('EventLoggerImpl'));
    }

    log(event: LogEntry): void {
        this.#pending.push(event);
        this.queueFlush();
    }

    logActivate(): void {
        this.log(createActivateEvent());
    }

    logReplace(word: string, suggestion: string): void {
        this.log(createReplaceEvent(word, suggestion));
    }

    get eventLog(): readonly LogEntryBase[] {
        if (!this.#data) return [];
        return this.#data.get('log', []);
    }

    queueFlush(): void {
        if (this.#timeout) return;
        this.#timeout = setTimeout(() => {
            this.#timeout = undefined;
            logErrors(this.flush(), 'EventLogger.flush').catch(squelch('EventLoggerImpl.queueFlush'));
        }, 10);
    }

    flush(): Promise<void> {
        const doFlush = async () => {
            if (!this.#pending.length) return;
            const memo = this.#data ?? (await this.#pData);
            const machineId = memo.get('machineId', env.machineId);
            const ts = Date.now();
            const log = [...memo.get('log', []), ...this.#pending];
            this.#pending = [];
            await memo.update({ machineId, ts, log });
        };
        const pFlush = this.#pFlush ? this.#pFlush.then(doFlush) : doFlush();
        this.#pFlush = pFlush;
        pFlush
            .finally(() => {
                if (this.#pFlush === pFlush) this.#pFlush = undefined;
            })
            .catch(squelch('EventLoggerImpl.flush'));
        return pFlush;
    }

    dispose(): void {
        if (this.#data) {
            this.#data.dispose();
        } else {
            this.#pData
                .then((data) => {
                    data.dispose();
                })
                .catch(squelch('EventLoggerImpl.dispose'));
        }
    }
}

export function createEventLogger(uriStorageDir: Uri): EventLogger {
    return new EventLoggerImpl(uriStorageDir);
}
