import { ConfigurationTarget } from 'vscode';
import { addWordsToSettingsAndUpdate } from './CSpellSettings';
import { addWordsToCustomDictionary } from './DictionaryTarget';
import {
    DictionaryTargetInfo,
    isDictionaryTargetInfoCSpellConfig,
    isDictionaryTargetInfoDictionary,
    isDictionaryTargetInfoFolder,
    isDictionaryTargetInfoUser,
    isDictionaryTargetInfoWorkspace,
} from './DictionaryTargetInfo';
import { addWordsToSettings } from './settings';
import { ConfigTarget, createTargetForUri } from './vsConfig';

export async function writeWordsToDictionary(target: DictionaryTargetInfo, words: string[]): Promise<boolean> {
    const configTarget = dictionaryTargetToConfigTarget(target);
    if (configTarget) {
        return await addWordsToSettings(configTarget, words, false);
    }

    if (isDictionaryTargetInfoCSpellConfig(target)) {
        return !!(await addWordsToSettingsAndUpdate(target.uri, words));
    }

    if (isDictionaryTargetInfoDictionary(target)) {
        return addWordsToCustomDictionary(words, { ...target }).then(() => true);
    }

    return false;
}

function dictionaryTargetToConfigTarget(target: DictionaryTargetInfo): ConfigTarget | undefined {
    if (isDictionaryTargetInfoUser(target)) return ConfigurationTarget.Global;
    if (isDictionaryTargetInfoWorkspace(target)) return ConfigurationTarget.Workspace;
    if (isDictionaryTargetInfoFolder(target)) return createTargetForUri(ConfigurationTarget.WorkspaceFolder, target.docUri);
    return undefined;
}
