import type { TextEditor, Uri } from 'vscode';
import { window } from 'vscode';

export function findEditor(uri?: Uri): TextEditor | undefined {
    if (!uri) return window.activeTextEditor;

    const uriStr = uri.toString();

    for (const editor of window.visibleTextEditors) {
        if (editor.document.uri.toString() === uriStr) {
            return editor;
        }
    }

    return undefined;
}
