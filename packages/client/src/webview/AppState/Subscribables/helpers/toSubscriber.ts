import type { Subscriber, SubscriberFn, SubscriberLike } from '../Subscribables';

export function toSubscriber<T>(subscriberLike: SubscriberLike<T>): Subscriber<T> {
    if (typeof subscriberLike !== 'function') return subscriberLike;
    return {
        notify: subscriberLike,
    };
}

export function toSubscriberFn<T>(subscriberLike: SubscriberLike<T>): SubscriberFn<T> {
    if (typeof subscriberLike === 'function') return subscriberLike;
    return (value) => subscriberLike.notify(value);
}
