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

export function addWordToFolderDictionary(word: string, uri?: string | null | Uri): Thenable<void> {
    if (!uri || !Settings.hasWorkspaceLocation()) {
        return addWordToWorkspaceDictionary(word);
    }
    uri = pathToUri(uri);
    const target = Settings.createTargetForUri(Settings.Target.WorkspaceFolder, uri);
    return Settings.addWordToSettings(target, word)
    .then(_ => Settings.findExistingSettingsFileLocation())
    .then(path => path
            ? CSpellSettings.addWordToSettingsAndUpdate(path, word).then(_ => {})
            : undefined
    );
}

export function addWordToWorkspaceDictionary(word: string, uri?: string | null | Uri): Thenable<void> {
    if (!Settings.hasWorkspaceLocation()) {
        return addWordToUserDictionary(word);
    }
    uri = typeof uri === 'string' ? pathToUri(uri) : uri;
    const target = uri ? Settings.createTargetForUri(Settings.Target.Workspace, uri) : Settings.Target.Workspace;
    return Settings.addWordToSettings(target, word)
    .then(_ => Settings.findExistingSettingsFileLocation())
    .then(path => path
            ? CSpellSettings.addWordToSettingsAndUpdate(path, word).then(_ => {})
            : undefined
    );
}

export function addWordToUserDictionary(word: string): Thenable<void> {
    return Settings.addWordToSettings(Settings.Target.Global, word);
}

export function enableLanguageId(languageId: string): Thenable<void> {
    if (languageId) {
        return Settings.enableLanguage(Settings.Target.Global, languageId)
        .then(() => {
            // Add it from the workspace as well if necessary
            const allSettings = Settings.getEnabledLanguagesFromConfig(Settings.Scopes.Workspace);
            if (allSettings) {
                return Settings.enableLanguage(Settings.Target.Workspace, languageId);
            }
        });
    }
    return Promise.resolve();
}

export function disableLanguageId(languageId: string): Thenable<void> {
    if (languageId) {
        return Settings.disableLanguage(Settings.Target.Global, languageId)
        .then(() => {
            // Remove it from the workspace as well if necessary
            const allSettings = Settings.getEnabledLanguagesFromConfig(Settings.Scopes.Workspace);
            if (allSettings) {
                return Settings.disableLanguage(Settings.Target.Workspace, languageId);
            }
        });
    }
    return Promise.resolve();
}

export function userCommandAddWordToDictionary(prompt: string, fnAddWord: (text: string) => Thenable<void>): () => Thenable<void> {
    return function () {
        const { activeTextEditor = {} } = window;
        const { selection, document } = activeTextEditor as TextEditor;
        const range = selection && document ? document.getWordRangeAtPosition(selection.active) : undefined;
        const value = range ? document.getText(selection) || document.getText(range) : selection && document.getText(selection) || '';
        return (selection && !selection.isEmpty)
            ? fnAddWord(value)
            : window.showInputBox({prompt, value}).then(word => { word && fnAddWord(word); });
    };
}

function pathToUri(uri: string | Uri): Uri {
    if (uri instanceof Uri) {
        return uri;
    }
    return Uri.parse(uri);
}
