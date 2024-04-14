import { describe, expect, test } from 'vitest';

import { commandLineBuilder, parseCommandLine, parseCommandLineIntoArgs } from './parseCommandLine.mjs';

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
        line                           | expected
        ${''}                          | ${[]}
        ${'a b c'}                     | ${['a', 'b', 'c']}
        ${'a "" c'}                    | ${['a', '', 'c']}
        ${'a\\ b c'}                   | ${['a b', 'c']}
        ${'a\\ b c'}                   | ${['a b', 'c']}
        ${'"a b" c'}                   | ${['a b', 'c']}
        ${'"a\\ b" c'}                 | ${['a\\ b', 'c']}
        ${'a\\\\\\g'}                  | ${['a\\g']}
        ${'a\\"'}                      | ${['a"']}
        ${'a "b c'}                    | ${['a', 'b c']}
        ${"a 'b c "}                   | ${['a', 'b c ']}
        ${'check \\\n  "*.md"'}        | ${['check', '*.md']}
        ${'echo "hello \\\nthere'}     | ${['echo', 'hello there']}
        ${'echo "hello \\\r\nthere'}   | ${['echo', 'hello there']}
        ${'echo "hello \\\n\r\nthere'} | ${['echo', 'hello \r\nthere']}
    `('commandLineBuilder $line', ({ line, expected }) => {
        const builder = commandLineBuilder(line);
        expect(builder.args).toEqual(expected);
        expect(builder.line).toBe(line);
        expect(builder.tokens.map((t) => t.original).join('')).toBe(line);
    });

    test('commandLineBuilder set and add', () => {
        const builder = commandLineBuilder('');
        expect(builder.args).toEqual([]);
        expect(builder.line).toBe('');
        builder.pushArg('check');
        expect(builder.args).toEqual(['check']);
        expect(builder.line).toBe('check');
        builder.pushArg('*.md');
        expect(builder.args).toEqual(['check', '*.md']);
        expect(builder.line).toBe('check *.md');
        builder.setArg(1, '*.txt', '"');
        expect(builder.args).toEqual(['check', '*.txt']);
        expect(builder.line).toBe('check "*.txt"');
        builder.pushArg('--sep=&');
        expect(builder.args).toEqual(['check', '*.txt', '--sep=&']);
        expect(builder.line).toBe('check "*.txt" --sep=\\&');
        expect(builder.hasTrailingSeparator()).toBe(false);
        builder.pushSeparator();
        expect(builder.hasTrailingSeparator()).toBe(true);
    });
});
