import type { DisposableLike, DisposeFn } from 'utils-disposables';
import { disposeOf } from 'utils-disposables';

import type { SubscribeFn } from '../Subscribables';
import { AbstractSubscribable } from './AbstractSubscribable';

export class SubscribableImpl<T> extends AbstractSubscribable<T> {
    private _source: SubscribeFn<T>;

    protected _dispose: DisposableLike | DisposeFn | undefined;

    constructor(subscribe: SubscribeFn<T>) {
        super();
        this._source = subscribe;
    }

    protected _stop() {
        super._stop();
        disposeOf(this._dispose);
        this._dispose = undefined;
    }

    protected _start() {
        super._start();
        if (this._isRunning && !this._dispose) {
            this._dispose = this._source((v: T) => this.notify(v));
        }
    }
}
