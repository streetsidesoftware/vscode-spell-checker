import { uriToName } from '@internal/common-utils';
import type { Location, Range, TextDocument, Uri } from 'vscode';
import { commands, TextEdit, window, workspace, WorkspaceEdit } from 'vscode';
import type { Converter } from 'vscode-languageclient/lib/common/protocolConverter';
import type { TextEdit as LsTextEdit } from 'vscode-languageclient/node';

import * as di from './di';
import { toRegExp } from './extensionRegEx/evaluateRegExp';
import * as Settings from './settings';
import { findEditor, findTextDocument } from './util/findEditor';
import { rangeToString } from './util/toString';
import { pvShowErrorMessage, pvShowInformationMessage as showInformationMessage } from './util/vscodeHelpers';

const propertyFixSpellingWithRenameProvider = Settings.ConfigFields.fixSpellingWithRenameProvider;
const propertyUseReferenceProviderWithRename = Settings.ConfigFields['advanced.feature.useReferenceProviderWithRename'];
const propertyUseReferenceProviderRemove = Settings.ConfigFields['advanced.feature.useReferenceProviderRemove'];

type ToVscodeConverter = Converter;

async function findLocalReference(uri: Uri, range: Range): Promise<Location | undefined> {
    const locations = await findReferences(uri, range);
    return locations?.find((loc) => loc.range.contains(range) && loc.uri.toString() === uri.toString());
}

async function findReferences(uri: Uri, range: Range): Promise<Location[] | undefined> {
    try {
        const locations = (await commands.executeCommand('vscode.executeReferenceProvider', uri, range.start)) as Location[];
        if (!Array.isArray(locations)) return undefined;
        console.log(
            'findReferences: %o',
            locations.map((loc) => ({ uri: loc.uri.toString(), range: rangeToString(loc.range) })),
        );
        return locations;
    } catch (e) {
        return undefined;
    }
}

interface EditBound {
    range: Range;
    referenced: boolean;
}

async function findEditBounds(document: TextDocument, range: Range, useReference: boolean): Promise<EditBound | undefined> {
    if (useReference) {
        const refLocation = await findLocalReference(document.uri, range);
        if (refLocation !== undefined) return { range: refLocation.range, referenced: true };
    }

    const wordRange = document.getWordRangeAtPosition(range.start);
    if (!wordRange || !wordRange.contains(range)) {
        return undefined;
    }
    return { range: wordRange, referenced: false };
}

function cvtLsTextEdits(cvt: ToVscodeConverter, edits: LsTextEdit[]): TextEdit[] {
    function toTextEdit(edit: LsTextEdit): TextEdit {
        return cvt.asTextEdit(edit);
    }

    return edits.map(toTextEdit);
}

async function applyTextEdits(uri: Uri, edits: TextEdit[]): Promise<boolean> {
    const wsEdit = new WorkspaceEdit();
    wsEdit.set(uri, edits);
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
    const bounds = await findEditBounds(document, range, useReference);
    if (!bounds || !bounds.range.contains(range) || !bounds.referenced) {
        return false;
    }
    const wordRange = bounds.range;
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

export async function handleApplyLsTextEdits(uri: string, documentVersion: number, edits: LsTextEdit[]): Promise<void> {
    const converter = di.get('client').client.protocol2CodeConverter;

    console.warn('handleApplyTextEdits %o', { uri, documentVersion, edits });

    return applyTextEditsWithRename(uri, cvtLsTextEdits(converter, edits), documentVersion);
}

async function applyTextEditsWithRename(uri: Uri | string, edits: TextEdit[], documentVersion?: number): Promise<void> {
    const doc = findTextDocument(uri);

    if (!doc) return pvShowErrorMessage(`Unable to find document: ${uri}`);

    if (documentVersion && doc.version !== documentVersion) {
        return pvShowErrorMessage('Spelling changes are outdated and cannot be applied to the document.');
    }

    if (edits.length === 1) {
        const cfg = workspace.getConfiguration(Settings.sectionCSpell, doc);
        if (cfg.get(propertyFixSpellingWithRenameProvider)) {
            const useReference = !!cfg.get(propertyUseReferenceProviderWithRename);
            const removeRegExp = stringToRegExp(cfg.get(propertyUseReferenceProviderRemove) as string | undefined);
            // console.log(`${propertyFixSpellingWithRenameProvider} Enabled`);
            const edit = edits[0];
            if (await attemptRename(doc, edit, { useReference, removeRegExp })) {
                return;
            }
        }
    }

    const success = await applyTextEdits(doc.uri, edits);
    return success ? undefined : pvShowErrorMessage('Failed to apply spelling changes to the document.');
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
    // console.log('handleFixSpellingIssue %o', { docUri, text, withText, ranges });

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
        return pvShowErrorMessage('Failed to apply spelling changes to the document.');
    }
}

export async function actionAutoFixSpellingIssues(uri?: Uri) {
    // console.error('actionAutoFixSpellingIssues %o', { uri });
    uri ??= window.activeTextEditor?.document.uri;
    const doc = findEditor(uri)?.document || findTextDocument(uri);
    if (!uri || !doc) {
        return showInformationMessage('Unable to fix spelling issues in current document, document not found.');
    }

    const issueTracker = di.get('issueTracker');

    const autoFixes = issueTracker
        .getDiagnostics(uri)
        .map((diag) => ({ range: diag.range, ...diag.data }))
        .filter(
            (fix) =>
                fix.suggestions?.[0]?.isPreferred && !fix.suggestions?.[1]?.isPreferred && fix.text && !fix.issueType && !fix.isSuggestion,
        )
        .filter((fix) => doc.getText(fix.range) === fix.text)
        .map((fix) => {
            const sug = fix.suggestions?.[0].word;
            assert(sug !== undefined);
            return new TextEdit(fix.range, sug);
        });

    if (!autoFixes.length) {
        const name = uriToName(uri);
        return showInformationMessage(`No auto fixable spelling issues found in ${name}.`);
    }

    const success = applyTextEdits(uri, autoFixes);
    if (!success) {
        return showInformationMessage('Unable to apply fixes.');
    }
}

function assert(x: unknown, msg = 'A truthy value is expected.'): asserts x {
    if (!x) {
        throw Error(msg);
    }
}
