import { createDisposable, disposeOf } from 'utils-disposables';

import type { SubscribeFn, SubscriberFn } from '..';
import { createSubscribable, delayUnsubscribe } from '..';

describe('delayUnsubscribe', () => {
    test('delayUnsubscribe', () => {
        const receiver = jest.fn();
        const defaultEmitter = () => undefined;
        let emitter: SubscriberFn<number> = defaultEmitter;
        const resetEmitter = jest.fn(() => (emitter = defaultEmitter));
        expect(emitter).toBe(defaultEmitter);
        const source: SubscribeFn<number> = (subscriber: SubscriberFn<number>) => {
            emitter = subscriber;
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
});
