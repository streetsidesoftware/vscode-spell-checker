import { parse, stringify } from 'comment-json';
import { describe, expect, test } from 'vitest';

import { addWordsFn, removeWordsFn } from './configUpdaters.mjs';

describe('Validate configUpdaters', () => {
    test.each`
        current       | toAdd              | expected
        ${[]}         | ${[]}              | ${[]}
        ${[]}         | ${['a']}           | ${['a']}
        ${['b', 'a']} | ${['a']}           | ${['a', 'b']}
        ${['c', 'b']} | ${['a', 'd', 'c']} | ${['a', 'b', 'c', 'd']}
    `('addWordsFn $toAdd', ({ toAdd, current, expected }) => {
        const fn = addWordsFn(toAdd);
        expect(fn(current)).toEqual(expected);
    });

    test.each`
        current            | toRemove      | expected
        ${[]}              | ${[]}         | ${[]}
        ${[]}              | ${['a']}      | ${[]}
        ${['b', 'a']}      | ${['a']}      | ${['b']}
        ${['c', 'b']}      | ${['a']}      | ${['b', 'c']}
        ${['c', 'd', 'b']} | ${['d', 'a']} | ${['b', 'c']}
    `('removeWordsFn $toRemove', ({ toRemove, current, expected }) => {
        const fn = removeWordsFn(toRemove);
        expect(fn(current)).toEqual(expected);
    });

    const sampleWordsJson = `\
[
    "b", // comment b
    "a", // comment a
    /* block comment before c */
    "c", // line comment c
    /* block comment before d */
    "d"
]`;

    test('addWords to source with comments', () => {
        const fn = addWordsFn(['e', '0', 'cat']);
        const sampleWords = parse(stringify(parse(sampleWordsJson), null, 4)) as string[];
        const result = fn(sampleWords);
        expect(result).toEqual(['0', 'a', 'b', 'c', 'cat', 'd', 'e']);
        expect(stringify(result, null, 4)).toEqual(`\
[
    "0",
    "a", // comment a
    "b", // comment b
    /* block comment before c */
    "c", // line comment c
    "cat",
    /* block comment before d */
    "d",
    "e"
]`);
    });

    test('remove words from source with comments', () => {
        const fn = removeWordsFn(['b', 'cat', 'd']);
        const sampleWords = parse(stringify(parse(sampleWordsJson), null, 4)) as string[];
        const result = fn(sampleWords);
        expect(result).toEqual(['a', 'c']);
        expect(stringify(result, null, 4)).toEqual(`\
[
    "a", // comment a
    /* block comment before c */
    "c" // line comment c
]`);
    });
});
