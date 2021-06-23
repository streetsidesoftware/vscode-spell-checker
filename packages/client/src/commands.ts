import * as CSpellSettings from './settings/CSpellSettings';
import * as Settings from './settings';
import { resolveTarget, determineSettingsPaths } from './settings';

import { window, TextEditor, Uri, workspace, commands, WorkspaceEdit, TextDocument, Range } from 'vscode';
import { TextEdit, LanguageClient } from 'vscode-languageclient/node';
import { SpellCheckerSettingsProperties } from './server';
import * as di from './di';

export { toggleEnableSpellChecker, enableCurrentLanguage, disableCurrentLanguage } from './settings';

export function handlerApplyTextEdits(client: LanguageClient) {
    return async function applyTextEdits(uri: string, documentVersion: number, edits: TextEdit[]): Promise<void> {
        const textEditor = window.activeTextEditor;
        if (textEditor && textEditor.document.uri.toString() === uri) {
            if (textEditor.document.version !== documentVersion) {
                window.showInformationMessage('Spelling changes are outdated and cannot be applied to the document.');
            }
            const propertyFixSpellingWithRenameProvider: SpellCheckerSettingsProperties = 'fixSpellingWithRenameProvider';
            const cfg = workspace.getConfiguration(Settings.sectionCSpell);
            if (cfg.get(propertyFixSpellingWithRenameProvider) && edits.length === 1) {
                console.log(`${propertyFixSpellingWithRenameProvider} Enabled`);
                const edit = edits[0];
                const range = client.protocol2CodeConverter.asRange(edit.range);
                if (await attemptRename(textEditor.document, range, edit.newText)) {
                    return;
                }
            }

            textEditor
                .edit((mutator) => {
                    for (const edit of edits) {
                        mutator.replace(client.protocol2CodeConverter.asRange(edit.range), edit.newText);
                    }
                })
                .then((success) => {
                    if (!success) {
                        window.showErrorMessage('Failed to apply spelling changes to the document.');
                    }
                });
        }
    };
}

async function attemptRename(document: TextDocument, range: Range, text: string): Promise<boolean | undefined> {
    if (range.start.line !== range.end.line) {
        return false;
    }
    const wordRange = document.getWordRangeAtPosition(range.start);
    if (!wordRange || !wordRange.contains(range)) {
        return false;
    }
    const orig = wordRange.start.character;
    const a = range.start.character - orig;
    const b = range.end.character - orig;
    const docText = document.getText(wordRange);
    const newText = [docText.slice(0, a), text, docText.slice(b)].join('');
    const workspaceEdit = await commands.executeCommand('vscode.executeDocumentRenameProvider', document.uri, range.start, newText).then(
        (a) => a as WorkspaceEdit | undefined,
        (reason) => (console.log(reason), undefined)
    );
    return workspaceEdit && workspaceEdit.size > 0 && (await workspace.applyEdit(workspaceEdit));
}

export function addWordToFolderDictionary(word: string, docUri: string | null | Uri | undefined): Thenable<void> {
    return addWordToTarget(word, Settings.Target.WorkspaceFolder, docUri);
}

export function addWordToWorkspaceDictionary(word: string, docUri: string | null | Uri | undefined): Thenable<void> {
    return addWordToTarget(word, Settings.Target.Workspace, docUri);
}

export function addWordToUserDictionary(word: string): Thenable<void> {
    return addWordToTarget(word, Settings.Target.Global, undefined);
}

function addWordToTarget(word: string, target: Settings.Target, docUri: string | null | Uri | undefined) {
    return handleErrors(_addWordToTarget(word, target, docUri));
}

function _addWordToTarget(word: string, target: Settings.Target, docUri: string | null | Uri | undefined) {
    docUri = parseOptionalUri(docUri);
    return di.get('dictionaryHelper').addWordToTarget(word, target, docUri);
}

export function addIgnoreWordToTarget(word: string, target: Settings.Target, uri: string | null | Uri | undefined): Promise<void> {
    return handleErrors(_addIgnoreWordToTarget(word, target, uri));
}

async function _addIgnoreWordToTarget(word: string, target: Settings.Target, uri: string | null | Uri | undefined): Promise<void> {
    uri = parseOptionalUri(uri);
    const actualTarget = resolveTarget(target, uri);
    await Settings.addIgnoreWordToSettings(actualTarget, word);
    const paths = await determineSettingsPaths(actualTarget, uri);
    await Promise.all(paths.map((path) => CSpellSettings.addIgnoreWordToSettingsAndUpdate(path, word)));
}

export function removeWordFromFolderDictionary(word: string, uri: string | null | Uri | undefined): Thenable<void> {
    return removeWordFromTarget(word, Settings.Target.WorkspaceFolder, uri);
}

export function removeWordFromWorkspaceDictionary(word: string, uri: string | null | Uri | undefined): Thenable<void> {
    return removeWordFromTarget(word, Settings.Target.Workspace, uri);
}

export function removeWordFromUserDictionary(word: string): Thenable<void> {
    return removeWordFromTarget(word, Settings.Target.Global, undefined);
}

function removeWordFromTarget(word: string, target: Settings.Target, uri: string | null | Uri | undefined) {
    return handleErrors(_removeWordFromTarget(word, target, uri));
}

async function _removeWordFromTarget(word: string, target: Settings.Target, uri: string | null | Uri | undefined) {
    uri = parseOptionalUri(uri);
    const actualTarget = resolveTarget(target, uri);
    await Settings.removeWordFromSettings(actualTarget, word);
    const paths = await determineSettingsPaths(actualTarget, uri);
    await Promise.all(paths.map((path) => CSpellSettings.removeWordFromSettingsAndUpdate(path, word)));
}

export function enableLanguageId(languageId: string, uri?: string | Uri): Promise<void> {
    uri = parseOptionalUri(uri);
    return handleErrors(Settings.enableLanguageIdForClosestTarget(languageId, true, uri));
}

export function disableLanguageId(languageId: string, uri?: string | Uri): Promise<void> {
    uri = parseOptionalUri(uri);
    return handleErrors(Settings.enableLanguageIdForClosestTarget(languageId, false, uri));
}

export function userCommandOnCurrentSelectionOrPrompt(
    prompt: string,
    fnAction: (text: string, uri: Uri | undefined) => Thenable<void>
): () => Thenable<void> {
    return function () {
        const { activeTextEditor = {} } = window;
        const { selection, document } = activeTextEditor as TextEditor;
        const range = selection && document ? document.getWordRangeAtPosition(selection.active) : undefined;
        const value = range ? document.getText(selection) || document.getText(range) : (selection && document.getText(selection)) || '';
        return selection && !selection.isEmpty
            ? fnAction(value, document && document.uri)
            : window.showInputBox({ prompt, value }).then((word) => {
                  word && fnAction(word, document && document.uri);
              });
    };
}

function isError(e: unknown): e is Error {
    if (!e) return false;
    const err = <Error>e;
    return err.message !== undefined && err.name !== undefined;
}

function onError(reason: unknown): Promise<void> {
    if (isError(reason)) {
        window.showErrorMessage(reason.message);
    }
    return Promise.resolve();
}

function handleErrors(p: Promise<void>): Promise<void> {
    return p.catch(onError);
}

function parseOptionalUri(uri: string | Uri): Uri;
function parseOptionalUri(uri: null | undefined): Uri | undefined;
function parseOptionalUri(uri: string | Uri | null | undefined): Uri | undefined;
function parseOptionalUri(uri: string | Uri | null | undefined): Uri | undefined {
    if (typeof uri === 'string') {
        return Uri.parse(uri);
    }
    return uri || undefined;
}
