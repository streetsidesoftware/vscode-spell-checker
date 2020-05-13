import { uniqueFilter, isDefined } from './util';

describe('Validate Util Functions', () => {
    test('Unique filter', () => {
        expect([].filter(uniqueFilter())).toEqual([]);
        expect([1, 2, 3].filter(uniqueFilter())).toEqual([1, 2, 3]);
        expect([1, 2, 3, 3, 2, 1].filter(uniqueFilter())).toEqual([1, 2, 3]);
        const a = { id: 'a', v: 1 };
        const b = { id: 'b', v: 1 };
        const aa = { id: 'a', v: 2 };
        expect([a, a, b, aa, b].filter(uniqueFilter())).toEqual([a, b, aa]);
        expect([a, a, b, aa, b, aa].filter(uniqueFilter(a => a.id))).toEqual([a, b]);
    });

    test('isDefined', () => {
        const values = ['hello', 'how', undefined, 'are', 'you', null, '?'];
        const strings: string[] = values.filter(isDefined);
        expect(values).toContainEqual(undefined)
        expect(strings).not.toContainEqual(undefined)
    });
});
