import type { WorkspaceFolder } from 'vscode-languageserver/node.js';

const endUrlOfPath: Record<string, boolean | undefined> = {
    '/': true,
    '?': true,
    '#': true,
};

export function findMatchingFoldersForUri(folders: WorkspaceFolder[], docUri: string): WorkspaceFolder[] {
    return folders
        .filter(({ uri }) => docUri.startsWith(uri) && (endUrlOfPath[docUri[uri.length]] || uri.endsWith('/') || docUri === uri))
        .sort((a, b) => b.uri.length - a.uri.length);
}

export function findMatchingFolderForUri(folders: WorkspaceFolder[], docUri: string): WorkspaceFolder | undefined {
    return findMatchingFoldersForUri(folders, docUri)[0];
}
