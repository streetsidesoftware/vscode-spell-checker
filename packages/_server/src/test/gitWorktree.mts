import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Create the files git writes for a repository with a linked worktree, without running git.
 * @param repo - the path of the repository to create.
 * @param worktree - the worktree's path relative to `repo`.
 */
export async function createRepoWithWorktree(repo: string, worktree: string): Promise<void> {
    await mkdir(path.join(repo, '.git'), { recursive: true });
    await writeFile(path.join(repo, '.git/config'), '[core]\n');
    await writeFile(path.join(repo, '.git/COMMIT_EDITMSG'), 'Message\n');
    await writeFile(path.join(repo, 'README.md'), '# Repo\n');
    await addWorktree(repo, worktree);
}

/**
 * Add the files git writes for a linked worktree to a repository made by {@link createRepoWithWorktree}.
 * @param repo - the path of the repository.
 * @param worktree - the worktree's path relative to `repo`.
 */
export async function addWorktree(repo: string, worktree: string): Promise<void> {
    const record = path.join(repo, '.git/worktrees', path.basename(worktree));
    const folder = path.join(repo, worktree);
    await mkdir(record, { recursive: true });
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(record, 'gitdir'), path.join(folder, '.git') + '\n');
    await writeFile(path.join(record, 'HEAD'), 'ref: refs/heads/worktree\n');
    await writeFile(path.join(record, 'COMMIT_EDITMSG'), 'Message\n');
    await writeFile(path.join(folder, '.git'), `gitdir: ${record}\n`);
    await writeFile(path.join(folder, 'README.md'), '# Worktree\n');
}

// cspell:ignore EDITMSG gitdir
