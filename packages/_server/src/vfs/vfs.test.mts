// cspell:ignore gitdir

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { VfsStat } from 'cspell-io';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

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
        ${'src'}          | ${{ cwd: import.meta.url, predicate: (_: URL, stat: VfsStat) => stat.isDirectory() }} | ${new URL('src', packageRoot).toString()}
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

    describe('findRepoRoot with a worktree inside the clone', () => {
        let tempDir = '';
        let clone: URL;

        beforeAll(async () => {
            tempDir = await mkdtemp(path.join(tmpdir(), 'vfs-test-'));
            clone = pathToFileURL(tempDir + '/clone/');
            await mkdir(new URL('.git/', clone), { recursive: true });
            await mkdir(new URL('src/', clone), { recursive: true });
            await mkdir(new URL('.claude/worktrees/wt/src/', clone), { recursive: true });
            await writeFile(new URL('.claude/worktrees/wt/.git', clone), 'gitdir: ../../../.git/worktrees/wt\n');
        });

        afterAll(async () => {
            await rm(tempDir, { recursive: true, force: true });
        });

        test.each`
            dir                            | expected
            ${''}                          | ${''}
            ${'src/'}                      | ${''}
            ${'.claude/worktrees/wt/'}     | ${'.claude/worktrees/wt/'}
            ${'.claude/worktrees/wt/src/'} | ${'.claude/worktrees/wt/'}
        `('findRepoRoot "$dir"', async ({ dir, expected }) => {
            const result = await findRepoRoot(new URL(dir, clone));
            expect(result?.toString()).toEqual(new URL(expected, clone).toString());
        });
    });
});
