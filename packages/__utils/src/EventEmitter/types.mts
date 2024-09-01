export interface Disposable {
    dispose(): void;
}

export type EventListener<T> = (data: T) => unknown;

export type EmitterEvent<T> = (listener: EventListener<T>) => Disposable;

export interface EventEmitter<T> {
    /**
     * The name of the event emitter.
     */
    name?: string;

    /**
     * The event listeners can subscribe to.
     */
    event: EmitterEvent<T>;

    /**
     * Notify all subscribers of the {@link EventEmitter.event event}. Failure
     * of one or more listener will not fail this function call.
     *
     * @param data The event object.
     */
    fire(data: T): void;

    /**
     * Dispose this object and free resources.
     */
    dispose(): void;
}

export type EventOperator<T, U> = (source: EmitterEvent<T>) => EmitterEvent<U>;
