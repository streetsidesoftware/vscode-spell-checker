import type { VfsStat } from 'cspell-io';
import { describe, expect, test } from 'vitest';

import { findRepoRoot, findUp, normalizeDirUrl } from './vfs.mjs';

const packageRoot = new URL('../../', import.meta.url);
const repoRoot = new URL('../../', packageRoot);
const basename = import.meta.url.split('/').slice(-1).join('');

describe('vfs', () => {
    test.each`
        name              | options                                                                               | expected
        ${basename}       | ${{ cwd: import.meta.url }}                                                           | ${import.meta.url}
        ${'package.json'} | ${{ cwd: import.meta.url }}                                                           | ${new URL('package.json', packageRoot).toString()}
        ${'package.json'} | ${{ cwd: import.meta.url, predicate: () => false }}                                   | ${undefined}
        ${'.git'}         | ${{ cwd: import.meta.url, predicate: (_: URL, stat: VfsStat) => stat.isDirectory() }} | ${new URL('.git', repoRoot).toString()}
        ${'.git'}         | ${{ cwd: import.meta.url }}                                                           | ${new URL('.git', repoRoot).toString()}
        ${'.git'}         | ${{ cwd: import.meta.url, root: packageRoot }}                                        | ${undefined}
    `('findUp $name, $options', async ({ name, options, expected }) => {
        const result = await findUp(name, options);
        expect(result?.toString()).toEqual(expected);
    });

    test.each`
        url                                                  | expected
        ${packageRoot}                                       | ${packageRoot}
        ${import.meta.url}                                   | ${new URL('.', import.meta.url)}
        ${import.meta.url.split('/').slice(0, -1).join('/')} | ${new URL('.', import.meta.url)}
    `('normalizeDirUrl $url', async ({ url, expected }) => {
        expect((await normalizeDirUrl(url)).toString()).toEqual(expected.toString());
    });

    test('findRepoRoot', async () => {
        expect((await findRepoRoot(import.meta.url))?.toString()).toEqual(repoRoot.toString());
    });
});
