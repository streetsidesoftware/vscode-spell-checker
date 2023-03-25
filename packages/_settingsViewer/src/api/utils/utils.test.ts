import { describe, expect, test } from 'vitest';

import { tf } from '.';

describe('Utils', () => {
    test('tf', () => {
        const one: boolean | number = 1;
        const zero: boolean | number = 0;
        expect(tf(true)).toBe('true');
        expect(tf(false)).toBe('false');
        expect(tf(undefined)).toBe('undefined');
        expect(tf(null as unknown as boolean)).toBe('null');
        expect(tf(one as unknown as boolean)).toBe('true like');
        expect(tf(zero as unknown as boolean)).toBe('false like');
    });
});
