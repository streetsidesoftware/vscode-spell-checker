import { createSubscribable } from '../functions';
import type { Subscribable } from '../Subscribables';

export type OperateFn<T, U> = (value: T, emitter: (value: U) => void) => void;

export function operate<T, U>(subscribable: Subscribable<T>, next: OperateFn<T, U>): Subscribable<U> {
    function subscribe(emitter: (v: U) => void) {
        return subscribable.subscribe((value: T) => {
            next(value, emitter);
        });
    }

    return createSubscribable<U>(subscribe);
}
