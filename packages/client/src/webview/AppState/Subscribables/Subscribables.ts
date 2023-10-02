import type { DisposableHybrid as Disposable, DisposableLike, DisposeFn } from 'utils-disposables';

export type SubscriberFn<T> = (v: T) => void;

export interface Subscriber<T> {
    /** Push a value to the subscriber */
    notify(value: T): void;
    /**
     * Called when the subscribable is done and no more values will be pushed.
     */
    done?(): void;
}

export type SubscriberLike<T> = SubscriberFn<T> | Subscriber<T>;

export interface Subscribable<T> {
    subscribe(s: SubscriberFn<T>): Disposable;
    /** Called to Dispose of the Subscribable */
    dispose: () => void;
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
    dispose: () => void;
}

export type SubscribeFn<T> = (notify: SubscriberFn<T>) => DisposableLike | DisposeFn | undefined;

export type SubscribableLike<T> = SubscribeFn<T> | Subscribable<T>;

export interface SubscribableValue<T> extends Subscribable<T> {
    value: T | undefined;
}

export type OperatorFn<T, U> = (source: Subscribable<T>) => Subscribable<U>;
