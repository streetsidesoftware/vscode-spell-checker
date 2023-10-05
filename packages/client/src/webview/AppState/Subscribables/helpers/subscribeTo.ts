import type { DisposableLike } from 'utils-disposables';

import type { SubscribableLike, SubscribeFn, SubscriberLike } from '../Subscribables';

export function subscribeTo<T>(source: SubscribableLike<T>, subscriber: SubscriberLike<T>): DisposableLike {
    const src: SubscribeFn<T> = typeof source === 'function' ? source : (s) => source.subscribe(s);
    return src(subscriber) ?? (() => undefined);
}
