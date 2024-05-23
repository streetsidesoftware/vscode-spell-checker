import type { EventOperator } from '../types.mjs';
import { operator } from './operator.mjs';

/**
 * Tap into the event stream without modifying the data.
 * @param fn - The function to call with the data.
 * @returns an event operator function.
 */
export function tap<T>(fn: (value: T) => unknown): EventOperator<T, T> {
    return operator((value, fire) => {
        try {
            fn(value);
        } finally {
            fire(value);
        }
    });
}
