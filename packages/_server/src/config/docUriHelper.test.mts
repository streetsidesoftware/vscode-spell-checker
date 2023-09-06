import { describe, expect, test } from 'vitest';
import { URI as Uri } from 'vscode-uri';

import { extractUriFromQueryParam, forceToFileUri, handleSpecialUri } from './docUriHelper.mjs';

// cspell:ignore jsmith

const sampleUrl1 = 'vscode-scm:git/scm0/input?rootUri=file:///c:/Users/jsmith/projects/cspell-dicts&name=Jonathan%20Smith&age=18';
const sampleUrl2 = 'vscode-scm:git/scm0/input?rootUri=file%3A///c%3A/Users/jsmith/projects/cspell-dicts&name=Jonathan%20Smith&age=18';

describe('', () => {
    test.each`
        uri                              | expected
        ${import.meta.url}               | ${Uri.parse(import.meta.url)}
        ${new URL(import.meta.url).href} | ${Uri.parse(import.meta.url)}
        ${sampleUrl1}                    | ${'file:///git/scm0/input'}
    `('forceToFileUri $uri', ({ uri, expected }) => {
        expect(forceToFileUri(Uri.parse(uri)).toString()).toEqual(expected.toString());
    });

    test.each`
        uri                              | expected
        ${import.meta.url}               | ${Uri.parse(import.meta.url)}
        ${new URL(import.meta.url).href} | ${Uri.parse(import.meta.url)}
        ${sampleUrl1}                    | ${'file:///c%3A/Users/jsmith/projects/cspell-dicts/COMMIT_MSG.txt'}
    `('handleSpecialUri $uri', ({ uri, expected }) => {
        expect(handleSpecialUri(Uri.parse(uri)).toString()).toEqual(expected.toString());
    });

    test.each`
        uri                | param        | expected
        ${import.meta.url} | ${'rootUri'} | ${undefined}
        ${sampleUrl1}      | ${'rootUri'} | ${'file:///c%3A/Users/jsmith/projects/cspell-dicts'}
        ${sampleUrl2}      | ${'rootUri'} | ${'file:///c%3A/Users/jsmith/projects/cspell-dicts'}
    `('extractUriFromQueryParam $uri', ({ uri, param, expected }) => {
        const r = extractUriFromQueryParam(uri, param);
        expect(r?.toString()).toEqual(expected?.toString());
    });
});
