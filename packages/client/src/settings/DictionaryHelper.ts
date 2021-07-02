import { CSpellClient } from '../client';
import { ConfigurationTarget } from './config';
import * as config from './config';
import { addWordsToSettings, determineSettingsPaths, resolveTarget as resolveConfigTarget } from './settings';
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
import { DictionaryTargetTypes, TargetType } from './DictionaryTargets';

export class DictionaryHelper {
    constructor(public client: CSpellClient) {}

    /**
     * Add word or words to the configuration
     * @param word - a single word or multiple words separated with a space.
     * @param target - where the word should be written: Folder, Workspace, User
     * @param docUri - the related document (helps to determine the configuration location)
     * @returns the promise resolves upon completion.
     */
    public async addWordToTarget(word: string, target: config.AllTargetTypes, docUri: Uri | undefined): Promise<void> {
        const actualTarget = resolveTarget(target, docUri);
        const docConfig = await this.getDocConfig(docUri);

        let handled = false;
        handled = handled || (await this.addToDictionaries(word, actualTarget, docConfig));
        handled = handled || (await this.addToCSpellConfig(word, actualTarget, docConfig));
        handled = handled || (await this.addToVSCodeConfig(word, actualTarget, docConfig));

        handled && (await this.client.notifySettingsChanged());
        if (!handled) {
            vscode.window.showErrorMessage(`Unable to add "${word}" to ${actualTarget.target}`);
        }
    }

    private async addToDictionaries(word: string, target: Target, docConfig: GetConfigurationForDocumentResult): Promise<boolean> {
        if (target.target === TargetType.CSpell) return false;
        const customDicts = this.getCustomDictionariesForTargetFromConfig(docConfig, target);
        if (!customDicts.length) return false;
        await this.addWordsToCustomDictionaries(normalizeWords(word), customDicts);
        return true;
    }

    private async addToCSpellConfig(word: string, target: Target, docConfig: GetConfigurationForDocumentResult): Promise<boolean> {
        const docConfigFiles = docConfig.configFiles.map((uri) => Uri.parse(uri));
        const paths = await determineSettingsPaths(target.target, target.docUri, docConfigFiles);
        if (!paths.length) return false;
        await Promise.all(paths.map((path) => addWordsToSettingsAndUpdate(path, word)));
        return true;
    }

    private async addToVSCodeConfig(word: string, target: Target, _docConfig: GetConfigurationForDocumentResult): Promise<boolean> {
        const cfgTarget = config.targetToConfigurationTarget(target.target);
        if (!cfgTarget) return false;
        const actualTarget = resolveConfigTarget(cfgTarget, target.docUri);
        return addWordsToSettings(actualTarget, word, false);
    }

    private async getDocConfig(uri: Uri | undefined) {
        if (uri) {
            const doc = await vscode.workspace.openTextDocument(uri);
            return this.client.getConfigurationForDocument(doc);
        }
        return this.client.getConfigurationForDocument(undefined);
    }

    private getCustomDictionariesForTargetFromConfig(docConfig: GetConfigurationForDocumentResult, target: Target) {
        const dicts = extractCustomDictionaries(docConfig.docSettings || docConfig.settings, target);
        return dicts;
    }

    public async addWordsToCustomDictionaries(words: string[], dicts: CustomDictionaryWithUri[]): Promise<void> {
        const process = dicts
            .map((dict) => addWordsToCustomDictionary(words, dict))
            .map((p) => p.catch((e: Error) => vscode.window.showWarningMessage(e.message)));
        await Promise.all(process);
    }
}

function extractCustomDictionaries(docConfig: CSpellUserSettings | undefined, target: Target): CustomDictionaryWithUri[] {
    if (target.target === TargetType.CSpell) return [];
    const scope = targetToCustomDictionaryScope(target.target);
    const dictionaries = docConfig?.dictionaryDefinitions
        ?.filter(isDictionaryDefinitionCustom)
        .filter((dict) => shouldAddWordToDictionary(dict, scope))
        .map(dictionaryDefinitionToCustomDictionaryWithPath);
    return dictionaries || [];
}

function targetToCustomDictionaryScope(target: DictionaryTargetTypes): CustomDictionaryScope | undefined {
    switch (target) {
        case TargetType.User:
        case TargetType.Workspace:
        case TargetType.Folder:
            return target;
    }
    return undefined;
}

function dictionaryDefinitionToCustomDictionaryWithPath(def: DictionaryDefinitionCustom): CustomDictionaryWithUri {
    return {
        name: def.name,
        uri: Uri.file(def.path),
    };
}

function shouldAddWordToDictionary(dict: DictionaryDefinition, scope: CustomDictionaryScope | undefined): boolean {
    if (!isDictionaryDefinitionCustom(dict)) return false;
    if (!dict.addWords) return false;
    if (!dict.scope) return true; // always add when no scope is defined.
    return !scope || matchesScope(dict.scope, scope);
}

function matchesScope(dictScope: CustomDictionaryScope | CustomDictionaryScope[], scope: CustomDictionaryScope): boolean {
    if (typeof dictScope === 'string') return dictScope === scope;
    return dictScope.includes(scope) || !dictScope.length;
}

function isDictionaryDefinitionCustom(dict: DictionaryDefinition | DictionaryDefinitionCustom): dict is DictionaryDefinitionCustom {
    return (<DictionaryDefinitionCustom>dict).addWords !== undefined;
}

type ToTargetType = { [key in config.AllTargetTypes]: DictionaryTargetTypes };

const toTargetType: ToTargetType = {
    [ConfigurationTarget.Global]: TargetType.User,
    [ConfigurationTarget.Workspace]: TargetType.Workspace,
    [ConfigurationTarget.WorkspaceFolder]: TargetType.Folder,
    [TargetType.User]: TargetType.User,
    [TargetType.Workspace]: TargetType.Workspace,
    [TargetType.Folder]: TargetType.Folder,
    [TargetType.CSpell]: TargetType.CSpell,
    [TargetType.Dictionary]: TargetType.Dictionary,
};

interface Target {
    target: DictionaryTargetTypes;
    docUri: Uri | undefined;
}

function resolveTarget(target: config.AllTargetTypes, docUri?: Uri): Target {
    const tt = toTargetType[target];
    return { target: tt, docUri };
}
