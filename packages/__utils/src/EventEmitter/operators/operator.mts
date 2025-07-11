import { createEmitter } from '../createEmitter.mjs';
import type { Disposable, EventEmitter, EventOperator } from '../types.mjs';

/**
 * Helper function to create an event operators.
 * It will lazy create a new event emitter to handle the new event stream.
 * When the last listener is removed, it will dispose the emitter and the source event.
 * @param fn - function to call with each value from the source event.
 * @param dispose - optional disposable to call when the operator is disposed.
 * @returns an event operator function.
 */
export function operator<T, U>(fn: (value: T, fire: (value: U) => void) => void, dispose?: Disposable): EventOperator<T, U> {
    let _emitter: EventEmitter<U> | undefined;
    let _count = 0;
    let _detachSource: Disposable | undefined;

    return (source) => (subscriber) => {
        const emitter = (_emitter ??= createEmitter<U>());
        const dEvent = emitter.event(subscriber);
        _detachSource ??= source((value) => { fn(value, emitter.fire); });
        ++_count;
        return {
            dispose() {
                if (_count) {
                    --_count;
                    dEvent.dispose();
                    if (!_count) {
                        try {
                            dispose?.dispose();
                            _emitter?.dispose();
                            _detachSource?.dispose();
                        } finally {
                            _emitter = undefined;
                            _detachSource = undefined;
                        }
                    }
                }
            },
        };
    };
}
