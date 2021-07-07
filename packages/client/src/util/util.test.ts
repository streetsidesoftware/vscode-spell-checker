import { unique, uniqueFilter, freqCount, mustBeDefined } from './util';

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
