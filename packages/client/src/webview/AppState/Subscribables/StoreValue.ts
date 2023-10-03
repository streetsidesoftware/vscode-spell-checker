import deepEqual from 'fast-deep-equal';

import { toSubscriberFn } from './helpers/toSubscriber';
import { AbstractSubscribable } from './internal/AbstractSubscribable';
import type { Subscribable, SubscribableValue, SubscriberLike } from './Subscribables';

export interface StoreValue<T> extends SubscribableValue<T> {
    value: T;
    set(v: T): void;
    update(u: (v: T) => T): void;
}

export function createStoreValue<T>(v: T): StoreValue<T> {
    return new StoreValueImpl(v);
}

class StoreValueImpl<T> extends AbstractSubscribable<T> implements StoreValue<T> {
    private _value: T;
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
        this.notify(value);
        return;
    }

    subscribe(s: SubscriberLike<T>) {
        const dispose = super.subscribe(s);
        const sFn = toSubscriberFn(s);
        sFn(this._value);
        return dispose;
    }

    update(u: (v: T) => T) {
        return this.set(u(this._value));
    }
}

export type MakeSubscribable<T, RO extends keyof T | never = never> = {
    [K in keyof T]: K extends RO ? Subscribable<T[K]> : StoreValue<T[K]>;
};
