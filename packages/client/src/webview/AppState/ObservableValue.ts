import deepEqual from 'fast-deep-equal';
import type { DisposableHybrid as Disposable, DisposableLike, DisposeFn } from 'utils-disposables';
import { createDisposable, disposeOf } from 'utils-disposables';

export type MakeSubscribable<T, RO extends keyof T | never = never> = {
    [K in keyof T]: K extends RO ? SubscribableValue<T[K]> : ObservableValue<T[K]>;
};

export type SubscriberFn<T> = (v: T) => void;

export interface SubscribableValue<T> {
    value: T | undefined;
    subscribe(s: SubscriberFn<T>): Disposable;
}

export interface ObservableValue<T> extends SubscribableValue<T> {
    value: T;
    set(v: T): void;
    update(u: (v: T) => T): void;
}

class Observable<T> implements ObservableValue<T> {
    private _value: T;
    private _subscriptions = new Set<SubscriberFn<T>>();
    private _busy = false;
    constructor(value: T) {
        this._value = value;
    }

    get value() {
        return this._value;
    }

    set value(v: T) {
        this.set(v);
    }

    set(value: T) {
        // Do not update if the value has not changed.
        if (this._value === value || deepEqual(this._value, value)) return;
        this._value = value;
        this.notify();
        return;
    }

    subscribe(s: (v: T) => unknown): Disposable {
        const subscriptions = this._subscriptions;
        subscriptions.add(s);
        return createDisposable(() => subscriptions.delete(s));
    }

    update(u: (v: T) => T) {
        return this.set(u(this._value));
    }

    private notify() {
        if (this._busy) return;
        try {
            this._busy = true;
            for (const s of this._subscriptions) {
                s(this._value);
            }
        } finally {
            this._busy = false;
        }
    }
}

export function createStoreValue<T>(v: T): ObservableValue<T> {
    return new Observable(v);
}

export type SubscribeFn<T> = (emitter: (v: T) => void) => DisposableLike | DisposeFn | undefined;

const symbolNotSet = Symbol('A values that has not been set.');

interface CreateSubscribableValueOptions {
    timeout?: number;
}

export function createSubscribableValue<T>(
    subscribe: SubscribeFn<T>,
    initialValue?: T,
    options?: CreateSubscribableValueOptions,
): SubscribableValue<T> {
    const timeout = options?.timeout ?? 5000;
    const _subscriptions = new Set<SubscriberFn<T>>();
    let started = false;
    let value: T | typeof symbolNotSet = initialValue !== undefined ? initialValue : symbolNotSet;
    let dispose: DisposableLike | DisposeFn | undefined;
    let _busy = false;

    function stop() {
        if (_subscriptions.size) return;

        started = false;
        dispose && disposeOf(dispose);
    }

    function unSub(s: SubscriberFn<T>) {
        _subscriptions.delete(s);
        setTimeout(stop, timeout);
    }

    function sub(s: SubscriberFn<T>): Disposable {
        _subscriptions.add(s);
        if (value !== symbolNotSet) {
            s(value);
        }
        start();
        return createDisposable(() => unSub(s));
    }

    function start() {
        if (started) return;

        dispose = subscribe(notify);
    }

    function notify(v: T) {
        value = v;
        if (_busy) return;
        try {
            _busy = true;
            for (const s of _subscriptions) {
                s(v);
            }
        } finally {
            _busy = false;
        }
    }

    return {
        get value() {
            return value === symbolNotSet ? undefined : value;
        },
        subscribe: sub,
    };
}

export function awaitForSubscribable<T>(sub: SubscribableValue<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let disposable: DisposableLike | undefined;
        try {
            disposable = sub.subscribe(resolve);
        } catch (e) {
            reject(e);
        } finally {
            disposable && disposeOf(disposable);
        }
    });
}
