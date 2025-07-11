import type { DisposableLike, DisposeFn } from 'utils-disposables';
import { disposeOf } from 'utils-disposables';

import { subscribeTo } from '../helpers/subscribeTo.js';
import type { SubscribableLike } from '../Subscribables.js';
import { AbstractSubscribable } from './AbstractSubscribable.js';

export class SubscribableImpl<T> extends AbstractSubscribable<T> {
    private _source: SubscribableLike<T>;

    protected _dispose: DisposableLike | DisposeFn | undefined;

    constructor(subscribe: SubscribableLike<T>) {
        super();
        this._source = subscribe;
    }

    protected override _stop() {
        super._stop();
        disposeOf(this._dispose);
        this._dispose = undefined;
    }

    protected override _start() {
        super._start();
        if (this._isRunning && !this._dispose) {
            this._dispose = subscribeTo(this._source, { notify: (v) => { this.notify(v); }, done: () => { this.done(); } });
        }
    }
}
