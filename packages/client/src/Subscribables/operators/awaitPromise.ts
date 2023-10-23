import type { OperatorFn } from '../Subscribables';
import { operate } from './operate';

export type AwaitPromiseErrorHandler<T> = (
    /** The error that occurred */
    err: unknown,
    /** An emitter to publish a new value. */
    emitter: (v: Awaited<T>) => void,
    /** The promise that was rejected */
    value: T,
) => void;

/**
 * Waits for promises to be resolved before publishing the value.
 *
 * NOTE: the order is not guaranteed.
 * @param onCatch - handler for the rejected promises.
 * @returns
 */
export function awaitPromise<T>(onCatch: AwaitPromiseErrorHandler<T>): OperatorFn<T, Awaited<T>> {
    return (source) =>
        operate(source, (value, emitter) => {
            Promise.resolve(value)
                .then(emitter)
                .catch((err) => onCatch(err, emitter, value));
        });
}
