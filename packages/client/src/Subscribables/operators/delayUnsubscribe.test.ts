import { createDisposable, disposeOf } from 'utils-disposables';
import { describe, expect, test, vi } from 'vitest';

import { createSubscribable } from '../createFunctions.js';
import { toSubscriberFn } from '../helpers/toSubscriber.js';
import { rx } from '../rx.js';
import type { SubscribeFn, SubscriberFn, SubscriberLike } from '../Subscribables.js';
import { delayUnsubscribe } from './delayUnsubscribe.js';

describe('delayUnsubscribe', () => {
    test('delayUnsubscribe', () => {
        const receiver = vi.fn();
        const defaultEmitter = () => undefined;
        let emitter: SubscriberFn<number> = defaultEmitter;
        const resetEmitter = vi.fn(() => (emitter = defaultEmitter));
        expect(emitter).toBe(defaultEmitter);
        const source: SubscribeFn<number> = (subscriber: SubscriberLike<number>) => {
            emitter = toSubscriberFn(subscriber);
            return createDisposable(resetEmitter);
        };
        const sub = createSubscribable<number>(source);

        // Since there haven't been any subscribers, do not expect the emitter to change.
        expect(emitter).toBe(defaultEmitter);
        const dispose1 = sub.subscribe(receiver);
        expect(emitter).not.toBe(defaultEmitter);
        // There should be a new emitter.
        expect(emitter).not.toBe(defaultEmitter);
        disposeOf(dispose1);
        // Expect the emitter to be restored.
        expect(emitter).toBe(defaultEmitter);

        const opDelayUnsubscribe = delayUnsubscribe<number>(10000);

        const subDelayed = opDelayUnsubscribe(sub);

        // Expect the emitter to still be the default.
        expect(emitter).toBe(defaultEmitter);

        const dispose2 = subDelayed.subscribe(receiver);
        // There should be a new emitter.
        expect(emitter).not.toBe(defaultEmitter);
        const emitter2 = emitter;
        emitter(42);
        expect(receiver).toHaveBeenLastCalledWith(42);
        disposeOf(dispose2);
        // The emitter should still be emitter2;
        expect(emitter).toBe(emitter2);
        emitter(27);
        expect(receiver).toHaveBeenLastCalledWith(42);
        disposeOf(subDelayed);
        expect(emitter).toBe(defaultEmitter);
    });

    test('delayUnsubscribe rx', () => {
        const receiver = vi.fn();
        const defaultEmitter = () => undefined;
        let emitter: SubscriberFn<number> = defaultEmitter;
        const resetEmitter = vi.fn(() => (emitter = defaultEmitter));
        expect(emitter).toBe(defaultEmitter);
        const source: SubscribeFn<number> = (subscriber: SubscriberLike<number>) => {
            emitter = toSubscriberFn(subscriber);
            return createDisposable(resetEmitter);
        };
        const sub = createSubscribable<number>(source);

        // Since there haven't been any subscribers, do not expect the emitter to change.
        expect(emitter).toBe(defaultEmitter);
        const dispose1 = sub.subscribe(receiver);
        expect(emitter).not.toBe(defaultEmitter);
        // There should be a new emitter.
        expect(emitter).not.toBe(defaultEmitter);
        disposeOf(dispose1);
        // Expect the emitter to be restored.
        expect(emitter).toBe(defaultEmitter);

        const subDelayed = rx(sub, delayUnsubscribe(10000));

        // Expect the emitter to still be the default.
        expect(emitter).toBe(defaultEmitter);

        const dispose2 = subDelayed.subscribe(receiver);
        // There should be a new emitter.
        expect(emitter).not.toBe(defaultEmitter);
        const emitter2 = emitter;
        emitter(42);
        expect(receiver).toHaveBeenLastCalledWith(42);
        disposeOf(dispose2);
        // The emitter should still be emitter2;
        expect(emitter).toBe(emitter2);
        emitter(27);
        expect(receiver).toHaveBeenLastCalledWith(42);
        disposeOf(subDelayed);
        expect(emitter).toBe(defaultEmitter);
    });
});
