import { EmitterImpl } from './internal/EmitterImpl';
import { SubscribableImpl } from './internal/SubscribableImpl';
import type { Subscribable, SubscribableLike, SubscribableSubscriber } from './Subscribables';

export function createEmitter<T>(): SubscribableSubscriber<T> {
    return new EmitterImpl<T>();
}

export function createSubscribable<T>(subscribe: SubscribableLike<T>): Subscribable<T> {
    return new SubscribableImpl<T>(subscribe);
}
