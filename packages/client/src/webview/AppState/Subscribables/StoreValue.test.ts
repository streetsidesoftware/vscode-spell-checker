import { awaitForSubscribable, createEmitter, createSubscribable } from './functions';
import { createStoreValue } from './StoreValue';

describe('StoreValue', () => {
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
        const sub = createSubscribable((s) => source.subscribe(s));
        const pValue = awaitForSubscribable(sub);
        source.notify(6);
        await expect(pValue).resolves.toBe(6);
        sub.dispose();
    });
});
