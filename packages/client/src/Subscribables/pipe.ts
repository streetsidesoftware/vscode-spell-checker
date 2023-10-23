import type { OperatorFn, Subscribable } from './Subscribables';

export function pipe<T>(subscribable: Subscribable<T>): Subscribable<T>;
export function pipe<T, U0>(subscribable: Subscribable<T>, op0: OperatorFn<T, U0>): Subscribable<U0>;
export function pipe<T, U0, U1>(subscribable: Subscribable<T>, op0: OperatorFn<T, U0>, op1: OperatorFn<U0, U1>): Subscribable<U1>;
export function pipe<T, U0, U1, U2>(
    subscribable: Subscribable<T>,
    op0: OperatorFn<T, U0>,
    op1: OperatorFn<U0, U1>,
    op2: OperatorFn<U1, U2>,
): Subscribable<U2>;
export function pipe<T>(subscribable: Subscribable<T>, ...ops: OperatorFn<T, T>[]): Subscribable<T>;
export function pipe<T>(subscribable: Subscribable<T>, ...ops: OperatorFn<T, T>[]): Subscribable<T> {
    let s = subscribable;
    for (const op of ops) {
        s = op(s);
    }
    return s;
}
