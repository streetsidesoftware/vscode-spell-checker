import { createSubscribable } from '../createFunctions';
import type { Subscribable, SubscribableLike } from '../Subscribables';

export function fromSubscribableLike<T>(subscribable: SubscribableLike<T>): Subscribable<T> {
    return typeof subscribable === 'function' ? createSubscribable(subscribable) : subscribable;
}
