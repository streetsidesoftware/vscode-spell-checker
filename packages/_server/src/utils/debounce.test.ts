import { debounce } from './debounce';
import { promisify } from 'util';

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
