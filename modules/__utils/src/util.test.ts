import { freqCount, isDefined, mustBeDefined, pick, setIfDefined, textToWords, unique, uniqueFilter } from './util';

describe('Util', () => {
    test('unique', () => {
        expect(unique([1, 2, 3, 4, 2, 3, 2])).toEqual([1, 2, 3, 4]);
    });

    test('uniqueFilter', () => {
        expect([1, 2, 3, 4, 2, 3, 2].filter(uniqueFilter())).toEqual([1, 2, 3, 4]);
    });

    test('freqCount', () => {
        expect(freqCount([1, 2, 3, 4, 2, 3, 2])).toEqual([
            [1, 1],
            [2, 3],
            [3, 2],
            [4, 1],
        ]);
    });

    test('mustBeDefined', () => {
        expect(mustBeDefined('hello')).toBe('hello');
        expect(() => mustBeDefined(undefined)).toThrowError('Value must be defined.');
    });
});

describe('Validate Util Functions', () => {
    test('Unique filter', () => {
        expect([].filter(uniqueFilter())).toEqual([]);
        expect([1, 2, 3].filter(uniqueFilter())).toEqual([1, 2, 3]);
        expect([1, 2, 3, 3, 2, 1].filter(uniqueFilter())).toEqual([1, 2, 3]);
        const a = { id: 'a', v: 1 };
        const b = { id: 'b', v: 1 };
        const aa = { id: 'a', v: 2 };
        expect([a, a, b, aa, b].filter(uniqueFilter())).toEqual([a, b, aa]);
        expect([a, a, b, aa, b, aa].filter(uniqueFilter((a) => a.id))).toEqual([a, b]);
    });

    test('isDefined', () => {
        const values = ['hello', 'how', undefined, 'are', 'you', null, '?'];
        const strings: string[] = values.filter(isDefined);
        expect(values).toEqual(expect.arrayContaining([undefined, null, 'you']));
        expect(strings).toEqual(expect.not.arrayContaining([undefined, null]));
    });

    interface TestTextToWords {
        line: string;
        expected: string[];
    }
    test.each`
        line                               | expected
        ${'hello'}                         | ${['hello']}
        ${'hello|there'}                   | ${'hello|there'.split('|')}
        ${'coffee|at|the|café'}            | ${'coffee|at|the|café'.split('|')}
        ${'My $trip to the café was 4un!'} | ${['My', 'trip', 'to', 'the', 'café', 'was', '4un']}
        ${"winter's...weather"}            | ${["winter's", 'weather']}
        ${'one\ntwo\nthree\n'}             | ${['one', 'two', 'three']}
        ${'one-two-three\n'}               | ${['one-two-three']}
        ${'spéciale geschäft'}             | ${['spéciale', 'geschäft']}
        ${'aåáâäñãæ'}                      | ${['aåáâäñãæ']}
    `('textToWords "$line"', ({ line, expected }: TestTextToWords) => {
        const r = textToWords(line);
        expect(r).toEqual(expected);
        const r2 = textToWords(line.normalize('NFD'));
        expect(r2).toEqual(expected);
    });

    test('pick', () => {
        const src = {
            a: 'aaa',
            b: { ba: 'a', bb: 'b' },
            c: 'ccc',
        } as const;

        const r = pick(Object.freeze(src), ['a', 'b']);
        expect(r).toEqual({ a: src.a, b: src.b });
    });

    test('setIfDefined', () => {
        interface Person {
            name: string;
            dob?: string;
        }

        const p0: Person = { name: 'tester' };
        setIfDefined(p0, 'dob', 'today');
        setIfDefined(p0, 'name', undefined);
        expect(p0).toEqual({ name: 'tester', dob: 'today' });
    });

    // cspell:ignore spéciale geschäft aåáâäñãæ
});
