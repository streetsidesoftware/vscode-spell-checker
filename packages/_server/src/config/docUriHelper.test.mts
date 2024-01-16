import { describe, expect, test } from 'vitest';
import { URI as Uri } from 'vscode-uri';

import { extractUriFromQueryParam, forceToFileUri, handleSpecialUri } from './docUriHelper.mjs';

// cspell:ignore jsmith
// cspell:ignoreRegExp /[a-z_-]{3,}:[^\s]+/g

const sampleUrl1 = 'vscode-scm:git/scm0/input?rootUri=file:///c:/Users/jsmith/projects/cspell-dicts&name=Jonathan%20Smith&age=18';
const sampleUrl2 = 'vscode-scm:git/scm0/input?rootUri=file%3A///c%3A/Users/jsmith/projects/cspell-dicts&name=Jonathan%20Smith&age=18';
const sampleUrl3 = 'vscode-notebook-cell://github/openai/whisper/notebooks/LibriSpeech.ipynb#X14';
const sampleUrl3Root = Uri.parse('vscode-vfs://github/openai/whisper');

const uriRoot = Uri.parse(import.meta.url);

describe('', () => {
    test.each`
        uri                              | expected
        ${import.meta.url}               | ${Uri.parse(import.meta.url)}
        ${new URL(import.meta.url).href} | ${Uri.parse(import.meta.url)}
        ${sampleUrl1}                    | ${'file:///git/scm0/input'}
    `('forceToFileUri $uri', ({ uri, expected }) => {
        expect(forceToFileUri(Uri.parse(uri), uriRoot).toString()).toEqual(expected.toString());
    });

    test.each`
        uri                              | root              | expected
        ${import.meta.url}               | ${uriRoot}        | ${Uri.parse(import.meta.url)}
        ${new URL(import.meta.url).href} | ${uriRoot}        | ${Uri.parse(import.meta.url)}
        ${sampleUrl1}                    | ${uriRoot}        | ${'file:///c%3A/Users/jsmith/projects/cspell-dicts/COMMIT_MSG.txt'}
        ${sampleUrl3}                    | ${sampleUrl3Root} | ${'vscode-vfs://github/openai/whisper/notebooks/LibriSpeech.ipynb'}
    `('handleSpecialUri $uri $root', ({ uri, root, expected }) => {
        expect(handleSpecialUri(Uri.parse(uri), root).toString()).toEqual(expected.toString());
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
