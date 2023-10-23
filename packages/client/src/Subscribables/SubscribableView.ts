import type { DisposableLike } from 'utils-disposables';
import { disposeOf } from 'utils-disposables';

import { toSubscriberFn } from './helpers/toSubscriber';
import { SubscribableImpl } from './internal/SubscribableImpl';
import type { SubscribableLike, SubscribableValue, SubscriberLike } from './Subscribables';

export interface SubscribableView<T> extends SubscribableValue<T> {
    value: T | undefined;
    hasValue(): boolean;
}
const symbolNoValue = Symbol('has been set');
type SymbolNoValue = typeof symbolNoValue;
class ViewImpl<T> extends SubscribableImpl<T> implements SubscribableView<T> {
    private _value: T | SymbolNoValue = symbolNoValue;
    constructor(subscribable: SubscribableLike<T>, autoStart = true) {
        super(subscribable);
        if (autoStart) {
            let disposable: DisposableLike | undefined = this.subscribe({
                notify: () => undefined,
                done: () => (disposeOf(disposable), (disposable = undefined)),
            });
        }
    }

    get value() {
        return this._value === symbolNoValue ? undefined : this._value;
    }

    protected notify(value: T): void {
        this._value = value;
        super.notify(value);
    }

    subscribe(s: SubscriberLike<T>) {
        const dispose = super.subscribe(s);
        if (this._value !== symbolNoValue) {
            const sFn = toSubscriberFn(s);
            sFn(this._value);
        }
        return dispose;
    }

    hasValue(): boolean {
        return this._value !== symbolNoValue;
    }
}

export function createSubscribableView<T>(source: SubscribableLike<T>, autoStart?: boolean): SubscribableView<T> {
    return new ViewImpl(source, autoStart);
}
