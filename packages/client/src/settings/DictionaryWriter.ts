import { ConfigTarget, createTargetForUri } from './vsConfig';
import { ConfigurationTarget } from 'vscode';
import {
    DictionaryTargets,
    isDictionaryTargetCSpellConfig,
    isDictionaryTargetDictionary,
    isDictionaryTargetFolder,
    isDictionaryTargetUser,
    isDictionaryTargetWorkspace,
} from './DictionaryTargets';
import { addWordsToSettings } from './settings';
import { addWordsToCustomDictionary, addWordsToSettingsAndUpdate } from './CSpellSettings';

export async function writeWordsToDictionary(target: DictionaryTargets, words: string[]): Promise<boolean> {
    const configTarget = dictionaryTargetToConfigTarget(target);
    if (configTarget) {
        return await addWordsToSettings(configTarget, words, false);
    }

    if (isDictionaryTargetCSpellConfig(target)) {
        return !!(await addWordsToSettingsAndUpdate(target.uri, words));
    }

    if (isDictionaryTargetDictionary(target)) {
        return addWordsToCustomDictionary(words, { ...target }).then(() => true);
    }

    return false;
}

function dictionaryTargetToConfigTarget(target: DictionaryTargets): ConfigTarget | undefined {
    if (isDictionaryTargetUser(target)) return ConfigurationTarget.Global;
    if (isDictionaryTargetWorkspace(target)) return ConfigurationTarget.Workspace;
    if (isDictionaryTargetFolder(target)) return createTargetForUri(ConfigurationTarget.WorkspaceFolder, target.docUri);
    return undefined;
}
