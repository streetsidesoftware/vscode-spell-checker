import { createSubscribable } from '../createFunctions.js';
import type { Subscribable, SubscribableLike } from '../Subscribables.js';

export function fromSubscribableLike<T>(subscribable: SubscribableLike<T>): Subscribable<T> {
    return typeof subscribable === 'function' ? createSubscribable(subscribable) : subscribable;
}
