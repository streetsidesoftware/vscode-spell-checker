import type { Disposable, EventEmitter, EventListener } from './types.mjs';

/**
 * Create a new event emitter.
 * @param name - The name of the event emitter.
 * @returns EventEmitter
 */
export function createEmitter<T>(name?: string) {
    return new _EventEmitter<T>(name);
}

/**
 * @param obj - The object to check if it is an EventEmitter.
 * @returns true if the object is an EventEmitter.
 */
export function isEventEmitter<T>(obj: unknown): obj is EventEmitter<T> {
    return obj instanceof _EventEmitter || isEmitterLike(obj);
}

function isEmitterLike<T>(obj: unknown): obj is EventEmitter<T> {
    if (!obj && typeof obj !== 'object') return false;
    const emitter = obj as EventEmitter<T>;
    return typeof emitter.event === 'function' && typeof emitter.fire === 'function' && typeof emitter.dispose === 'function';
}

class _EventEmitter<T> implements EventEmitter<T> {
    #listeners: Set<{ fn: EventListener<T> }> = new Set();
    #isDisposed = false;

    constructor(readonly name?: string) {}

    /**
     * The event listeners can subscribe to.
     */
    readonly event = (listener: (e: T) => unknown): Disposable => {
        assert(!this.#isDisposed, 'EventEmitter is disposed');
        const fn = listener;
        const box = { fn };
        this.#listeners.add(box);
        return {
            dispose: () => {
                this.#listeners.delete(box);
            },
        };
    };

    /**
     * Notify all subscribers of the {@link EventEmitter.event event}. Failure
     * of one or more listener will not fail this function call.
     *
     * @param data The event object.
     */
    readonly fire = (data: T): void => {
        for (const listener of this.#listeners) {
            try {
                listener.fn(data);
            } catch {
                // ignore
            }
        }
    };

    /**
     * Dispose this object and free resources.
     */
    readonly dispose = (): void => {
        this.#isDisposed = true;
        this.#listeners.clear();
    };

    get isDisposed() {
        return this.#isDisposed;
    }

    numListeners() {
        return this.#listeners.size;
    }
}

export function numListeners<T>(emitter: EventEmitter<T>) {
    assert(emitter instanceof _EventEmitter, 'emitter is not an instance of _EventEmitter');
    return emitter.numListeners();
}

export function assert(value: unknown, message = 'assertion failed'): asserts value {
    if (!value) {
        throw new Error(message);
    }
}
