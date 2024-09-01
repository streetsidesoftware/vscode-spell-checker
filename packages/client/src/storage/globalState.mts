import type { EventLog, Timestamp } from './EventLog.mjs';
import type { Memento } from './memento.mjs';

export interface GlobalStateData {
    eventLog: EventLog;
}

export interface GlobalStateControl extends Memento<GlobalStateData> {
    /**
     * List of fields that are synced across machines.
     */
    readonly syncFields: string[];

    /**
     * This field is used to store the signature of last time the global state was updated on this machine.
     * It is used to detect changes to the global state.
     */
    readonly signature: string;

    /**
     * The timestamp of the last time the global state was updated on this machine.
     */
    readonly ts: Timestamp;
}
