import * as CSpellSettings from './CSpellSettings';
import * as Settings from './settings';

import { workspace, window, TextEditor } from 'vscode';
import {
    TextEdit, Protocol2Code
} from 'vscode-languageclient';
import { unique } from './util';


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
    Settings.getSettings()
        .toArray()
        .subscribe(foundSettingsInfo => {
            // find the one with the shortest path
            const settingsInfo =  foundSettingsInfo.sort((a, b) => {
                const aLen = (a.path && a.path.length) || 4096;
                const bLen = (b.path && b.path.length) || 4096;
                return aLen - bLen;
            })[0];

            const {path, settings} = settingsInfo;
            if (path === undefined) {
                // The path is undefined if the workspace consists of a single file.  In that case, we need to add the word
                // to the global userWords.
                addWordToUserDictionary(word);
            } else {
                settings.words.push(word);
                settings.words = unique(settings.words);
                CSpellSettings.updateSettings(path, settings);
            }
    });
}

export function addWordToUserDictionary(word: string) {

    const config = workspace.getConfiguration();
    const userWords = config.get<string[]>('cSpell.userWords');
    userWords.push(word);
    config.update('cSpell.userWords', unique(userWords), true);
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


