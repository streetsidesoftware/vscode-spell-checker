import * as vscode from 'vscode';

import type { Maybe } from '../util';

export function findDocumentInVisibleTextEditors(uri: vscode.Uri): Maybe<vscode.TextDocument> {
    const u = uri.toString();
    const docs = vscode.window.visibleTextEditors
        .map((e) => e.document)
        .filter((doc) => !!doc)
        .filter((doc) => doc.uri.toString() === u);
    return docs[0];
}

export function findMatchingDocument(uri: vscode.Uri): Maybe<vscode.TextDocument> {
    const u = uri.toString();
    const workspace = vscode.workspace || {};
    const docs = (workspace.textDocuments || []).filter((doc) => doc.uri.toString() === u);
    return docs[0] || findDocumentInVisibleTextEditors(uri);
}
