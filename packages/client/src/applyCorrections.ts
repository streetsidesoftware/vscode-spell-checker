import type { Location, Range, TextDocument, TextEdit, Uri } from 'vscode';
import { commands, workspace, WorkspaceEdit } from 'vscode';
import type { TextEdit as LsTextEdit } from 'vscode-languageclient/node';

import * as di from './di';

async function findLocalReference(uri: Uri, range: Range): Promise<Location | undefined> {
    try {
        const locations = (await commands.executeCommand('vscode.executeReferenceProvider', uri, range.start)) as Location[];
        if (!Array.isArray(locations)) return undefined;
        return locations.find((loc) => loc.range.contains(range) && loc.uri.toString() === uri.toString());
    } catch (e) {
        return undefined;
    }
}

async function findEditBounds(document: TextDocument, range: Range, useReference: boolean): Promise<Range | undefined> {
    if (useReference) {
        const refLocation = await findLocalReference(document.uri, range);
        return refLocation?.range;
    }

    const wordRange = document.getWordRangeAtPosition(range.start);
    if (!wordRange || !wordRange.contains(range)) {
        return undefined;
    }
    return wordRange;
}

export async function applyTextEdits(uri: Uri, edits: LsTextEdit[]): Promise<boolean> {
    const client = di.get('client').client;
    function toTextEdit(edit: LsTextEdit): TextEdit {
        return client.protocol2CodeConverter.asTextEdit(edit);
    }

    const wsEdit = new WorkspaceEdit();
    const textEdits: TextEdit[] = edits.map(toTextEdit);
    wsEdit.set(uri, textEdits);
    try {
        return await workspace.applyEdit(wsEdit);
    } catch (e) {
        return false;
    }
}

export async function attemptRename(document: TextDocument, edit: TextEdit, refInfo: UseRefInfo): Promise<boolean> {
    const { range, newText: text } = edit;
    if (range.start.line !== range.end.line) {
        return false;
    }
    const { useReference, removeRegExp } = refInfo;
    const wordRange = await findEditBounds(document, range, useReference);
    if (!wordRange || !wordRange.contains(range)) {
        return false;
    }
    const orig = wordRange.start.character;
    const a = range.start.character - orig;
    const b = range.end.character - orig;
    const docText = document.getText(wordRange);
    const fullNewText = [docText.slice(0, a), text, docText.slice(b)].join('');
    const newText = removeRegExp ? fullNewText.replace(removeRegExp, '') : fullNewText;
    try {
        const workspaceEdit = await commands
            .executeCommand('vscode.executeDocumentRenameProvider', document.uri, range.start, newText)
            .then(
                (a) => a as WorkspaceEdit | undefined,
                (reason) => (console.log(reason), false),
            );
        return !!workspaceEdit && workspaceEdit.size > 0 && (await workspace.applyEdit(workspaceEdit));
    } catch (e) {
        return false;
    }
}

interface UseRefInfo {
    useReference: boolean;
    removeRegExp: RegExp | undefined;
}
