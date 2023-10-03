import type { DisposableHybrid as Disposable, DisposableLike, DisposeFn } from 'utils-disposables';

export type SubscriberLike<T> = SubscriberFn<T> | Subscriber<T>;

export type SubscriberFn<T> = (v: T) => void;

export type SubscribeFn<T> = (notify: SubscriberLike<T>) => DisposableLike | DisposeFn | undefined;

export type SubscribableLike<T> = SubscribeFn<T> | Subscribable<T>;

export type EventType = 'onStart' | 'onStop' | 'onDone' | 'onNotify';

export interface SubscribableEvent {
    name: EventType;
    value?: unknown;
}

export type EventListener = (event: SubscribableEvent) => void;

export interface Subscriber<T> {
    /** Push a value to the subscriber */
    notify(value: T): void;
    /**
     * Called when the subscribable is done and no more values will be pushed.
     */
    done?(): void;
}

export interface Subscribable<T> {
    subscribe(s: SubscriberLike<T>): Disposable;
    /** Called to Dispose of this Subscribable */
    dispose: () => void;

    /**
     * Listen to Subscribable Events
     */
    onEvent(listener: EventListener): Disposable;
    onEvent(eventType: EventType, listener: EventListener): Disposable;
}

export interface SubscribableSubscriber<T> extends Subscribable<T>, Subscriber<T> {
    /**
     * Called when the subscribable is done and no more values will be pushed.
     * Any subscribers will be unsubscribed.
     */
    done(): void;
    /**
     * Used to Dispose of the Subscribable
     * It will first call {@link SubscribableSubscriber.done|done()} before
     * disposing.
     */
    dispose(): void;
}

export interface SubscribableValue<T> extends Subscribable<T> {
    value: T | undefined;
}

export type OperatorFn<T, U> = (source: Subscribable<T>) => Subscribable<U>;
