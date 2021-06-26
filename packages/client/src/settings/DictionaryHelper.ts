import { CSpellClient } from '../client';
import { Target } from './config';
import * as config from './config';
import { resolveTarget, addWordsToSettings, determineSettingsPaths } from './settings';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import {
    addWordsToCustomDictionary,
    addWordsToSettingsAndUpdate,
    normalizeWords,
    DictDef as CustomDictionaryWithUri,
} from './CSpellSettings';
import type {
    CSpellUserSettings,
    CustomDictionaryScope,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
    GetConfigurationForDocumentResult,
} from '../server';

export class DictionaryHelper {
    constructor(public client: CSpellClient) {}

    /**
     * Add word or words to the configuration
     * @param word - a single word or multiple words separated with a space.
     * @param target - where the word should be written: Folder, Workspace, User
     * @param docUri - the related document (helps to determine the configuration location)
     * @returns the promise resolves upon completion.
     */
    public async addWordToTarget(word: string, target: Target, docUri: Uri | undefined): Promise<void> {
        const actualTarget = resolveTarget(target, docUri);
        const docConfig = await this.getDocConfig(docUri);
        const customDicts = this.getCustomDictionariesForTargetFromConfig(docConfig, actualTarget);

        if (!customDicts.length) {
            return this.addWordsToConfig(word, actualTarget, docConfig);
        }

        await this.addWordsToCustomDictionaries(normalizeWords(word), customDicts);
        return this.client.notifySettingsChanged();
    }

    private async getDocConfig(uri: Uri | undefined) {
        if (uri) {
            const doc = await vscode.workspace.openTextDocument(uri);
            return this.client.getConfigurationForDocument(doc);
        }
        return this.client.getConfigurationForDocument(undefined);
    }

    private async addWordsToConfig(word: string, actualTarget: config.ConfigTarget, docConfig: GetConfigurationForDocumentResult) {
        const uri = config.extractTargetUri(actualTarget) || undefined;
        await addWordsToSettings(actualTarget, word);
        const docConfigFiles = docConfig.configFiles.map((uri) => Uri.parse(uri));
        const paths = await determineSettingsPaths(actualTarget, uri, docConfigFiles);
        await Promise.all(paths.map((path) => addWordsToSettingsAndUpdate(path, word)));
    }

    private getCustomDictionariesForTargetFromConfig(docConfig: GetConfigurationForDocumentResult, target: config.ConfigTarget) {
        const dicts = DictionaryHelper.extractCustomDictionaries(docConfig.docSettings || docConfig.settings, config.extractTarget(target));
        return dicts;
    }

    private static extractCustomDictionaries(docConfig: CSpellUserSettings | undefined, target: Target): CustomDictionaryWithUri[] {
        const scope = targetToCustomDictionaryScope(target);
        const dictionaries = docConfig?.dictionaryDefinitions
            ?.filter(isDictionaryDefinitionCustom)
            .filter((dict) => shouldAddWordToDictionary(dict, scope))
            .map(dictionaryDefinitionToCustomDictionaryWithPath);
        return dictionaries || [];
    }

    async addWordsToCustomDictionaries(words: string[], dicts: CustomDictionaryWithUri[]): Promise<void> {
        const process = dicts
            .map((dict) => addWordsToCustomDictionary(words, dict))
            .map((p) => p.catch((e: Error) => vscode.window.showWarningMessage(e.message)));
        await Promise.all(process);
    }
}

function targetToCustomDictionaryScope(target: Target): CustomDictionaryScope {
    switch (target) {
        case Target.Workspace:
            return 'workspace';
        case Target.WorkspaceFolder:
            return 'folder';
    }
    return 'user';
}

function dictionaryDefinitionToCustomDictionaryWithPath(def: DictionaryDefinitionCustom): CustomDictionaryWithUri {
    return {
        name: def.name,
        uri: Uri.file(def.path),
    };
}

function shouldAddWordToDictionary(dict: DictionaryDefinition, scope: CustomDictionaryScope): boolean {
    if (!isDictionaryDefinitionCustom(dict)) return false;
    if (!dict.addWords) return false;
    if (!dict.scope) return true; // always add when no scope is defined.
    return matchesScope(dict.scope, scope);
}

function matchesScope(dictScope: CustomDictionaryScope | CustomDictionaryScope[], scope: CustomDictionaryScope): boolean {
    if (typeof dictScope === 'string') return dictScope === scope;
    return dictScope.includes(scope);
}

function isDictionaryDefinitionCustom(dict: DictionaryDefinition | DictionaryDefinitionCustom): dict is DictionaryDefinitionCustom {
    return (<DictionaryDefinitionCustom>dict).addWords !== undefined;
}
