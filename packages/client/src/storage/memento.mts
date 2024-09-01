import type { EmitterEvent } from '@internal/common-utils';

/**
 * A memento represents a storage utility. It can store and retrieve
 * values.
 */
export interface Memento<T> {
    /**
     * Returns the stored keys.
     *
     * @returns The stored keys.
     */
    keys(): readonly (keyof T)[];

    /**
     * Return a value.
     *
     * @param key A string.
     * @returns The stored value or `undefined`.
     */
    get<K extends keyof T>(key: K): T[K] | undefined;

    /**
     * Return a value.
     *
     * @param key A string.
     * @param defaultValue A value that should be returned when there is no
     * value (`undefined`) with the given key.
     * @returns The stored value or the defaultValue.
     */
    get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];

    /**
     * Store a value. The value must be JSON-stringifyable.
     *
     * *Note* that using `undefined` as value removes the key from the underlying
     * storage.
     *
     * @param key A string.
     * @param value A value. MUST not contain cyclic references.
     */
    update<K extends keyof T>(key: K, value: T[K] | undefined): Promise<void>;

    /**
     * Store values. The values must be JSON-stringifyable.
     * @param data Partial data to update.
     */
    update(data: Partial<T>): Promise<void>;

    /**
     * Add a listener to be called when the memento has changed.
     * If the memento has changed, the listener will be called with an array of keys that have changed.
     * If the backing storage has been updated, the listener will be called with `undefined`.
     */
    onDidChange: EmitterEvent<readonly (keyof T)[] | undefined>;

    /**
     * Dispose of the memento.
     */
    dispose?(): void;
}
