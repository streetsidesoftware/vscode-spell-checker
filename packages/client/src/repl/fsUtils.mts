import { homedir } from 'node:os';
import { relative as pathRelative } from 'node:path/posix';

import type { CancellationToken, FileStat, FileType } from 'vscode';
import { Uri } from 'vscode';
import * as vscode from 'vscode';

import { toError } from '../util/errors.js';
import { asyncQueue } from './asyncQueue.mjs';
import { consoleDebug } from './consoleDebug.mjs';
import { toGlobPattern } from './globUtils.mjs';

export type DirEntryStat = Partial<FileStat> & Pick<FileStat, 'type'>;
export type ExDirEntry = [string, DirEntryStat | Error];

export type DirEntry = [string, FileType];
export type UriStats = [Uri, FileStat];

export function currentDirectory(): Uri {
    return vscode.workspace.workspaceFolders?.[0].uri || uriParent(getCurrentDocumentUri()) || Uri.file('.');
}

function getCurrentDocumentUri(): Uri | undefined {
    const editor = vscode.window.activeTextEditor;
    return editor?.document.uri;
}

function uriParent(uri: Uri | undefined): Uri | undefined {
    return uri && Uri.joinPath(uri, '..');
}

export async function* readStatsForFiles(uris: Uri[], cancelationToken: vscode.CancellationToken | undefined): AsyncGenerator<UriStats> {
    if (cancelationToken?.isCancellationRequested) {
        return [];
    }

    const statsRequests = uris.map((uri) => async () => [uri, await vscode.workspace.fs.stat(uri)] as UriStats);

    for await (const result of asyncQueue(statsRequests, 10)) {
        if (cancelationToken?.isCancellationRequested) {
            break;
        }
        yield result;
    }

    return;
}

export async function globSearch(
    pattern: string,
    base: Uri | undefined,
    excludePattern: string | undefined,
    maxResults: number | undefined,
    cancelationToken?: vscode.CancellationToken,
): Promise<Uri[]> {
    const pat = toGlobPattern(pattern, base);
    const result = await vscode.workspace.findFiles(
        pat,
        excludePattern && toGlobPattern(excludePattern, base),
        maxResults,
        cancelationToken,
    );
    if (cancelationToken?.isCancellationRequested) {
        consoleDebug('globSearch cancelled');
    }
    return result;
}

export function resolvePath(relPath: string | Uri | undefined, cwd?: Uri): Uri {
    if (typeof relPath === 'string' && relPath.startsWith('~')) {
        cwd = Uri.file(homedir());
        relPath = relPath.slice(2);
    }
    return typeof relPath === 'string' ? Uri.joinPath(cwd || currentDirectory(), relPath) : relPath || currentDirectory();
}

export async function readDir(relUri?: string | Uri | undefined, cwd?: Uri): Promise<DirEntry[]> {
    const uri = resolvePath(relUri, cwd);
    return await vscode.workspace.fs.readDirectory(uri);
}

export async function* readDirStats(dirUri: Uri, extendedStats = false, cancelationToken?: CancellationToken): AsyncGenerator<ExDirEntry> {
    if (cancelationToken?.isCancellationRequested) return;

    for await (const [name, type] of await vscode.workspace.fs.readDirectory(dirUri)) {
        if (cancelationToken?.isCancellationRequested) return;
        const stat = extendedStats ? await vscode.workspace.fs.stat(Uri.joinPath(dirUri, name)) : { type };
        yield [name, stat] as ExDirEntry;
    }
}

/**
 * Like `vscode.workspace.asRelativePath` but returns the folder name for workspace folders.
 * @param uri - uri to convert to a relative path
 * @returns
 */
export function toRelativeWorkspacePath(uri: Uri | undefined): string | undefined {
    if (!uri) return;
    const uriHref = uri.toString().replace(/\/$/, '');
    const folder = vscode.workspace.workspaceFolders?.find((f) => f.uri.toString() === uriHref);
    if (folder) return folder.name + '/';
    return vscode.workspace.asRelativePath(uri, true);
}

export function relativePath(from: Uri, to: Uri): string {
    return pathRelative(from.path, to.path);
}

export async function readStatOrError(uri: Uri): Promise<FileStat | Error> {
    try {
        return await vscode.workspace.fs.stat(uri);
    } catch (e) {
        return toError(e);
    }
}
