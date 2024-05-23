import type { EventOperator } from '../types.mjs';
import { operator } from './operator.mjs';

/**
 * Map the data in the event stream.
 * @param fn - The function to call with the data.
 * @returns an event operator function.
 */
export function map<T, U>(fn: (data: T) => U): EventOperator<T, U> {
    return operator((value, fire) => {
        fire(fn(value));
    });
}
