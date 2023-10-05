import type { DisposableLike } from 'utils-disposables';
import { disposeOf } from 'utils-disposables';

import type { EventType, Subscribable, SubscribableEvent } from '../Subscribables';

export function awaitSubscribable<T>(sub: Subscribable<T>): Promise<T> {
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

export function awaitSubscribableAll<T>(sub: Subscribable<T>): Promise<T[]> {
    let disposable: DisposableLike | undefined;

    return new Promise<T[]>((resolve, _reject) => {
        // prevent double resolve.
        let resolved = false;
        const buffer: T[] = [];

        function onDone() {
            if (resolved) return;
            resolved = true;
            disposeOf(disposable);
            resolve(buffer);
        }

        disposable = sub.subscribe({ notify: (v) => buffer.push(v), done: onDone });
    });
}

export function awaitEvent<T>(sub: Subscribable<T>, eventName: EventType): Promise<SubscribableEvent> {
    let disposable: DisposableLike | undefined;

    return new Promise((resolve) => {
        disposable = sub.onEvent((e) => {
            if (e.name == eventName) {
                disposeOf(disposable);
                resolve(e);
            }
        });
    });
}
