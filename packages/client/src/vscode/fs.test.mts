import { describe, expect, test, vi } from 'vitest';
import { FileSystemError, Uri } from 'vscode';
import { URI, Utils as UriUtils } from 'vscode-uri';

import { fsRemove, getPathToTemp } from '../test/helpers.mjs';
import { vscodeFs } from './fs.mjs';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

const sc: typeof expect.stringContaining = (...p) => expect.stringContaining(...p);

const uriPackageRoot = Uri.joinPath(Uri.parse(new URL('.', import.meta.url).toString()), '../..');

describe('fs', () => {
    test.each`
        uri                                          | expected
        ${Uri.parse(import.meta.url)}                | ${sc('this bit of text')}
        ${Uri.joinPath(uriPackageRoot, 'README.md')} | ${sc('Spell Checker Client')}
    `('readFile', async ({ uri, expected }) => {
        const s = await vscodeFs.readFile(uri, 'utf8');
        expect(s).toEqual(expected);
    });

    test.each`
        uri
        ${Uri.parse(import.meta.url)}
        ${Uri.joinPath(uriPackageRoot, 'README.md')}
    `('writeFile', async ({ uri }) => {
        const uriDest = Uri.joinPath(getPathToTemp(), 'nested/again', basename(uri));
        const content = await vscodeFs.readFile(uri, 'utf8');
        await vscodeFs.writeFile(uriDest, content);
        const data = await vscodeFs.readFile(uriDest, 'utf8');
        expect(data).toEqual(content);
    });

    test.each`
        uri
        ${'nested/again'}
        ${'testing'}
    `('createDirectory $uri', async ({ uri }) => {
        const uriDest = Uri.joinPath(getPathToTemp(), uri);
        await fsRemove(uriDest);
        await expect(vscodeFs.createDirectory(uriDest)).resolves.toBeUndefined();
    });

    test.each`
        uri                           | expected
        ${'notFound.txt'}             | ${false}
        ${Uri.parse(import.meta.url)} | ${true}
    `('fileExists $uri', async ({ uri, expected }) => {
        const uriDest = typeof uri === 'string' ? Uri.joinPath(getPathToTemp(), uri) : uri;
        expect(await vscodeFs.fileExists(uriDest)).toBe(expected);
    });

    test.each`
        error                             | expected
        ${'testing'}                      | ${false}
        ${{ code: 'FileNotFound' }}       | ${true}
        ${{ code: 'ENOENT' }}             | ${true}
        ${FileSystemError.FileExists()}   | ${false}
        ${FileSystemError.FileNotFound()} | ${true}
    `('isFileNotFoundError $error', ({ error, expected }) => {
        expect(vscodeFs.isFileNotFoundError(error)).toBe(expected);
    });
});

function basename(uri: Uri): string {
    return UriUtils.basename(URI.from(uri));
}
