import { isRegExp, toRegExp } from './evaluateRegExp';

describe('EvaluateRegExp', () => {
    test('isRegExp', () => {
        expect(isRegExp('/hello/')).toBe(false);
        expect(isRegExp(/hello/g)).toBe(true);
    });

    test('toRegExp', () => {
        expect(toRegExp(/hello/)).toEqual(/hello/);
        expect(toRegExp('/hello/')).toEqual(/hello/);
        expect(toRegExp('hello')).toEqual(/hello/);
        expect(toRegExp('hello', 'g')).toEqual(/hello/g);
        expect(toRegExp('/hello/g')).toEqual(/hello/g);
    });
});
