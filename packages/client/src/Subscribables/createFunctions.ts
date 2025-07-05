import { EmitterImpl } from './internal/EmitterImpl.js';
import { SubscribableImpl } from './internal/SubscribableImpl.js';
import type { Subscribable, SubscribableLike, SubscribableSubscriber } from './Subscribables.js';

export function createEmitter<T>(): SubscribableSubscriber<T> {
    return new EmitterImpl<T>();
}

export function createSubscribable<T>(subscribe: SubscribableLike<T>): Subscribable<T> {
    return new SubscribableImpl<T>(subscribe);
}
