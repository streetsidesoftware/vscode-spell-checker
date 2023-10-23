import { SubscribableImpl } from '../internal/SubscribableImpl';
import type { OperatorFn, SubscribeFn } from '../Subscribables';

export function delayUnsubscribe<T>(timeout: number): OperatorFn<T, T> {
    return (a) => {
        return new SubscribableDelayedUnsubscribeImpl((s) => a.subscribe(s), timeout);
    };
}

type TimeOutHandle = ReturnType<typeof setTimeout>;

class SubscribableDelayedUnsubscribeImpl<T> extends SubscribableImpl<T> {
    private _timeout: number;
    private _handleTimeout: TimeOutHandle | undefined = undefined;

    constructor(subscribe: SubscribeFn<T>, timeout: number) {
        super(subscribe);
        this._timeout = timeout;
    }

    private clearTimeout() {
        if (this._handleTimeout) {
            clearTimeout(this._handleTimeout);
        }
        this._handleTimeout = undefined;
    }

    protected _tryToStop(): void {
        this.clearTimeout();
        this._handleTimeout = setTimeout(() => {
            if (this._hasSubscribers()) return;
            this._stop();
        }, this._timeout);
    }

    protected done() {
        this.clearTimeout();
        super.done();
    }
}
