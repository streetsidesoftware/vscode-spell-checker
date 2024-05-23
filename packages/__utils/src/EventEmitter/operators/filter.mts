import type { EventOperator } from '../types.mjs';
import { operator } from './operator.mjs';

/**
 * Filter the data in the event stream.
 * @param predicate - the prediction function to call with the data, return truthy to keep the data.
 * @returns an event operator function.
 */
export function filter<T, U extends T>(predicate: (value: T) => value is U): EventOperator<T, U>;
/**
 * Filter the data in the event stream.
 * @param predicate - the prediction function to call with the data, return truthy to keep the data.
 * @returns an event operator function.
 */
export function filter<T>(predicate: (value: T) => unknown): EventOperator<T, T>;
export function filter<T>(predicate: (value: T) => unknown): EventOperator<T, T> {
    return operator((value, fire) => {
        if (predicate(value)) {
            fire(value);
        }
    });
}
