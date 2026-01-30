import type { TextDocument, TextEditor } from 'vscode';
import { Uri, window, workspace } from 'vscode';

export function findEditor(uri?: Uri | string): TextEditor | undefined {
    if (!uri) return window.activeTextEditor;

    const uriStr = uri.toString();

    for (const editor of window.visibleTextEditors) {
        if (editor.document.uri.toString() === uriStr) {
            return editor;
        }
    }

    return undefined;
}

export function findTextDocument(uri?: Uri | string): TextDocument | undefined {
    if (!uri) return undefined;

    uri = typeof uri === 'string' ? Uri.parse(uri) : uri;
    const uriStr = uri.toString();

    for (const document of workspace.textDocuments) {
        if (document.uri.toString() === uriStr) {
            return document;
        }
    }

    return undefined;
}
