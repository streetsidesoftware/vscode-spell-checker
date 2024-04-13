import { describe, expect, test } from 'vitest';

import { calcFileTypes } from './calcFileTypes.mjs';

describe('calcFileTypes', () => {
    test.each`
        url                | expected
        ${import.meta.url} | ${['typescript']}
        ${'./file.js'}     | ${['javascript']}
        ${'./README.md'}   | ${['markdown']}
        ${'./dir/'}        | ${[]}
        ${'./example.py'}  | ${['python']}
    `('calcFileTypes $url', ({ url, expected }) => {
        expect(calcFileTypes(u(url))).toEqual(expected);
    });
});

function u(url: string | URL): string {
    return new URL(url, import.meta.url).toString();
}
