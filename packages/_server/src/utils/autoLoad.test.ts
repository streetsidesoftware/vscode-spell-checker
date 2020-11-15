import { createAutoLoadCache, createLazyValue } from './autoLoad';

describe('Validate AutoLoadCache', () => {
    test('create', () => {
        let n = 0;
        const loader = (key: number) => key + n++;
        const cache = createAutoLoadCache(loader);
        expect(cache(5)).toEqual(5 + n - 1);
        expect(n).toEqual(1);
        expect(cache.has(5)).toBe(true);
        expect(cache.has(4)).toBe(false);
        expect(cache(4)).toEqual(4 + n - 1);
        expect(n).toEqual(2);
        expect(cache(5)).toEqual(5 + n - 2);
        expect(n).toEqual(2);
        cache.delete(5);
        expect(cache(5)).toEqual(5 + n - 1);
        expect(n).toEqual(3);
        cache.clear();
        expect(cache).toEqual(cache.get);
    });
});

describe('Validate LazyValue', () => {
    test('', () => {
        let n = 0;
        const loader = () => n++;
        const value = createLazyValue(loader);
        expect(n).toEqual(0);
        expect(value()).toEqual(0);
        expect(value()).toEqual(0);
        value.clear();
        expect(value()).toEqual(1);
    });
});
