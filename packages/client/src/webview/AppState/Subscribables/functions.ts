import type { DisposableLike } from 'utils-disposables';
import { disposeOf } from 'utils-disposables';

import { EmitterImpl } from './internal/EmitterImpl';
import { SubscribableImpl } from './internal/SubscribableImpl';
import type { Subscribable, SubscribableSubscriber, SubscribeFn } from './Subscribables';

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

export function createEmitter<T>(): SubscribableSubscriber<T> {
    return new EmitterImpl<T>();
}

export function createSubscribable<T>(subscribe: SubscribeFn<T>): Subscribable<T> {
    return new SubscribableImpl<T>(subscribe);
}
