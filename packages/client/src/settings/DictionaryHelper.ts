import { CSpellClient } from '../client';
import { ConfigurationTarget } from './vsConfig';
import * as config from './vsConfig';
import { addWordsToSettings, determineSettingsPaths, resolveTarget as resolveConfigTarget } from './settings';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import {
    addWordsToCustomDictionary,
    addWordsToSettingsAndUpdate,
    normalizeWords,
    CustomDictDef,
    dictionaryDefinitionToCustomDictDef,
} from './CSpellSettings';
import type {
    CSpellUserSettings,
    CustomDictionaryScope,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
    GetConfigurationForDocumentResult,
} from '../server';
import { DictionaryTargetTypes, TargetType } from './DictionaryTargets';
import { getCSpellDiags } from '../diags';

export class DictionaryHelper {
    constructor(public client: CSpellClient) {}

    /**
     * Add word or words to the configuration
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param target - where the word should be written: Folder, Workspace, User
     * @param docUri - the related document (helps to determine the configuration location)
     * @returns the promise resolves upon completion.
     */
    public async addWordsToTarget(words: string | string[], target: config.AllTargetTypes, docUri: Uri | undefined): Promise<void> {
        const actualTarget = resolveTarget(target, docUri);
        const docConfig = await this.getDocConfig(docUri);
        words = normalizeWords(words);

        let handled = false;
        handled = handled || (await this.addToDictionaries(words, actualTarget, docConfig));
        handled = handled || (await this.addToCSpellConfig(words, actualTarget, docConfig));
        handled = handled || (await this.addToVSCodeConfig(words, actualTarget, docConfig));

        handled && (await this.client.notifySettingsChanged());
        if (!handled) {
            vscode.window.showErrorMessage(`Unable to add "${words}" to ${actualTarget.target}`);
        }
    }

    /**
     * Add issues in the current document to the best location
     * @param source - optional source where that has issues defaults to the current open document.
     * @returns resolves when finished.
     */
    public async addIssuesToDictionary(source?: vscode.TextDocument | vscode.Uri): Promise<void> {
        source = source || vscode.window.activeTextEditor?.document;
        if (!source) return;
        const doc = isTextDocument(source) ? source : await vscode.workspace.openTextDocument(source);
        const diags = getCSpellDiags(doc.uri);
        if (!diags.length) return;
        const words = new Set(diags.map((d) => doc.getText(d.range)));
        return this.addWordsToTarget([...words], TargetType.Dictionary, doc.uri);
    }

    private async addToDictionaries(words: string[], target: Target, docConfig: GetConfigurationForDocumentResult): Promise<boolean> {
        if (target?.target === TargetType.CSpell) return false;
        const customDicts = this.getCustomDictionariesForTargetFromConfig(docConfig, target);
        if (!customDicts.length) return false;
        await this.addWordsToCustomDictionaries(words, customDicts);
        return true;
    }

    private async addToCSpellConfig(words: string[], target: Target, docConfig: GetConfigurationForDocumentResult): Promise<boolean> {
        const docConfigFiles = docConfig.configFiles.map((uri) => Uri.parse(uri));
        const paths = await determineSettingsPaths(target.target, target.docUri, docConfigFiles);
        if (!paths.length) return false;
        await Promise.all(paths.map((path) => addWordsToSettingsAndUpdate(path, words)));
        return true;
    }

    private async addToVSCodeConfig(words: string[], target: Target, _docConfig: GetConfigurationForDocumentResult): Promise<boolean> {
        const cfgTarget = config.targetToConfigurationTarget(target.target);
        if (!cfgTarget) return false;
        const actualTarget = resolveConfigTarget(cfgTarget, target.docUri);
        return addWordsToSettings(actualTarget, words, false);
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

    /**
     * Add words to a set of dictionaries.
     * @param words - words to add
     * @param dicts - dictionaries to target.
     */
    public async addWordsToCustomDictionaries(words: string[], dicts: CustomDictDef[]): Promise<void> {
        const process = dicts
            .map((dict) => addWordsToCustomDictionary(words, dict))
            .map((p) => p.catch((e: Error) => vscode.window.showWarningMessage(e.message)));
        await Promise.all(process);
    }
}

function extractCustomDictionaries(docConfig: CSpellUserSettings | undefined, target: Target): CustomDictDef[] {
    if (target.target === TargetType.CSpell) return [];
    const scope = targetToCustomDictionaryScope(target.target);
    const dictionaries =
        docConfig?.dictionaryDefinitions
            ?.filter(isDictionaryDefinitionCustom)
            .filter((dict) => shouldAddWordToDictionary(dict, scope))
            .map(dictionaryDefinitionToCustomDictDef) || [];

    if (target.target !== TargetType.Dictionary) return dictionaries;

    const scopeMask = dictionaries.map((d) => d.scope).reduce((a, b) => a | b, 0);

    // Highest bit represents the most local dictionary.
    const mask = highestBitSet(scopeMask);

    return dictionaries.filter((d) => d.scope & mask);
}

function highestBitSet(n: number): number {
    let x = n;
    x |= x >> 1;
    x |= x >> 2;
    x |= x >> 4;
    return x & ~(x - 1);
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

function isTextDocument(d: vscode.TextDocument | vscode.Uri): d is vscode.TextDocument {
    return !!(<vscode.TextDocument>d).uri;
}

interface Target {
    target: DictionaryTargetTypes;
    docUri: Uri | undefined;
}

function resolveTarget(target: config.AllTargetTypes, docUri?: Uri): Target {
    const tt = toTargetType[target];
    return { target: tt, docUri };
}

export const __testing__ = {
    isTextDocument,
};
