import type { OperatorFn } from '../Subscribables';
import { operate } from './operate';

const symbolNotSet = Symbol('not set');
type SymbolNotSet = typeof symbolNotSet;

/**
 * Debounce the release of events.
 * Only emits the latest value after a delay of waitMs.
 * @param waitMs - delay in milliseconds.
 * @returns
 */
export function debounce<T>(waitMs: number): OperatorFn<T, T> {
    let pendingValue: T | SymbolNotSet = symbolNotSet;
    let timer: NodeJS.Timeout | undefined = undefined;

    return (source) => {
        const subscribable = operate(source, (value, notify) => {
            pendingValue = value;
            clearTimeout(timer);
            timer = setTimeout(handleTimer, waitMs);
            function handleTimer() {
                const value = pendingValue;
                pendingValue = symbolNotSet;
                timer = undefined;
                if (value !== symbolNotSet) notify(value);
            }
        });
        subscribable.onEvent('onStop', () => clearTimeout(timer));
        return subscribable;
    };
}
