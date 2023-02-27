import { compare, compareBy, compareByRev, compareEach, reverse } from './Comparable';

describe('Validate Comparable', () => {
    test('compare', () => {
        expect(compare(1, 2)).toBeLessThan(0);
        expect(compare(1, 1)).toBe(0);
        expect(compare(2, 1)).toBeGreaterThan(0);
        expect(compare('a', 'b')).toBeLessThan(0);
        expect(compare('a', 'a')).toBe(0);
        expect(compare('b', 'a')).toBeGreaterThan(0);
        expect(compare('a', undefined)).toBeLessThan(0);
        expect(compare(undefined, undefined)).toBe(0);
        expect(compare(undefined, 'a')).toBeGreaterThan(0);
        expect(compare(null, undefined)).toBeLessThan(0);
        expect(compare(undefined, null)).toBeGreaterThan(0);
        expect(compare('a', null)).toBeLessThan(0);
        expect(compare(null, null)).toBe(0);
        expect(compare(null, 'a')).toBeGreaterThan(0);
        expect(compare(new Date('2018-01-01'), new Date('2018-01-02'))).toBeLessThan(0);
        expect(compare(new Date('2018-01-01'), new Date('2018-01-01'))).toBe(0);
        expect(compare(new Date('2018-01-02'), new Date('2018-01-01'))).toBeGreaterThan(0);
    });

    test('compareBy', () => {
        expect(
            samples()
                .sort(compareBy('name', 'value'))
                .map((a) => a.id)
        ).toEqual([0, 1, 3, 2, 4]);
        expect(
            samples()
                .sort(compareBy('value', 'name'))
                .map((a) => a.id)
        ).toEqual([3, 4, 2, 0, 1]);
        expect(
            samples()
                .sort(compareBy('name', 'maybe'))
                .map((a) => a.id)
        ).toEqual([0, 1, 2, 3, 4]);
        // Expect undefined to be at the end.
        expect(
            samples()
                .sort(compareBy('maybe', 'name', 'value'))
                .map((a) => a.id)
        ).toEqual([0, 3, 2, 1, 4]);
    });

    test('reverse', () => {
        const cmp = (a: number, b: number) => a - b;
        expect(reverse(cmp)(1, 5)).toBe(4);
        expect(reverse(cmp)(5, 5)).toBe(0);
        expect(reverse(cmp)(10, 5)).toBe(-5);
    });

    test('compareEach', () => {
        expect(
            samples()
                .sort(compareEach(compareBy('name'), compareBy('value')))
                .map((a) => a.id)
        ).toEqual([0, 1, 3, 2, 4]);
        expect(
            samples()
                .sort(compareEach(compareByRev('name'), compareBy('value')))
                .map((a) => a.id)
        ).toEqual([4, 3, 2, 0, 1]);
    });
});

interface Sample {
    id: number;
    name: string;
    value: number;
    maybe: number | undefined;
}

function samples(): Sample[] {
    return [
        { name: 'A', value: 42, maybe: 5 },
        { name: 'A', value: 402, maybe: undefined },
        { name: 'B', value: 20, maybe: 10 },
        { name: 'B', value: 2, maybe: 10 },
        { name: 'C', value: 2, maybe: undefined },
    ].map((v, id) => ({ id, ...v }));
}
