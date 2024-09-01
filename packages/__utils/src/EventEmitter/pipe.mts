/* eslint-disable @typescript-eslint/unified-signatures */
import type { EmitterEvent, EventListener, EventOperator } from './types.mjs';

export type Subscribable<T> = EmitterEvent<T> | { event: EmitterEvent<T> };

export function pipe<T>(subscribable: Subscribable<T>): EmitterEvent<T>;
export function pipe<T, U0>(subscribable: Subscribable<T>, op0: EventOperator<T, U0>): EmitterEvent<U0>;
export function pipe<T, U0, U1>(subscribable: Subscribable<T>, op0: EventOperator<T, U0>, op1: EventOperator<U0, U1>): EmitterEvent<U1>;
export function pipe<T, U0, U1, U2>(
    subscribable: Subscribable<T>,
    op0: EventOperator<T, U0>,
    op1: EventOperator<U0, U1>,
    op2: EventOperator<U1, U2>,
): EmitterEvent<U2>;
export function pipe<T>(subscribable: Subscribable<T>, ...ops: EventOperator<T, T>[]): EmitterEvent<T>;
export function pipe<T>(subscribable: Subscribable<T>, ...ops: EventOperator<T, T>[]): EmitterEvent<T> {
    const subscribeFn = 'event' in subscribable ? (fn: EventListener<T>) => subscribable.event(fn) : subscribable;

    let finalEventFn: EmitterEvent<T> | undefined;

    /**
     * Late binding of the final event function
     * to allow for the creation of the event function
     */
    const getEvent = () => {
        if (finalEventFn) return finalEventFn;

        let s = subscribeFn;
        for (const op of ops) {
            s = op(s);
        }
        return (finalEventFn = s);
    };

    return (subscriber) => {
        return getEvent()(subscriber);
    };
}
