import * as vscode from 'vscode';

import { currentDirectory } from './fsUtils.mjs';

export function toGlobPattern(pattern: string, url?: vscode.Uri): vscode.GlobPattern {
    return new vscode.RelativePattern(url || currentDirectory(), pattern);
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
export function normalizePatternBase(pattern: string, base: vscode.Uri): [string, vscode.Uri] {
    if (pattern.startsWith('/')) {
        pattern = pattern.slice(1);
        base = vscode.Uri.joinPath(base, '/');
    }
    const relPatterns = ['..', '.'];
    const parts = pattern.split('/');
    let i = 0;
    for (; i < parts.length && relPatterns.includes(parts[i]); ++i) {
        base = vscode.Uri.joinPath(base, parts[i]);
    }
    return [parts.slice(i).join('/'), base];
}
