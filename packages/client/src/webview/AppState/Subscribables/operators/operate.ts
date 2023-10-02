import { createSubscribable } from '../createFunctions';
import { toSubscriber } from '../helpers/toSubscriber';
import type { Subscribable, SubscriberLike } from '../Subscribables';

export type OperateFn<T, U> = (value: T, emitter: (value: U) => void) => void;

export function operate<T, U>(subscribable: Subscribable<T>, next: OperateFn<T, U>): Subscribable<U> {
    function subscribe(target: SubscriberLike<U>) {
        const subscriber = toSubscriber(target);
        const emit = (value: U) => subscriber.notify(value);
        return subscribable.subscribe({
            notify: (value: T) => {
                next(value, emit);
            },
            done: () => subscriber.done?.(),
        });
    }

    return createSubscribable<U>(subscribe);
}
