import type { DisposableHybrid as Disposable } from 'utils-disposables';
import { createDisposable, InheritableDisposable } from 'utils-disposables';

import type { EventListener, EventType, Subscribable, SubscribableEvent, SubscriberLike } from '../Subscribables';

export abstract class AbstractSubscribable<T> extends InheritableDisposable implements Subscribable<T> {
    private _subscriptions = new Set<SubscriberLike<T>>();
    private _eventListeners = new Set<EventListener>();

    protected _isRunning = false;
    protected _isNotifyBusy = false;

    constructor() {
        super([() => this.done(), () => this._eventListeners.clear()], 'AbstractSubscribable');
    }

    protected _hasSubscribers() {
        return !!this._subscriptions.size;
    }

    protected _stop() {
        this._isRunning = false;
        this.sendEvents({ name: 'onStop' });
    }

    protected _tryToStop() {
        if (this._hasSubscribers()) return;
        this._stop();
    }

    private _markAsDone(s: SubscriberLike<T>) {
        if (typeof s === 'function') return;
        s.done?.();
    }

    private _markAllSubscriptionsAsDone() {
        for (const s of this._subscriptions) {
            this._subscriptions.delete(s);
            this._markAsDone(s);
        }
    }

    private _unSub(s: SubscriberLike<T>) {
        this._subscriptions.delete(s);
        // this._markAsDone(s);
        this._tryToStop();
    }

    protected _start() {
        if (this._isRunning) return;
        this.sendEvents({ name: 'onStart' });
        this._isRunning = true;
    }

    protected _notifySubscriber(s: SubscriberLike<T>, value: T) {
        return typeof s === 'function' ? s(value) : s.notify(value);
    }

    private _notify(v: T) {
        if (this._isNotifyBusy) return;
        try {
            this._isNotifyBusy = true;
            for (const s of this._subscriptions) {
                this._notifySubscriber(s, v);
            }
        } finally {
            this._isNotifyBusy = false;
        }
    }

    public subscribe(s: SubscriberLike<T>): Disposable {
        this._subscriptions.add(s);
        this._start();
        return createDisposable(() => this._unSub(s), undefined, 'subscribe');
    }

    protected notify(value: T): void {
        this.sendEvents({ name: 'onNotify', value });
        this._notify(value);
    }

    protected done(): void {
        this.sendEvents({ name: 'onDone' });
        this._markAllSubscriptionsAsDone();
        this._subscriptions.clear();
        this._stop();
    }

    protected sendEvents(event: SubscribableEvent) {
        for (const listener of this._eventListeners) {
            listener(event);
        }
    }

    public onEvent(listener: EventListener): Disposable;
    public onEvent(eventType: EventType, listener: EventListener): Disposable;
    public onEvent(etOrL: EventType | EventListener, listener?: EventListener): Disposable {
        if (typeof etOrL === 'function') {
            this._eventListeners.add(etOrL);
            return createDisposable(() => this._eventListeners.delete(etOrL), undefined, 'onEvent');
        }

        const eventType = etOrL;
        const eventlistener: EventListener = (e) => {
            if (e.name !== eventType) return;
            listener?.(e);
        };
        this._eventListeners.add(eventlistener);
        return createDisposable(() => this._eventListeners.delete(eventlistener), undefined, `onEvent ${eventType}`);
    }
}
