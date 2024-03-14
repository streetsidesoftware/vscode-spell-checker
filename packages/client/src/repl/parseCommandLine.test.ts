import { describe, expect, test } from 'vitest';

import { commandLineBuilder, parseCommandLine, parseCommandLineIntoArgs } from './parseCommandLine.js';

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
        expect(parseCommandLineIntoArgs(line)).toEqual(expected);
    });

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
        ${'a "b c'}    | ${['a', 'b c']}
        ${"a 'b c "}   | ${['a', 'b c ']}
    `('parseCommandLine $line', ({ line, expected }) => {
        const result = parseCommandLine(line);
        expect(result.args).toEqual(expected);
        expect(result.line).toBe(line);
        expect(result.tokens.map((t) => t.original).join('')).toBe(line);
    });
});

describe('CommandLineBuilder', () => {
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
        ${'a "b c'}    | ${['a', 'b c']}
        ${"a 'b c "}   | ${['a', 'b c ']}
    `('commandLineBuilder $line', ({ line, expected }) => {
        const builder = commandLineBuilder(line);
        expect(builder.args).toEqual(expected);
        expect(builder.line).toBe(line);
        expect(builder.tokens.map((t) => t.original).join('')).toBe(line);
    });
});
