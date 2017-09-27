import * as CSpellSettings from './settings/CSpellSettings';
import * as Settings from './settings';

import { window, TextEditor } from 'vscode';
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

export function addWordToWorkspaceDictionary(word: string): Thenable<void> {
    if (!Settings.hasWorkspaceLocation()) {
        return addWordToUserDictionary(word);
    }
    return Settings.addWordToSettings(false, word)
    .then(_ => Settings.findExistingSettingsFileLocation())
    .then(path => path
            ? CSpellSettings.addWordToSettingsAndUpdate(path, word).then(_ => {})
            : undefined
    );
}

export function addWordToUserDictionary(word: string): Thenable<void> {
    return Settings.addWordToSettings(true, word);
}

export function enableLanguageId(languageId: string): Thenable<void> {
    if (languageId) {
        return Settings.enableLanguage(true, languageId)
        .then(() => {
            // Add it from the workspace as well if necessary
            const allSettings = Settings.getEnabledLanguagesFromAllConfigs();
            if (allSettings && allSettings.workspaceValue) {
                return Settings.enableLanguage(false, languageId);
            }
        });
    }
    return Promise.resolve();
}

export function disableLanguageId(languageId: string): Thenable<void> {
    if (languageId) {
        return Settings.disableLanguage(true, languageId)
        .then(() => {
            // Remove it from the workspace as well if necessary
            const allSettings = Settings.getEnabledLanguagesFromAllConfigs();
            if (allSettings && allSettings.workspaceValue) {
                return Settings.disableLanguage(false, languageId);
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

