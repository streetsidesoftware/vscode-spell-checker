import type { EmitterEvent, EventEmitter, EventListener } from '@internal/common-utils';
import { createEmitter } from '@internal/common-utils';

import type { Memento } from './memento.mjs';

export class MementoMem<T> implements Memento<T> {
    #data: T | undefined;
    #emitter: EventEmitter<readonly (keyof T)[] | undefined>;
    constructor(data?: T | undefined) {
        this.#data = data;
        this.#emitter = createEmitter();
    }

    keys(): readonly (keyof T)[] {
        return this.#data ? (Object.keys(this.#data) as (keyof T)[]) : [];
    }

    get<K extends keyof T>(key: K): T[K] | undefined;
    get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
    get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] | undefined {
        return (this.#data ? this.#data[key] : undefined) ?? defaultValue;
    }

    async update<K extends keyof T>(key: K, value: T[K] | undefined): Promise<void>;
    async update(data: Partial<T>): Promise<void>;
    async update<K extends keyof T>(keyOrData: K | Partial<T>, value?: T[K] | undefined): Promise<void> {
        const keys: (keyof T)[] = [];
        if (typeof keyOrData === 'string') {
            const key: K = keyOrData;
            this.#data = this.#data ?? ({} as T);
            if (value === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this.#data[key];
            } else {
                this.#data[key] = value;
            }
            keys.push(key);
        } else {
            const data = keyOrData as Partial<T>;
            keys.push(...(Object.keys(data) as K[]));
            this.#data = { ...this.#data, ...data } as T;
        }
        this.#emitter.fire(keys);
    }

    onDidChange(listener: EventListener<readonly (keyof T)[] | undefined>): ReturnType<EmitterEvent<unknown>> {
        return this.#emitter.event(listener);
    }
}
