import { createEmitter, createSubscribable } from './createFunctions';
import { awaitSubscribable } from './helpers/awaitSubscribable';
import { delayUnsubscribe } from './operators/delayUnsubscribe';

describe('Subscribables', () => {
    test('createEmitter', () => {
        const emitter = createEmitter<number>();
        const sub = jest.fn();
        emitter.subscribe(sub);
        expect(sub).not.toHaveBeenCalled();
        emitter.notify(7);
        expect(sub).toHaveBeenLastCalledWith(7);
        const sub2 = jest.fn();
        const d2 = emitter.subscribe(sub2);
        expect(sub2).not.toHaveBeenCalled();
        emitter.notify(49);
        expect(sub).toHaveBeenLastCalledWith(49);
        expect(sub2).toHaveBeenLastCalledWith(49);
        d2.dispose();
        emitter.notify(42);
        expect(sub).toHaveBeenLastCalledWith(42);
        expect(sub2).toHaveBeenLastCalledWith(49);
        emitter.done();
        emitter.notify(99);
        expect(sub).toHaveBeenLastCalledWith(42);
        expect(sub2).toHaveBeenLastCalledWith(49);
    });

    test('awaitForSubscribable', async () => {
        const emitter = createEmitter<number>();
        const pValue = awaitSubscribable(emitter);
        emitter.notify(42);
        await expect(pValue).resolves.toBe(42);
    });

    test('createSubscribableValue', async () => {
        const source = createEmitter<number>();
        const sub = delayUnsubscribe<number>(5000)(source);
        const pValue = awaitSubscribable(sub);
        source.notify(6);
        await expect(pValue).resolves.toBe(6);
        sub.dispose?.();
    });

    test('createSubscribable', async () => {
        const source = createEmitter<number>();
        const sub = createSubscribable<number>((s) => source.subscribe(s));
        const pValue = awaitSubscribable(sub);
        source.notify(6);
        await expect(pValue).resolves.toBe(6);
        sub.dispose();
    });
});
