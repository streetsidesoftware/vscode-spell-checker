/* eslint-disable @typescript-eslint/unified-signatures */
import { homedir } from 'node:os';

import type { GlobPattern } from 'vscode';
import { RelativePattern, Uri } from 'vscode';

import { currentDirectory } from './fsUtils.mjs';

export function toGlobPattern(pattern: string, url?: Uri): GlobPattern {
    return new RelativePattern(url || currentDirectory(), pattern);
}
export function globsToGlob(glob: string): string;
export function globsToGlob(globs: [string, ...string[]]): string;
export function globsToGlob(globs: string[] | string | undefined): string | undefined;
export function globsToGlob(globs: string[] | string | undefined): string | undefined {
    if (!globs) return undefined;
    if (typeof globs === 'string') return globs;
    return globs.length > 1 ? `{${globs.join(',')}}` : globs[0];
}

/**
 * Try to normalize a relative glob pattern and base uri.
 * @param pattern - glob pattern with possible `./` and `../` prefixes.
 * @param base - the starting uri for the pattern.
 * @returns [normalizedPattern, normalizedBaseUri]
 */
export function normalizePatternBase(pattern: string, base: Uri): [string, Uri] {
    if (pattern === '~' || pattern.startsWith('~/')) {
        base = Uri.file(homedir());
        pattern = pattern.slice(2);
    }
    if (!containsGlobPattern(pattern)) return ['', Uri.joinPath(base, pattern)];

    const parts = pattern.split('/');
    let i = 0;
    for (; i < parts.length && !containsGlobPattern(parts[i]); ++i) {
        base = Uri.joinPath(base, parts[i]);
    }
    return [parts.slice(i).join('/'), base];
}

export function containsGlobPattern(pattern: string): boolean {
    return /[*?{}[\]]/.test(pattern);
}
