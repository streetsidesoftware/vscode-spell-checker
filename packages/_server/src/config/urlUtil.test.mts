import { describe, expect, test } from 'vitest';
import { URI } from 'vscode-uri';

import { toDirURL, uriToUrl } from './urlUtil.mjs';

describe('urlUtil', () => {
    test.each`
        uri                                   | expected
        ${'http://example.com'}               | ${'http://example.com/'}
        ${URI.parse('file:///')}              | ${'file:///'}
        ${URI.parse('file:///C:/users/home')} | ${'file:///c:/users/home'}
        ${'file:///C%3a/users/home/'}         | ${'file:///c:/users/home/'}
    `('uriToUrl $uri', ({ uri, expected }) => {
        const r = uriToUrl(uri);
        expect(r).toBeInstanceOf(URL);
        expect(r.href).toBe(expected);
    });

    test.each`
        uri                                        | expected
        ${'http://example.com/files'}              | ${'http://example.com/files/'}
        ${'file:///'}                              | ${'file:///'}
        ${'file:///C:/users/home'}                 | ${'file:///c:/users/home/'}
        ${'file:///C%3a/users/home/'}              | ${'file:///c:/users/home/'}
        ${'output:my_output'}                      | ${'output:my_output'}
        ${'vscode-vfs://github/vitest-dev/vitest'} | ${'vscode-vfs://github/vitest-dev/vitest/'}
    `('toDirURL $uri', ({ uri, expected }) => {
        const r = toDirURL(uri);
        expect(r).toBeInstanceOf(URL);
        expect(r.href).toBe(expected);
    });
});
