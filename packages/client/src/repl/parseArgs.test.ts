import { describe, expect, test } from 'vitest';

import { argsToCommandLine, parseArgs } from './parseArgs.js';

describe('parseArgs', () => {
    test.each`
        line           | expected
        ${''}          | ${[]}
        ${'a b c'}     | ${['a', 'b', 'c']}
        ${'a "" c'}    | ${['a', '', 'c']}
        ${'a\\ b c'}   | ${['a b', 'c']}
        ${'a\\ b c'}   | ${['a b', 'c']}
        ${'"a b" c'}   | ${['a b', 'c']}
        ${'"a\\ b" c'} | ${['a\\ b', 'c']}
        ${'a\\\\\\g'}  | ${['a\\g']}
        ${'a\\"'}      | ${['a"']}
    `('parseArgs $line', ({ line, expected }) => {
        expect(parseArgs(line)).toEqual(expected);
    });

    test.each`
        args               | expected
        ${[]}              | ${''}
        ${['a', '', 'b']}  | ${'a "" b'}
        ${['a', 'b', 'c']} | ${'a b c'}
        ${['a b', 'c']}    | ${'a\\ b c'}
        ${['a\\ b', 'c']}  | ${'"a\\\\ b" c'}
        ${['a\\g']}        | ${'"a\\\\g"'}
        ${['a"']}          | ${'"a\\""'}
        ${['\n']}          | ${'"\\n"'}
    `('argsToCommandLine $args', ({ args, expected }) => {
        expect(argsToCommandLine(args)).toEqual(expected);
    });
});
