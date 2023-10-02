import { fromAsyncIterable } from './helpers/fromAsyncIterable';
import { fromIterable } from './helpers/fromIterable';
import { fromSubscribableLike } from './helpers/toSubscribable';
import type { OperatorFn, Subscribable, SubscribableLike } from './Subscribables';

export type Subscribables<T> = SubscribableLike<T> | AsyncIterable<T> | Iterable<T>;

export function rx<T>(subscribable: Subscribables<T>): Subscribable<T>;
export function rx<T>(subscribable: Subscribables<T>, operator?: OperatorFn<T, T>): Subscribable<T>;
export function rx<T, U>(subscribable: Subscribables<T>, operator?: OperatorFn<T, U>): Subscribable<U>;
export function rx<T>(subscribable: Subscribables<T>, operator?: OperatorFn<T, T>): Subscribable<T> {
    operator ??= (a) => a;
    if (Symbol.iterator in subscribable) {
        return operator(fromIterable(subscribable));
    }
    if (Symbol.asyncIterator in subscribable) {
        return operator(fromAsyncIterable(subscribable));
    }
    const s = fromSubscribableLike(subscribable);
    return operator(s);
}
