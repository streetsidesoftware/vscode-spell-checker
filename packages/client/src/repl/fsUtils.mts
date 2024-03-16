import * as vscode from 'vscode';

import { asyncQueue } from './asyncQueue.mjs';
import { consoleDebug } from './consoleDebug.mjs';
import { toGlobPattern } from './globsToGlob.mjs';

export type DirEntry = [string, vscode.FileType];
export type UriStats = [vscode.Uri, vscode.FileStat];

export function currentDirectory(): vscode.Uri {
    return vscode.workspace.workspaceFolders?.[0].uri || uriParent(getCurrentDocumentUri()) || vscode.Uri.file('.');
}

function getCurrentDocumentUri(): vscode.Uri | undefined {
    const editor = vscode.window.activeTextEditor;
    return editor?.document.uri;
}

function uriParent(uri: vscode.Uri | undefined): vscode.Uri | undefined {
    return uri && vscode.Uri.joinPath(uri, '..');
}

export async function* readStatsForFiles(uris: vscode.Uri[], cancelationToken: vscode.CancellationToken): AsyncGenerator<UriStats> {
    if (cancelationToken.isCancellationRequested) {
        return [];
    }

    const statsRequests = uris.map((uri) => async () => [uri, await vscode.workspace.fs.stat(uri)] as UriStats);

    for await (const result of asyncQueue(statsRequests, 10)) {
        if (cancelationToken.isCancellationRequested) {
            break;
        }
        yield result;
    }

    return;
}

export async function globSearch(
    pattern: string,
    base: vscode.Uri | undefined,
    excludePattern: string | undefined,
    maxResults: number | undefined,
    cancelationToken?: vscode.CancellationToken,
): Promise<vscode.Uri[]> {
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

export async function readDir(relUri?: string | vscode.Uri | undefined, cwd?: vscode.Uri): Promise<DirEntry[]> {
    cwd ??= currentDirectory();
    const uri = typeof relUri === 'string' ? vscode.Uri.joinPath(cwd, relUri) : relUri || cwd;
    return await vscode.workspace.fs.readDirectory(uri);
}

/**
 * Like `vscode.workspace.asRelativePath` but returns the folder name for workspace folders.
 * @param uri - uri to convert to a relative path
 * @returns
 */
export function toRelativeWorkspacePath(uri: vscode.Uri | undefined): string | undefined {
    if (!uri) return;
    const uriHref = uri.toString().replace(/\/$/, '');
    const folder = vscode.workspace.workspaceFolders?.find((f) => f.uri.toString() === uriHref);
    if (folder) return folder.name + '/';
    return vscode.workspace.asRelativePath(uri, true);
}
