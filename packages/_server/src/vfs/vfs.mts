import assert from 'node:assert';

import type { VfsStat } from 'cspell-io';
import { getVirtualFS } from 'cspell-lib';
import type { URI } from 'vscode-uri';

import { toUrl } from '../utils/toUrl.mjs';

export async function stat(urlLike: URL | URI | string): Promise<VfsStat> {
    const url = toUrl(urlLike);
    const vfs = getVirtualFS();
    const fs = vfs.getFS(url);
    const stat = await fs.stat(url);
    return stat;
}

/**
 * Get the file stat if it is available, otherwise return undefined.
 * @param urlLike - url
 * @returns VfsStat or undefined
 */
export async function statIfAvailable(urlLike: URL | URI | string): Promise<VfsStat | undefined> {
    try {
        return await stat(urlLike);
    } catch {
        return undefined;
    }
}

export async function readTextFile(url: URL | URI | string): Promise<string> {
    const _url = toUrl(url);
    const vfs = getVirtualFS();
    const fs = vfs.getFS(_url);
    const f = await fs.readFile(_url);
    return f.getText();
}

export async function isFile(url: URL | URI | string): Promise<boolean> {
    const statInfo = await statIfAvailable(url);
    return statInfo?.isFile() || false;
}

export async function isDir(url: URL | URI | string): Promise<boolean> {
    const statInfo = await statIfAvailable(url);
    return statInfo?.isDirectory() || false;
}

export async function exists(url: URL | URI | string): Promise<boolean> {
    return !!(await statIfAvailable(url));
}

export interface FindUpOptions {
    cwd: URL | string;
    root?: URL | string | undefined;
    predicate?: (url: URL, stat: VfsStat) => boolean;
}

/**
 * Find a file or directory by name in the current directory or any parent directory.
 * @param name - name of the file/directory to find
 * @param options - options for findUp
 */
export async function findUp(name: string, options: FindUpOptions): Promise<URL | undefined> {
    let cwd = new URL(options.cwd);
    const root = new URL('.', options.root || new URL('/', cwd));
    const predicate = options.predicate || (() => true);
    assert(cwd.toString().startsWith(root.toString()), 'cwd must be a subdirectory of root');
    // eslint-disable-next-line no-useless-assignment
    let last = cwd;
    do {
        last = cwd;
        const url = new URL(name, cwd);
        const stat = await statIfAvailable(url);
        if (stat && predicate(url, stat)) {
            return url;
        }
        cwd = new URL('..', cwd);
    } while (cwd.pathname !== root.pathname && last.pathname !== cwd.pathname);
    return undefined;
}

/**
 * Normalize a directory URL by ensuring it ends with a `/`. If it already has a `/`, it is returned as is.
 * Otherwise, if the URL points to a directory, the URL is returned with a `/` at the end.
 * @param url - url to normalize
 * @returns URL with a `/` at the end.
 */
export async function normalizeDirUrl(url: URL | URI | string): Promise<URL> {
    const u = toUrl(url);
    if (u.pathname.endsWith('/')) return u;

    const s = await stat(u);
    if (s.isDirectory()) return new URL(u.pathname + '/', u);
    return new URL('.', u);
}

export interface FindRepoRootOptions {
    root?: URL | string | undefined;
}

/**
 * Look for the root of a git repository.
 * @param url - url to find the repo root for.
 * @returns Resolves to URL or undefined
 */
export async function findRepoRoot(url: URL | URI | string, options?: FindRepoRootOptions): Promise<URL | undefined> {
    const found = await findUp('.git/', { ...options, cwd: toUrl(url), predicate: (_url, stat) => stat.isDirectory() });
    return found ? new URL('..', found) : undefined;
}
