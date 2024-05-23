import type { EventOperator } from '../types.mjs';
import { operator } from './operator.mjs';

const symbolNotSet = Symbol('not set');
type SymbolNotSet = typeof symbolNotSet;

/**
 * Debounce the release of events.
 * Only emits the latest value after a delay of waitMs.
 * @param waitMs - delay in milliseconds.
 * @returns
 */
export function debounce<T>(waitMs: number): EventOperator<T, T> {
    let pendingValue: T | SymbolNotSet = symbolNotSet;
    let timer: NodeJS.Timeout | undefined = undefined;

    function clear() {
        pendingValue = symbolNotSet;
        timer = undefined;
    }

    return operator(
        (value, fire) => {
            pendingValue = value;
            clearTimeout(timer);
            timer = setTimeout(handleTimer, waitMs);

            function handleTimer() {
                const value = pendingValue;
                clear();
                value !== symbolNotSet && fire(value);
            }
        },
        {
            dispose() {
                clearTimeout(timer);
                clear();
            },
        },
    );
}
