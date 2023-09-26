import deepEqual from 'fast-deep-equal';
import type { DisposableHybrid as Disposable, DisposableLike, DisposeFn } from 'utils-disposables';
import { createDisposable, disposeOf, InheritableDisposable } from 'utils-disposables';

export type MakeSubscribable<T, RO extends keyof T | never = never> = {
    [K in keyof T]: K extends RO ? SubscribableValue<T[K]> : ObservableValue<T[K]>;
};

export type SubscriberFn<T> = (v: T) => void;

export interface Subscribable<T> {
    subscribe(s: SubscriberFn<T>): Disposable;
    dispose?: () => void;
}

export interface SubscribableValue<T> extends Required<Subscribable<T>>, Disposable {
    value: T | undefined;
}

export interface ObservableValue<T> extends SubscribableValue<T> {
    value: T;
    set(v: T): void;
    update(u: (v: T) => T): void;
}

class Observable<T> extends InheritableDisposable implements ObservableValue<T> {
    private _value: T;
    private _subscriptions = new Set<SubscriberFn<T>>();
    private _busy = false;
    constructor(value: T) {
        super();
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
        s(this._value);
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
    return new SubscribableValueImpl(subscribe, initialValue, options);
}

type TimeOutHandle = ReturnType<typeof setTimeout>;

class SubscribableValueImpl<T> extends InheritableDisposable implements SubscribableValue<T> {
    private _timeout = 5000;
    private _handleTimeout: TimeOutHandle | undefined = undefined;
    private _subscriptions = new Set<SubscriberFn<T>>();
    private _source: SubscribeFn<T>;

    protected _started = false;
    protected _value: T | typeof symbolNotSet;
    protected _dispose: DisposableLike | DisposeFn | undefined;
    protected _busy = false;

    constructor(subscribe: SubscribeFn<T>, initialValue?: T, options?: CreateSubscribableValueOptions) {
        super([() => this._cleanup()]);
        this._source = subscribe;
        this._value = initialValue !== undefined ? initialValue : symbolNotSet;
        this._timeout = options?.timeout ?? this._timeout;
    }

    private _cleanup() {
        this._subscriptions.clear();
        disposeOf(this._dispose);
        this._setTimeout(undefined);
    }

    private _setTimeout(h: TimeOutHandle | undefined) {
        const handle = this._handleTimeout;
        this._handleTimeout = h;
        if (handle) {
            clearTimeout(handle);
        }
    }

    private _stop() {
        if (this._subscriptions.size) return;

        this._started = false;
        disposeOf(this._dispose);
    }

    private _unSub(s: SubscriberFn<T>) {
        this._subscriptions.delete(s);
        if (!this._subscriptions.size) {
            this._setTimeout(setTimeout(() => this._stop(), this._timeout));
        }
    }

    private _start() {
        if (this._started) return;
        this._started = true;
        this._dispose = this._source((v: T) => this._notify(v));
    }

    private _notify(v: T) {
        this._value = v;
        if (this._busy) return;
        try {
            this._busy = true;
            for (const s of this._subscriptions) {
                s(v);
            }
        } finally {
            this._busy = false;
        }
    }

    get value() {
        return this._value === symbolNotSet ? undefined : this._value;
    }

    private _sub(s: SubscriberFn<T>): Disposable {
        this._subscriptions.add(s);
        if (this._value !== symbolNotSet) {
            s(this._value);
        }
        this._start();
        return createDisposable(() => this._unSub(s));
    }

    public subscribe = this._sub.bind(this);
}

export function awaitForSubscribable<T>(sub: Subscribable<T>): Promise<T> {
    let disposable: DisposableLike | undefined;

    return new Promise<T>((resolve, _reject) => {
        // prevent double resolve.
        let resolved = false;
        disposable = sub.subscribe((v) => {
            if (resolved) return;
            resolved = true;
            try {
                resolve(v);
            } finally {
                disposeOf(disposable);
            }
        });
    });
}

export interface Emitter<T> extends Subscribable<T> {
    emit(value: T): void;
    dispose(): void;
}

export function createEmitter<T>(): Emitter<T> {
    const subscriptions = new Set<SubscriberFn<T>>();
    let _busy = false;

    function emit(value: T) {
        if (_busy) return;
        try {
            _busy = true;
            for (const s of subscriptions) {
                s(value);
            }
        } finally {
            _busy = false;
        }
    }

    return {
        emit,
        subscribe(s) {
            subscriptions.add(s);
            return createDisposable(() => subscriptions.delete(s));
        },
        dispose() {
            subscriptions.clear();
        },
    };
}
