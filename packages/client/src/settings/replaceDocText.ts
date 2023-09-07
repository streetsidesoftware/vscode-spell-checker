import type { TextDocument } from 'vscode';
import { Range, TextEdit, workspace, WorkspaceEdit } from 'vscode';

export async function replaceDocText(doc: TextDocument, text: string): Promise<boolean> {
    const wsEdit = new WorkspaceEdit();
    const range = new Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
    const teReplaceDoc = TextEdit.replace(range, text);
    wsEdit.set(doc.uri, [teReplaceDoc]);
    const success = await workspace.applyEdit(wsEdit);
    success && (await doc.save());
    return success;
}
