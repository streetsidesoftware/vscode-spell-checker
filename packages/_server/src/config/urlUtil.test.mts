import { fileURLToPath, pathToFileURL } from 'url';
import { describe, expect, test } from 'vitest';
import { URI } from 'vscode-uri';

import { normalizeWindowsRoot, normalizeWindowsUrl, toDirURL, uriToUrl, urlToFilepath, urlToFilePathOrHref } from './urlUtil.mjs';

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

    test.each`
        uri                                        | expected
        ${'http://example.com/files/'}             | ${'http://example.com/files/'}
        ${import.meta.url}                         | ${fileURLToPath(import.meta.url)}
        ${'output:my_output'}                      | ${'output:my_output'}
        ${'vscode-vfs://github/vitest-dev/vitest'} | ${'vscode-vfs://github/vitest-dev/vitest'}
    `('urlToFilePathOrHref $uri', ({ uri, expected }) => {
        const r = urlToFilePathOrHref(uri);
        expect(r).toBe(expected);
    });

    test.each`
        uri                                        | expected
        ${'http://example.com/files'}              | ${'/files'}
        ${import.meta.url}                         | ${fileURLToPath(import.meta.url)}
        ${'output:my_output'}                      | ${'my_output'}
        ${'vscode-vfs://github/vitest-dev/vitest'} | ${'/vitest-dev/vitest'}
    `('urlToFilepath $uri', ({ uri, expected }) => {
        const r = urlToFilepath(uri);
        expect(r).toBe(expected);
    });

    test.each`
        uri                               | expected
        ${'http://example.com/files'}     | ${'http://example.com/files'}
        ${import.meta.url}                | ${import.meta.url}
        ${'output:my_output'}             | ${'output:my_output'}
        ${'a:/driveA'}                    | ${'A:/driveA'}
        ${'A:/driveA'}                    | ${'A:/driveA'}
        ${'c:\\Root\\Users'}              | ${'C:\\Root\\Users'}
        ${'f:\\'}                         | ${'F:\\'}
        ${fileURLToPath(import.meta.url)} | ${fileURLToPath(import.meta.url)}
    `('normalizeWindowsRoot $uri', ({ uri, expected }) => {
        const r = normalizeWindowsRoot(uri);
        expect(r).toBe(expected);
    });

    test.each`
        uri                                        | expected
        ${'http://example.com/files'}              | ${'http://example.com/files'}
        ${'file:///'}                              | ${'file:///'}
        ${'file:///C:/users/home'}                 | ${'file:///c:/users/home'}
        ${'file:///C%3a/users/home/'}              | ${'file:///c:/users/home/'}
        ${'output:my_output'}                      | ${'output:my_output'}
        ${'vscode-vfs://github/vitest-dev/vitest'} | ${'vscode-vfs://github/vitest-dev/vitest'}
    `('normalizeWindowsUrl $uri', ({ uri, expected }) => {
        const r = normalizeWindowsUrl(new URL(uri));
        expect(r).toBeInstanceOf(URL);
        expect(r.href).toBe(expected);
    });
});
