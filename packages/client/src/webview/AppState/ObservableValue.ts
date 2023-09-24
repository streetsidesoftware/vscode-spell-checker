import deepEqual from 'fast-deep-equal';
import { createDisposable, type DisposableHybrid as Disposable } from 'utils-disposables';

export interface ObservableValue<T> {
    value: T;
    set(v: T): void;
    update(u: (v: T) => T): void;
    subscribe(s: (v: T) => unknown): Disposable;
}
class Observable<T> implements ObservableValue<T> {
    private _value: T;
    private _subscriptions = new Set<(v: T) => unknown>();
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
