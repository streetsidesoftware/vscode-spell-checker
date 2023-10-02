import type { DisposableHybrid as Disposable } from 'utils-disposables';
import { createDisposable, InheritableDisposable } from 'utils-disposables';

import type { Subscribable, SubscriberFn } from '../Subscribables';

export abstract class AbstractSubscribable<T> extends InheritableDisposable implements Subscribable<T> {
    private _subscriptions = new Set<SubscriberFn<T>>();

    protected _isRunning = false;
    protected _isNotifyBusy = false;

    constructor() {
        super([() => this.done()]);
    }

    protected _hasSubscribers() {
        return !!this._subscriptions.size;
    }

    protected _stop() {
        this._isRunning = false;
    }

    protected _tryToStop() {
        if (this._hasSubscribers()) return;
        this._stop();
    }

    private _unSub(s: SubscriberFn<T>) {
        this._subscriptions.delete(s);
        this._tryToStop();
    }

    protected _start() {
        if (this._isRunning) return;
        this._isRunning = true;
    }

    private _notify(v: T) {
        if (this._isNotifyBusy) return;
        try {
            this._isNotifyBusy = true;
            for (const s of this._subscriptions) {
                s(v);
            }
        } finally {
            this._isNotifyBusy = false;
        }
    }

    public subscribe(s: SubscriberFn<T>): Disposable {
        this._subscriptions.add(s);
        this._start();
        return createDisposable(() => this._unSub(s));
    }

    protected notify(value: T): void {
        this._notify(value);
    }

    protected done(): void {
        this._subscriptions.clear();
        this._stop();
    }
}
