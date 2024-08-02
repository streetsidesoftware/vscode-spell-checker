import * as vscode from 'vscode';

export function scrollToText(editor: vscode.TextEditor, text: string): boolean {
    const doc = editor.document;
    const offset = doc.getText().indexOf(text);
    if (offset < 0) return false;

    const pos = doc.positionAt(offset);
    const range = new vscode.Range(pos.line, pos.character, pos.line, pos.character + text.length);
    if (range) editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    return true;
}
