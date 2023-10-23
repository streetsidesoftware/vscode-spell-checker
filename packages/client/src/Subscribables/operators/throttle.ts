import type { OperatorFn } from '../Subscribables';
import { operate } from './operate';

const symbolNotSet = Symbol('not set');
type SymbolNotSet = typeof symbolNotSet;

/**
 * Throttle the release of events.
 * @param waitMs - delay in milliseconds.
 * @returns
 */
export function throttle<T>(waitMs: number): OperatorFn<T, T> {
    let pendingValue: T | SymbolNotSet = symbolNotSet;
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;

    return (source) => {
        const subscribable = operate(source, (value, notify) => {
            pendingValue = value;
            if (timer) {
                return;
            }
            function handleTimer() {
                const value = pendingValue;
                pendingValue = symbolNotSet;
                timer = undefined;
                if (value !== symbolNotSet) {
                    timer = setTimeout(handleTimer, waitMs);
                    notify(value);
                }
            }

            handleTimer();
        });
        subscribable.onEvent('onStop', () => clearTimeout(timer));
        return subscribable;
    };
}
