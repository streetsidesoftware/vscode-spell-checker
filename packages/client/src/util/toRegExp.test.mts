import { describe, expect, test } from 'vitest';

import { isRegExp, toRegExp } from './toRegExp.js';

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
