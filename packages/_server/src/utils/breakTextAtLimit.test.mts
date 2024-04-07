import { describe, expect, test } from 'vitest';

import { breakTextAtLimit } from './breakTextAtLimit.mjs';

describe('breakTextAtLimit', () => {
    test.each`
        line         | limit | expected
        ${'a'}       | ${1}  | ${'a'}
        ${'abc'}     | ${1}  | ${''}
        ${'abc def'} | ${3}  | ${'abc'}
        ${'abc def'} | ${4}  | ${'abc '}
        ${'abc def'} | ${5}  | ${'abc '}
        ${'abc def'} | ${6}  | ${'abc '}
        ${'abc def'} | ${7}  | ${'abc def'}
        ${'abc def'} | ${8}  | ${'abc def'}
    `('breakTextAtLimit $line $limit', ({ line, limit, expected }) => {
        expect(breakTextAtLimit(line, limit)).toBe(expected);
    });
});
