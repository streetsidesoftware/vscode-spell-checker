import { promisify } from 'util';
import { describe, expect, test } from 'vitest';

import { debounce } from './debounce.mjs';

const sleep = promisify(setTimeout);

describe('debounce', () => {
    test('debounce', () => {
        let i = 0;
        const fn = (_k: string) => ++i;
        const dbFn = debounce(fn, 100);

        expect(dbFn('a')).toBe(1);
        expect(dbFn('a')).toBe(1);
        expect(dbFn('a')).toBe(1);
        expect(dbFn('a')).toBe(1);
        expect(dbFn('b')).toBe(2);
        expect(dbFn('a')).toBe(1);
        expect(dbFn('b')).toBe(2);
        expect(dbFn('a')).toBe(1);
        expect(dbFn('b')).toBe(2);
    });

    test('debounce clears', async () => {
        let i = 0;
        const fn = (_k: string) => ++i;
        const dbFn = debounce(fn, 1);

        expect(dbFn('a')).toBe(1);
        expect(dbFn('a')).toBe(1);
        expect(dbFn('a')).toBe(1);
        expect(dbFn('b')).toBe(2);

        await sleep(100);

        expect(dbFn('a')).toBe(3);
        expect(dbFn('a')).toBe(3);
        expect(dbFn('a')).toBe(3);
        expect(dbFn('b')).toBe(4);
    });
});
