import * as CSpellSettings from './settings/CSpellSettings';
import * as Settings from './settings';

import { window, TextEditor, Uri } from 'vscode';
import {
    TextEdit, LanguageClient
} from 'vscode-languageclient';

export { toggleEnableSpellChecker, enableCurrentLanguage, disableCurrentLanguage } from './settings';


export function handlerApplyTextEdits(client: LanguageClient) {
    return function applyTextEdits(uri: string, documentVersion: number, edits: TextEdit[]) {
        const textEditor = window.activeTextEditor;
        if (textEditor && textEditor.document.uri.toString() === uri) {
            if (textEditor.document.version !== documentVersion) {
                window.showInformationMessage(`Spelling changes are outdated and cannot be applied to the document.`);
            }
            textEditor.edit(mutator => {
                for (const edit of edits) {
                    mutator.replace(client.protocol2CodeConverter.asRange(edit.range), edit.newText);
                }
            }).then((success) => {
                if (!success) {
                    window.showErrorMessage('Failed to apply spelling changes to the document.');
                }
            });
        }
    };
}

export function addWordToFolderDictionary(word: string, uri: string | null | Uri | undefined): Thenable<void> {
    return addWordToTarget(word, Settings.Target.WorkspaceFolder, uri);
}

export function addWordToWorkspaceDictionary(word: string, uri: string | null | Uri | undefined): Thenable<void> {
    return addWordToTarget(word, Settings.Target.Workspace, uri);
}

export function addWordToUserDictionary(word: string): Thenable<void> {
    return addWordToTarget(word, Settings.Target.Global, undefined);
}

async function addWordToTarget(word: string, target: Settings.Target, uri: string | null | Uri | undefined) {
    const actualTarget = resolveTarget(target, uri);
    await Settings.addWordToSettings(actualTarget, word);
    if (actualTarget !== Settings.Target.Global) {
        const useUri = uri ? pathToUri(uri) : undefined;
        const path = await Settings.findExistingSettingsFileLocation(useUri);
        if (path) {
            await CSpellSettings.addWordToSettingsAndUpdate(path, word);
        }
    }
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

async function removeWordFromTarget(word: string, target: Settings.Target, uri: string | null | Uri | undefined) {
    const actualTarget = resolveTarget(target, uri);
    await Settings.removeWordFromSettings(actualTarget, word);
    if (actualTarget !== Settings.Target.Global) {
        const useUri = uri ? pathToUri(uri) : undefined;
        const path = await Settings.findExistingSettingsFileLocation(useUri);
        if (path) {
            await CSpellSettings.removeWordFromSettingsAndUpdate(path, word);
        }
    }
}

function resolveTarget(target: Settings.Target, uri?: string | null | Uri): Settings.ConfigTarget {
    if (target === Settings.Target.Global || !Settings.hasWorkspaceLocation()) {
        return Settings.Target.Global;
    }

    if (!uri) {
        return Settings.Target.Workspace;
    }

    const resolvedUri = pathToUri(uri);
    return Settings.createTargetForUri(Settings.Target.Workspace, resolvedUri);
}

export function enableLanguageId(languageId: string, uri?: string): Promise<void> {
    return Settings.enableLanguageIdForClosestTarget(languageId, true, uri ? Uri.parse(uri) : undefined);
}

export function disableLanguageId(languageId: string, uri?: string): Promise<void> {
    return Settings.enableLanguageIdForClosestTarget(languageId, false, uri ? Uri.parse(uri) : undefined);
}

export function userCommandOnCurrentSelectionOrPrompt(prompt: string, fnAction: (text: string) => Thenable<void>): () => Thenable<void> {
    return function () {
        const { activeTextEditor = {} } = window;
        const { selection, document } = activeTextEditor as TextEditor;
        const range = selection && document ? document.getWordRangeAtPosition(selection.active) : undefined;
        const value = range ? document.getText(selection) || document.getText(range) : selection && document.getText(selection) || '';
        return (selection && !selection.isEmpty)
            ? fnAction(value)
            : window.showInputBox({prompt, value}).then(word => { word && fnAction(word); });
    };
}

function pathToUri(uri: string | Uri): Uri {
    if (uri instanceof Uri) {
        return uri;
    }
    return Uri.parse(uri);
}
