import { uniqueFilter, isDefined, textToWords } from './util';

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

    // cspell:ignore spéciale geschäft aåáâäñãæ
});
