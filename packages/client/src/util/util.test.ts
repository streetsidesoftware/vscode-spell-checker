import { unique, uniqueFilter, freqCount } from './util';

describe('Util', () => {
    test('unique', () => {
        expect(unique([1,2,3,4,2,3,2])).toEqual([1,2,3,4]);
    });

    test('uniqueFilter', () => {
        expect([1,2,3,4,2,3,2].filter(uniqueFilter())).toEqual([1,2,3,4]);
    });

    test('freqCount', () => {
        expect(freqCount([1,2,3,4,2,3,2])).toEqual([[1,1],[2,3],[3,2],[4,1]]);
    });
});
