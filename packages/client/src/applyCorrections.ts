import { uriToName } from '@internal/common-utils';
import type { Range, TextDocument, Uri } from 'vscode';
import { commands, Location, TextEdit, window, workspace, WorkspaceEdit } from 'vscode';
import type { Converter } from 'vscode-languageclient/lib/common/protocolConverter';
import type { TextEdit as LsTextEdit } from 'vscode-languageclient/node';

import * as di from './di';
import { toRegExp } from './extensionRegEx/evaluateRegExp';
import * as Settings from './settings';
import { logErrors, showErrors } from './util/errors';
import { findEditor, findTextDocument } from './util/findEditor';
import { pvShowErrorMessage, pvShowInformationMessage } from './util/vscodeHelpers';

const propertyFixSpellingWithRenameProvider = Settings.ConfigFields.fixSpellingWithRenameProvider;
const propertyUseReferenceProviderWithRename = Settings.ConfigFields['advanced.feature.useReferenceProviderWithRename'];
const propertyUseReferenceProviderRemove = Settings.ConfigFields['advanced.feature.useReferenceProviderRemove'];

type ToVscodeConverter = Converter;

function filterLocations(locations: Location[], uri: Uri, range?: Range): Location[] {
    const sUri = uri.toString();
    return locations.filter((loc) => (!range || loc.range.contains(range)) && loc.uri.toString() === sUri);
}

async function findReferences(uri: Uri, range: Range): Promise<Location[] | undefined> {
    try {
        const locations = (await commands.executeCommand('vscode.executeReferenceProvider', uri, range.start)) as Location[];
        if (!Array.isArray(locations) || !locations.length) return undefined;
        // console.log(
        //     'findReferences: %o',
        //     locations.map((loc) => ({ uri: loc.uri.toString(), range: rangeToString(loc.range) })),
        // );
        return locations;
    } catch (e) {
        return undefined;
    }
}

interface EditBound {
    range: Range;
    referenced: boolean;
}

interface References {
    locations: Location[];
    refUsed: boolean;
}

async function findEditReferenceBounds(document: TextDocument, range: Range, useReference: boolean): Promise<References | undefined> {
    if (useReference) {
        const refLocations = await findReferences(document.uri, range);
        if (refLocations !== undefined) return { locations: refLocations, refUsed: true };
    }

    const wordRange = document.getWordRangeAtPosition(range.start);
    if (!wordRange || !wordRange.contains(range)) {
        return undefined;
    }
    return { locations: [new Location(document.uri, wordRange)], refUsed: false };
}

async function findEditBounds(document: TextDocument, range: Range, useReference: boolean): Promise<EditBound | undefined> {
    const refs = await findEditReferenceBounds(document, range, useReference);
    if (!refs) return undefined;

    const location = filterLocations(refs.locations, document.uri, range)[0];

    if (!location) return undefined;

    return { range: location.range, referenced: refs.refUsed };
}

function cvtLsTextEdits(cvt: ToVscodeConverter, edits: LsTextEdit[]): TextEdit[] {
    function toTextEdit(edit: LsTextEdit): TextEdit {
        return cvt.asTextEdit(edit);
    }

    return edits.map(toTextEdit);
}

function calcWorkspaceEdit(uri: Uri, edits: TextEdit[]): WorkspaceEdit {
    const wsEdit = new WorkspaceEdit();
    wsEdit.set(uri, edits);
    return wsEdit;
}

async function calcRename(document: TextDocument, edit: TextEdit, refInfo: UseRefInfo): Promise<WorkspaceEdit | undefined> {
    const { range, newText: text } = edit;
    if (range.start.line !== range.end.line) {
        return undefined;
    }
    const { useReference, removeRegExp } = refInfo;
    const bounds = await findEditBounds(document, range, useReference);
    if (!bounds || !bounds.range.contains(range) || !bounds.referenced) {
        return undefined;
    }
    const wordRange = bounds.range;
    const orig = wordRange.start.character;
    const a = range.start.character - orig;
    const b = range.end.character - orig;
    const docText = document.getText(wordRange);
    const fullNewText = [docText.slice(0, a), text, docText.slice(b)].join('');
    const newText = removeRegExp ? fullNewText.replace(removeRegExp, '') : fullNewText;
    const workspaceEdit = await logErrors<WorkspaceEdit>(
        commands.executeCommand('vscode.executeDocumentRenameProvider', document.uri, range.start, newText),
        'attemptRename',
    );
    return (workspaceEdit?.size && workspaceEdit) || undefined;
}

interface UseRefInfo {
    useRename: boolean;
    useReference: boolean;
    removeRegExp: RegExp | undefined;
}

export async function handleApplyLsTextEdits(uri: string, documentVersion: number, edits: LsTextEdit[]): Promise<void> {
    const converter = di.get('client').client.protocol2CodeConverter;

    console.warn('handleApplyTextEdits %o', { uri, documentVersion, edits });

    return applyTextEditsWithRename(uri, cvtLsTextEdits(converter, edits), documentVersion);
}

function calcUseRefInfo(doc: TextDocument) {
    const cfg = workspace.getConfiguration(Settings.sectionCSpell, doc);
    const useRename = !!cfg.get(propertyFixSpellingWithRenameProvider);
    const useReference = !!cfg.get(propertyUseReferenceProviderWithRename);
    const removeRegExp = stringToRegExp(cfg.get(propertyUseReferenceProviderRemove) as string | undefined);
    return { useRename, useReference, removeRegExp };
}

