import * as CSpellSettings from './CSpellSettings';
import * as Settings from './settings';

import { window, TextEditor } from 'vscode';
import {
    TextEdit, Protocol2Code
} from 'vscode-languageclient';


export function applyTextEdits(uri: string, documentVersion: number, edits: TextEdit[]) {
    const textEditor = window.activeTextEditor;
    if (textEditor && textEditor.document.uri.toString() === uri) {
        if (textEditor.document.version !== documentVersion) {
            window.showInformationMessage(`Spelling changes are outdated and cannot be applied to the document.`);
        }
        textEditor.edit(mutator => {
            for (const edit of edits) {
                mutator.replace(Protocol2Code.asRange(edit.range), edit.newText);
            }
        }).then((success) => {
            if (!success) {
                window.showErrorMessage('Failed to apply spelling changes to the document.');
            }
        });
    }
}

export function addWordToWorkspaceDictionary(word: string) {
    if (!Settings.hasWorkspaceLocation()) {
        return addWordToUserDictionary(word);
    }
    Settings.getSettings()
    .then(foundSettingsInfo => {
        const path = foundSettingsInfo.path;
        if (path) {
            CSpellSettings.addWordToSettingsAndUpdate(path, word);
        }
    });
}

export function addWordToUserDictionary(word: string) {
    Settings.addWordToSettings(true, word);
}

export function enableLanguageId(languageId: string) {
    if (languageId) {
        Settings.enableLanguage(true, languageId);
    }
}

export function disableLanguageId(languageId: string) {
    if (languageId) {
        Settings.disableLanguage(true, languageId);
    }
}

export function userCommandAddWordToDictionary(prompt: string, fnAddWord) {
    return function () {
        const { activeTextEditor = {} } = window;
        const { selection, document } = activeTextEditor as TextEditor;
        const range = selection && document ? document.getWordRangeAtPosition(selection.active) : undefined;
        const value = range ? document.getText(selection) || document.getText(range) : '';
        window.showInputBox({prompt, value}).then(word => {
            if (word) {
                fnAddWord(word);
            }
        });
    };
}


