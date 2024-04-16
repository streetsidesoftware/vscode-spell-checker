import { describe, expect, test, vi } from 'vitest';

import { createAutoResolveCache, createAutoResolveWeakCache } from './AutoResolve.js';

describe('AutoResolve', () => {
    test('createAutoResolveCache', () => {
        const cache = createAutoResolveCache<string, string>();

        const resolver = vi.fn((s: string) => s.toUpperCase());

        expect(cache.get('hello')).toBe(undefined);
        expect(cache.get('hello', resolver)).toBe('HELLO');
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(cache.get('hello', resolver)).toBe('HELLO');
        expect(resolver).toHaveBeenCalledTimes(1);
        cache.set('hello', 'hello');
        expect(cache.get('hello', resolver)).toBe('hello');
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(cache.get('a', resolver)).toBe('A');
        expect(resolver).toHaveBeenCalledTimes(2);
    });

    test('createAutoResolveWeakCache', () => {
        const cache = createAutoResolveWeakCache<{ name: string }, string>();

        const resolver = vi.fn((v: { name: string }) => v.name.toUpperCase());

        const tagHello = { name: 'hello' };
        const tagHello2 = { ...tagHello };
        const tagA = { name: 'a' };
        expect(cache.get(tagHello)).toBe(undefined);
        expect(cache.get(tagHello, resolver)).toBe('HELLO');
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(cache.get(tagHello, resolver)).toBe('HELLO');
        expect(resolver).toHaveBeenCalledTimes(1);
        cache.set(tagHello, 'hello');
        expect(cache.get(tagHello, resolver)).toBe('hello');
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(cache.get(tagA, resolver)).toBe('A');
        expect(resolver).toHaveBeenCalledTimes(2);
        expect(cache.get(tagHello2)).toBe(undefined);
        expect(cache.get(tagHello2, resolver)).toBe('HELLO');
        expect(resolver).toHaveBeenCalledTimes(3);
        expect(cache.stats()).toEqual({
            hits: 2,
            misses: 5,
            deletes: 0,
            resolved: 3,
            sets: 1,
            disposals: 0,
            clears: 0,
        });
        expect(cache.get(tagHello2, resolver)).toBe('HELLO');
        expect(cache.stats()).toEqual({
            hits: 3,
            misses: 5,
            deletes: 0,
            resolved: 3,
            sets: 1,
            disposals: 0,
            clears: 0,
        });
        cache.delete(tagHello);
        expect(cache.stats()).toEqual({
            hits: 3,
            misses: 5,
            deletes: 1,
            resolved: 3,
            sets: 1,
            disposals: 0,
            clears: 0,
        });
        expect(cache.get(tagHello, resolver)).toBe('HELLO');
        expect(cache.stats()).toEqual({
            hits: 3,
            misses: 6,
            deletes: 1,
            resolved: 4,
            sets: 1,
            disposals: 0,
            clears: 0,
        });
        const weakMap = cache.map;
        cache.clear();
        const weakMap2 = cache.map;
        expect(weakMap2).toBe(cache.map);
        expect(weakMap2).not.toBe(weakMap);
        expect(cache.stats()).toEqual({
            hits: 0,
            misses: 0,
            deletes: 0,
            resolved: 0,
            sets: 0,
            disposals: 0,
            clears: 1,
        });
        cache.dispose();
        expect(cache.map).not.toBe(weakMap2);
        expect(cache.stats()).toEqual({
            hits: 0,
            misses: 0,
            deletes: 0,
            resolved: 0,
            sets: 0,
            disposals: 1,
            clears: 2,
        });
    });
});
