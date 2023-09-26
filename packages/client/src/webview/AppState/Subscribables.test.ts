import { awaitForSubscribable, createEmitter, createStoreValue, createSubscribableValue } from './Subscribables';

describe('Subscribables', () => {
    test('createEmitter', () => {
        const emitter = createEmitter<number>();
        const sub = jest.fn();
        emitter.subscribe(sub);
        expect(sub).not.toHaveBeenCalled();
        emitter.emit(7);
        expect(sub).toHaveBeenLastCalledWith(7);
        const sub2 = jest.fn();
        const d2 = emitter.subscribe(sub2);
        expect(sub2).not.toHaveBeenCalled();
        emitter.emit(49);
        expect(sub).toHaveBeenLastCalledWith(49);
        expect(sub2).toHaveBeenLastCalledWith(49);
        d2.dispose();
        emitter.emit(42);
        expect(sub).toHaveBeenLastCalledWith(42);
        expect(sub2).toHaveBeenLastCalledWith(49);
        emitter.dispose();
        emitter.emit(99);
        expect(sub).toHaveBeenLastCalledWith(42);
        expect(sub2).toHaveBeenLastCalledWith(49);
    });

    test('awaitForSubscribable', async () => {
        const emitter = createEmitter<number>();
        const pValue = awaitForSubscribable(emitter);
        emitter.emit(42);
        await expect(pValue).resolves.toBe(42);
    });

    test('createStoreValue', async () => {
        const store = createStoreValue(5);
        expect(store.value).toBe(5);
        store.set(7);
        expect(store.value).toBe(7);
        const cb = jest.fn();
        store.subscribe(cb);
        expect(cb).toHaveBeenLastCalledWith(7);
        store.dispose();
    });

    test('createSubscribableValue', async () => {
        const source = createEmitter<number>();
        const sub = createSubscribableValue((s) => source.subscribe(s));
        const pValue = awaitForSubscribable(sub);
        source.emit(6);
        await expect(pValue).resolves.toBe(6);
        sub.dispose();
    });
});
