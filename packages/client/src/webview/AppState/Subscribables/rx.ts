import { fromAsyncIterable } from './helpers/fromAsyncIterable';
import { fromIterable } from './helpers/fromIterable';
import { fromSubscribableLike } from './helpers/toSubscribable';
import { pipe } from './pipe';
import type { OperatorFn, Subscribable, SubscribableLike } from './Subscribables';

export type Subscribables<T> = SubscribableLike<T> | AsyncIterable<T> | Iterable<T>;

type OpFn<T, U> = OperatorFn<T, U>;

type Op2<T, U1, U2> = [OpFn<T, U1>, OpFn<U1, U2>];
type Op3<T, U1, U2, U3> = [...Op2<T, U1, U2>, OpFn<U2, U3>];
type Op4<T, U1, U2, U3, U4> = [...Op3<T, U1, U2, U3>, OpFn<U3, U4>];

export function rx<T>(subscribable: Subscribables<T>): Subscribable<T>;
export function rx<T>(subscribable: Subscribables<T>): Subscribable<T>;
export function rx<T, U>(subscribable: Subscribables<T>, operator: OperatorFn<T, U>): Subscribable<U>;
export function rx<T, U1, U2>(subscribable: Subscribables<T>, op1: OperatorFn<T, U1>, op2: OperatorFn<U1, U2>): Subscribable<U2>;
export function rx<T, U1, U2>(subscribable: Subscribables<T>, ...ops: Op2<T, U1, U2>): Subscribable<U2>;
export function rx<T, U1, U2, U3>(subscribable: Subscribables<T>, ...ops: Op3<T, U1, U2, U3>): Subscribable<U3>;
export function rx<T, U1, U2, U3, U4>(subscribable: Subscribables<T>, ...ops: Op4<T, U1, U2, U3, U4>): Subscribable<U4>;
export function rx<T>(subscribable: Subscribables<T>, ...ops: OperatorFn<T, T>[]): Subscribable<T>;
export function rx<T>(subscribable: Subscribables<T>, ...ops: OperatorFn<T, T>[]): Subscribable<T> {
    return pipe(toSubscribable(subscribable), ...ops);
}

function toSubscribable<T>(subscribable: Subscribables<T>): Subscribable<T> {
    if (Symbol.iterator in subscribable) {
        return fromIterable(subscribable);
    }
    if (Symbol.asyncIterator in subscribable) {
        return fromAsyncIterable(subscribable);
    }
    return fromSubscribableLike(subscribable);
}