async function calcWorkspaceEditWithRename(doc: TextDocument, edits: TextEdit[], refInfo: UseRefInfo): Promise<WorkspaceEdit> {
    if (edits.length === 1 && refInfo.useRename) {
        const edit = edits[0];
        const ws = await calcRename(doc, edit, refInfo);
        if (ws) return ws;
    }

    return calcWorkspaceEdit(doc.uri, edits);
}

async function applyTextEditsWithRename(uri: Uri | string, edits: TextEdit[], documentVersion?: number): Promise<void> {
    const doc = findTextDocument(uri);

    if (!doc) return pvShowErrorMessage(`Unable to find document: ${uri}`);

    if (documentVersion && doc.version !== documentVersion) {
        return pvShowErrorMessage('Spelling changes are outdated and cannot be applied to the document.');
    }

    const refInfo = calcUseRefInfo(doc);
    const success = await applyTextEditsToDocumentWithRename(doc, edits, refInfo);
    await showUnsuccessfulMessage(success, 'Failed to apply spelling changes to the document.');
}

async function applyWorkspaceEdit(wsEdit: WorkspaceEdit, context: string): Promise<boolean | undefined> {
    return await showErrors(workspace.applyEdit(wsEdit), context);
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
    if (!document) return failed('Unable to find document.');

    // check that the ranges match
    for (const range of ranges) {
        if (document.getText(range) !== text) {
            return failed();
        }
    }

    const edits = ranges.map((range) => new TextEdit(range, withText));

    const success = await applyTextEditsToDocumentWithRename(document, edits, calcUseRefInfo(document));

    return success ? undefined : failed();
}

export async function actionAutoFixSpellingIssues(uri?: Uri) {
    // console.error('actionAutoFixSpellingIssues %o', { uri });
    uri ??= window.activeTextEditor?.document.uri;
    const doc = findEditor(uri)?.document || findTextDocument(uri);
    if (!uri || !doc) {
        return pvShowInformationMessage('Unable to fix spelling issues in current document, document not found.');
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
        return pvShowInformationMessage(`No auto fixable spelling issues found in ${name}.`);
    }

    const success = await applyTextEditsToDocumentWithRename(doc, autoFixes, calcUseRefInfo(doc));
    await showUnsuccessfulMessage(success, 'Failed to apply spelling changes to the document.');
}

function assert(x: unknown, msg = 'A truthy value is expected.'): asserts x {
    if (!x) {
        throw Error(msg);
    }
}

function sortTextEdits(edits: TextEdit[]): TextEdit[] {
    return edits.sort((a, b) => {
        const d = a.range.start.line - b.range.start.line;
        return d || a.range.start.character - b.range.start.character;
    });
}

function findIntersections(range: Range, sortedEdits: Iterable<TextEdit>): TextEdit[] {
    const intersections: TextEdit[] = [];
    for (const edit of sortedEdits) {
        if (edit.range.intersection(range)) {
            intersections.push(edit);
        }
    }
    return intersections;
}

function filterEditsMatchingWorkspaceEdit(workspaceEdit: WorkspaceEdit, doc: TextDocument, sortedEdits: TextEdit[]): TextEdit[] {
    const wsEdits = workspaceEdit.get(doc.uri);
    if (!wsEdits) return [];

    const uncoveredEdits = new Set(sortedEdits);
    const coveredEdits = new Set<TextEdit>();

    // todo: this should be a linear algorithm instead of a nested loop.
    for (const wsEdit of wsEdits) {
        const intersections = findIntersections(wsEdit.range, uncoveredEdits);
        for (const intersection of intersections) {
            coveredEdits.add(intersection);
            uncoveredEdits.delete(intersection);
        }
    }

    return [...coveredEdits];
}

function injectEditsIntoWorkspaceEdit(workspaceEdit: WorkspaceEdit, edits: [Uri, TextEdit[]][]): void {
    for (const [uri, textEdits] of edits) {
        workspaceEdit.set(uri, textEdits);
    }
}

async function calcWorkspaceEditsForDocument(doc: TextDocument, edits: TextEdit[], refInfo: UseRefInfo): Promise<WorkspaceEdit> {
    const editsToProcess = new Set(sortTextEdits(edits));

    const wsEdit = new WorkspaceEdit();

    while (editsToProcess.size) {
        const startSize = editsToProcess.size;
        const edit = editsToProcess.values().next().value;
        const ws = await calcWorkspaceEditWithRename(doc, [edit], refInfo);
        injectEditsIntoWorkspaceEdit(wsEdit, ws.entries());
        const matchingEdits = filterEditsMatchingWorkspaceEdit(ws, doc, edits);
        for (const edit of matchingEdits) {
            editsToProcess.delete(edit);
        }
        assert(startSize > editsToProcess.size, 'No progress was made.');
    }

    return wsEdit;
}

async function applyTextEditsToDocumentWithRename(doc: TextDocument, edits: TextEdit[], refInfo: UseRefInfo): Promise<boolean | undefined> {
    const wsEdit = await calcWorkspaceEditsForDocument(doc, edits, refInfo);
    return applyWorkspaceEdit(wsEdit, 'applyTextEditsToDocumentWithRename');
}

async function showUnsuccessfulMessage<T>(value: T, failedMeg: string | undefined): Promise<T> {
    if (!value) {
        await failed(failedMeg);
    }
    return value;
}

function failed(msg?: string) {
    return pvShowErrorMessage(msg || 'Failed to apply spelling changes to the document.');
}
