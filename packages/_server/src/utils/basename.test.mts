import { describe, expect, test } from 'vitest';

import { basename } from './basename.mjs';

describe('calcFileTypes', () => {
    test.each`
        url                | expected
        ${import.meta.url} | ${'basename.test.mts'}
        ${'./file.js'}     | ${'file.js'}
        ${'./README.md'}   | ${'README.md'}
        ${'./dir/'}        | ${''}
        ${'./example.py'}  | ${'example.py'}
    `('basename $url', ({ url, expected }) => {
        expect(basename(u(url))).toEqual(expected);
    });
});

function u(url: string | URL): string {
    return new URL(url, import.meta.url).toString();
}
