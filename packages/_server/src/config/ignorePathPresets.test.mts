import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { CSpellSettings } from '@cspell/cspell-types';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { URI as Uri } from 'vscode-uri';

import { addWorktree, createRepoWithWorktree } from '../test/gitWorktree.mjs';
import { createIgnorePathPresetsMatcher } from './ignorePathPresets.mjs';

const git = 'ignorePathPresets.git';
const nestedWorktrees = 'ignorePathPresets.nestedWorktrees';

describe('createIgnorePathPresetsMatcher', () => {
    let tempDir = '';
    let repo = '';

    beforeAll(async () => {
        tempDir = await mkdtemp(path.join(tmpdir(), 'ignore-path-presets-'));
        repo = path.join(tempDir, 'repo');
        await createRepoWithWorktree(repo, '.claude/worktrees/wt');
    });

    afterAll(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    test.each`
        file                                  | settings                                                         | expected
        ${'README.md'}                        | ${{}}                                                            | ${undefined}
        ${'.git/config'}                      | ${{}}                                                            | ${git}
        ${'.git/COMMIT_EDITMSG'}              | ${{}}                                                            | ${undefined}
        ${'.git/worktrees/wt/HEAD'}           | ${{}}                                                            | ${git}
        ${'.git/worktrees/wt/COMMIT_EDITMSG'} | ${{}}                                                            | ${undefined}
        ${'.claude/worktrees/wt/README.md'}   | ${{}}                                                            | ${nestedWorktrees}
        ${'.claude/worktrees/wt/.git'}        | ${{}}                                                            | ${nestedWorktrees}
        ${'.git/config'}                      | ${{ ignorePathPresets: { git: false } }}                         | ${undefined}
        ${'.claude/worktrees/wt/README.md'}   | ${{ ignorePathPresets: { git: false } }}                         | ${nestedWorktrees}
        ${'.claude/worktrees/wt/README.md'}   | ${{ ignorePathPresets: { nestedWorktrees: false } }}             | ${undefined}
        ${'.claude/worktrees/wt/.git'}        | ${{ ignorePathPresets: { nestedWorktrees: false } }}             | ${git}
        ${'.claude/worktrees/wt/.git'}        | ${{ ignorePathPresets: { git: false, nestedWorktrees: false } }} | ${undefined}
    `('$file with $settings is skipped by $expected', async ({ file, settings, expected }: PresetTest) => {
        const matcher = await createIgnorePathPresetsMatcher(settings, Uri.file(repo).toString());
        expect(matcher(Uri.file(path.join(repo, file)))?.name).toBe(expected);
    });

    test.each`
        file                    | expected
        ${'README.md'}          | ${undefined}
        ${'.git'}               | ${git}
        ${'../../../README.md'} | ${undefined}
    `('a root inside the worktree: $file is skipped by $expected', async ({ file, expected }: PresetTest) => {
        const worktree = path.join(repo, '.claude/worktrees/wt');
        const matcher = await createIgnorePathPresetsMatcher({}, Uri.file(worktree).toString());
        expect(matcher(Uri.file(path.join(worktree, file)))?.name).toBe(expected);
    });

    test('a match names the glob that skips the file', async () => {
        const matcher = await createIgnorePathPresetsMatcher({}, Uri.file(repo).toString());
        const match = matcher(Uri.file(path.join(repo, '.claude/worktrees/wt/README.md')));
        expect(match?.glob).toEqual({ glob: '/**', root: expect.stringContaining('wt') });
    });

    test('a worktree created after the matcher is found by a new matcher', async () => {
        const file = Uri.file(path.join(repo, '.worktrees/late/README.md'));
        const before = await createIgnorePathPresetsMatcher({}, Uri.file(repo).toString());
        await addWorktree(repo, '.worktrees/late');
        const after = await createIgnorePathPresetsMatcher({}, Uri.file(repo).toString());
        expect(before(file)).toBeUndefined();
        expect(after(file)?.name).toBe(nestedWorktrees);
    });
});

interface PresetTest {
    file: string;
    settings: CSpellSettings;
    expected: string | undefined;
}

// cspell:ignore EDITMSG
