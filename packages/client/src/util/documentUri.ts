import type { ConfigurationScope, NotebookCell, NotebookDocument, TextDocument } from 'vscode';
import { Uri, workspace } from 'vscode';

import { findTextDocument } from '../vscode/findEditor.js';

const _schemeBlocked = {
    git: true,
    output: true,
    debug: true,
    vscode: true,
} as const;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const schemeBlocked: Record<string, true | undefined> = Object.assign(Object.create(null), _schemeBlocked);
Object.freeze(schemeBlocked);

export function findConicalDocumentScope(docUri: Uri | undefined): ConfigurationScope | undefined {
    if (docUri === undefined) return undefined;
    if (docUri.scheme in schemeBlocked) return undefined;
    const doc = findTextDocumentForUri(docUri);
    // console.log('findConicalDocumentScope %o', { docUri: docUri.toString(true), doc: doc?.uri.toString(true) });
    if (doc) {
        const cell = findNotebookCell(docUri);
        if (cell) {
            return {
                uri: cell.notebook.uri,
                languageId: cell.document.languageId,
            };
        }
        return doc;
    }
    if (docUri.scheme === 'file') return docUri;

    // Hope for the best.
    return undefined;
}

function findTextDocumentForUri(uri: Uri): TextDocument | undefined {
    const doc = findTextDocument(uri);
    if (doc) return doc;

    // Search for matching path.
    const folderSchemes = new Set(workspace.workspaceFolders?.map((f) => f.uri.scheme)).add('file');

    let possibleDoc: TextDocument | undefined = undefined;

    const path = uri.path;
    for (const doc of workspace.textDocuments) {
        const uri = doc.uri;
        if (uri.path === path) {
            possibleDoc = doc;
            if (folderSchemes.has(uri.scheme)) {
                return doc;
            }
        }
    }
    return possibleDoc;
}

export function isNotebookTextDocument(doc: TextDocument): boolean {
    return doc.uri.scheme === 'vscode-notebook-cell';
}

export function isNotebookTextDocumentUri(uri: Uri): boolean {
    return uri.scheme === 'vscode-notebook-cell';
}

export function findNotebookCellForDocument(doc: TextDocument): NotebookCell | undefined {
    return findNotebookCell(doc.uri);
}

export function findNotebookCell(uri: Uri): NotebookCell | undefined {
    if (!isNotebookTextDocumentUri(uri)) return undefined;

    for (const notebook of workspace.notebookDocuments) {
        const cells = notebook.getCells();
        const cell = cells.find((cell) => cell.document.uri.toString() === uri.toString());
        if (cell) return cell;
    }
    return undefined;
}

export function findConicalDocument(doc: TextDocument): TextDocument | NotebookDocument {
    const cell = findNotebookCellForDocument(doc);
    if (cell) return cell.notebook;
    return doc;
}

export function extractUriFromConfigurationScope(scope: ConfigurationScope | undefined): Uri | undefined {
    if (!scope) return undefined;
    if (scope instanceof Uri) return scope;
    if ('uri' in scope) return scope.uri;
    return undefined;
}
