import { Uri, workspace } from 'vscode';

const _schemaFile = {
    file: true,
    untitled: true,
} as const;

const _schemaMapToFile = {
    'vscode-notebook-cell': true,
} as const;

const _schemeBlocked = {
    git: true,
    output: true,
    debug: true,
    vscode: true,
} as const;

const schemeFile: Record<string, true> = Object.freeze(Object.assign(Object.create(null), _schemaFile));
const schemeBlocked: Record<string, true> = Object.freeze(Object.assign(Object.create(null), _schemeBlocked));
const schemeMapToFile: Record<string, true> = Object.freeze(Object.assign(Object.create(null), _schemaMapToFile));

export function findConicalDocumentScope(docUri: Uri | undefined): Uri | undefined {
    if (docUri === undefined) return undefined;
    if (docUri.scheme in schemeBlocked) return undefined;
    if (docUri.scheme in schemeFile) return docUri;

    const path = docUri.path;

    // Search the open notebooks for a match.
    for (const doc of workspace.notebookDocuments) {
        const uri = doc.uri;
        if (uri.path === path) {
            return uri;
        }
    }

    // Search the open documents for a match.
    for (const doc of workspace.textDocuments) {
        const uri = doc.uri;
        if (uri.path === path && uri.scheme === 'file') {
            return uri;
        }
    }

    if (docUri.scheme in schemeMapToFile) {
        return docUri.with({ scheme: 'file', query: '', fragment: '' });
    }

    // Hope for the best.
    return docUri;
}
