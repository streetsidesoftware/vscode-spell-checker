import type { Location, Range, TextDocument, Uri } from 'vscode';
import { commands, TextEdit, window, workspace, WorkspaceEdit } from 'vscode';
import type { Converter } from 'vscode-languageclient/lib/common/protocolConverter';
import type { LanguageClient, TextEdit as LsTextEdit } from 'vscode-languageclient/node';

import * as di from './di';
import { toRegExp } from './extensionRegEx/evaluateRegExp';
import * as Settings from './settings';
import { findTextDocument } from './util/findEditor';
import { pVoid } from './util/pVoid';

const propertyFixSpellingWithRenameProvider = Settings.ConfigFields.fixSpellingWithRenameProvider;
const propertyUseReferenceProviderWithRename = Settings.ConfigFields['advanced.feature.useReferenceProviderWithRename'];
const propertyUseReferenceProviderRemove = Settings.ConfigFields['advanced.feature.useReferenceProviderRemove'];

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
        if (refLocation !== undefined) return refLocation.range;
    }

    const wordRange = document.getWordRangeAtPosition(range.start);
    if (!wordRange || !wordRange.contains(range)) {
        return undefined;
    }
    return wordRange;
}

async function applyTextEdits(client: LanguageClient, uri: Uri, edits: LsTextEdit[]): Promise<boolean> {
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

async function attemptRename(document: TextDocument, edit: TextEdit, refInfo: UseRefInfo): Promise<boolean> {
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

export async function handleApplyTextEdits(uri: string, documentVersion: number, edits: LsTextEdit[]): Promise<void> {
    const client = di.get('client').client;

    console.warn('handleApplyTextEdits %o', { uri, documentVersion, edits });

    const doc = workspace.textDocuments.find((doc) => doc.uri.toString() === uri);

    if (!doc) return;

    if (doc.version !== documentVersion) {
        return pVoid(
            window.showInformationMessage('Spelling changes are outdated and cannot be applied to the document.'),
            'handlerApplyTextEdits',
        );
    }

    if (edits.length === 1) {
        const cfg = workspace.getConfiguration(Settings.sectionCSpell, doc);
        if (cfg.get(propertyFixSpellingWithRenameProvider)) {
            const useReference = !!cfg.get(propertyUseReferenceProviderWithRename);
            const removeRegExp = stringToRegExp(cfg.get(propertyUseReferenceProviderRemove) as string | undefined);
            // console.log(`${propertyFixSpellingWithRenameProvider} Enabled`);
            const edit = toTextEdit(client.protocol2CodeConverter, edits[0]);
            if (await attemptRename(doc, edit, { useReference, removeRegExp })) {
                return;
            }
        }
    }

    const success = await applyTextEdits(client, doc.uri, edits);
    return success
        ? undefined
        : pVoid(window.showErrorMessage('Failed to apply spelling changes to the document.'), 'handlerApplyTextEdits2');
}

function toTextEdit(converter: Converter, edit: LsTextEdit): TextEdit {
    return converter.asTextEdit(edit);
}

function stringToRegExp(regExStr: string | undefined, flags = 'g'): RegExp | undefined {
    if (!regExStr) return undefined;
    try {
        return toRegExp(regExStr, flags);
    } catch (e) {
        console.log('Invalid Regular Expression: %s', regExStr);
    }
    return undefined;
}

export async function handleFixSpellingIssue(docUri: Uri, text: string, withText: string, ranges: Range[]): Promise<void> {
    console.log('handleFixSpellingIssue %o', { docUri, text, withText, ranges });

    const document = findTextDocument(docUri);

    // check that the ranges match
    for (const range of ranges) {
        if (document?.getText(range) !== text) {
            return failed();
        }
    }

    const wsEdit = new WorkspaceEdit();
    const edits = ranges.map((range) => new TextEdit(range, withText));
    wsEdit.set(docUri, edits);
    const success = await workspace.applyEdit(wsEdit);

    return success ? undefined : failed();

    function failed() {
        return pVoid(window.showErrorMessage('Failed to apply spelling changes to the document.'), 'handleFixSpellingIssue');
    }
}
