export type MachineId = string;
export type Timestamp = number;

export type Events = 'replace' | 'activate';

/**
 * A log entry.
 * - ts - The timestamp of the event.
 * - range - The timestamp of the end of the event range. (this is used to group events).
 * - event - The event that occurred.
 * - count - The number of times the event occurred. (this is used to group events).
 * - args - Additional arguments for the event.
 */
export type LogEntryBase = [ts: Timestamp, range: Timestamp | 0, event: string, count: number, ...args: unknown[]];

/** Replace a word with a suggestion. */
export type LogEntryReplace = [ts: Timestamp, range: Timestamp | 0, 'replace', count: number, word: string, suggestion: string];

/** Indicates that the extension was activated. */
export type LogEntryActivate = [ts: Timestamp, range: Timestamp | 0, 'activate', count: number];

export type LogEntry = LogEntryReplace | LogEntryActivate;

export interface EventLog {
    /**
     * The log of events that have occurred.
     */
    log: LogEntryBase[];

    /**
     * The synchronization timestamp of each machine.
     * The timestamp is the timestamp of the last event added to the log for a given machine id.
     */
    sync: Record<MachineId, Timestamp>;
}

export function isLogEntryReplace(entry: LogEntryBase): entry is LogEntryReplace {
    return entry[2] === 'replace';
}

export function isLogEntryActivate(entry: LogEntryBase): entry is LogEntryActivate {
    return entry[2] === 'activate';
}
