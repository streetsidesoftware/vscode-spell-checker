import { describe, expect, test } from 'vitest';

import { removeLeftPad, splitIntoLines } from './textUtils.mjs';

describe('textUtils', () => {
    test('splitIntoLines should split text into lines of specified width', () => {
        const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        const width = 10;
        const expectedLines = ['Lorem', 'ipsum', 'dolor sit', 'amet,', 'consectetur', 'adipiscing', 'elit.'];

        const result = splitIntoLines(text, width);

        expect(result).toEqual(expectedLines);
    });

    test('splitIntoLines should honor \\n', () => {
        const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\t- one\n\t- two\n';
        const width = 20;
        const expectedLines = removeLeftPad(`\
            Lorem ipsum dolor
            sit amet,
            consectetur
            adipiscing elit.
                - one
                - two
            `).split('\n');

        const result = splitIntoLines(text, width);

        expect(result).toEqual(expectedLines);
    });
    test('splitIntoLines does NOT split words', () => {
        const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        const width = 1;
        const expectedLines = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipiscing', 'elit.'];

        const result = splitIntoLines(text, width);

        expect(result).toEqual(expectedLines);
    });

    test('splitIntoLines should handle empty text', () => {
        const text = '';
        const width = 5;
        const expectedLines: string[] = [''];

        const result = splitIntoLines(text, width);

        expect(result).toEqual(expectedLines);
    });

    // Add more test cases here...
});

describe('removeLeftPad', () => {
    test('removeLeftPad should remove left padding from multi-line text', () => {
        const input = `\
        This is a command with unnecessary complexity and options.
        Even the description is long and verbose. with a lot of words and new lines.
    `;
        const expectedOutput = `This is a command with unnecessary complexity and options.
Even the description is long and verbose. with a lot of words and new lines.
`;

        const result = removeLeftPad(input);

        expect(result).toBe(expectedOutput);
    });
});
