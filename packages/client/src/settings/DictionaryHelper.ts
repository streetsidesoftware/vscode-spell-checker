import { CSpellClient } from '../client';
import * as config from './vsConfig';
import { addWordsToSettings, resolveTarget as resolveConfigTarget } from './settings';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import { addWordsToCustomDictionary, addWordsToSettingsAndUpdate, normalizeWords, CustomDictDef } from './CSpellSettings';
import type { ConfigTarget, ConfigKind, ConfigScope, ConfigTargetDictionary, ConfigTargetCSpell, ConfigTargetVSCode } from '../server';
import { getCSpellDiags } from '../diags';

type ConfigKindMask = {
    [key in ConfigKind]: boolean;
};

type ConfigScopeMask = {
    [key in ConfigScope]: boolean;
};

interface DictionaryHelperTargetKind extends ConfigKindMask {}
interface DictionaryHelperTargetScope extends ConfigScopeMask {}

export interface DictionaryHelperTarget {
    kind: ConfigKindMask;
    scope: ConfigScopeMask;
}

const matchKindNone: ConfigKindMask = { dictionary: false, cspell: false, vscode: false };
const matchKindAll: ConfigKindMask = { dictionary: true, cspell: true, vscode: true };
const matchKindCSpell: ConfigKindMask = { dictionary: false, cspell: true, vscode: false };

const matchScopeNone: ConfigScopeMask = { unknown: false, folder: false, workspace: false, user: false };
const matchScopeAllButUser: ConfigScopeMask = { unknown: true, folder: true, workspace: true, user: false };
const matchScopeUser: ConfigScopeMask = { unknown: false, folder: false, workspace: false, user: true };
const matchScopeWorkspace: ConfigScopeMask = { unknown: false, folder: false, workspace: true, user: false };
const matchScopeFolder: ConfigScopeMask = { unknown: false, folder: true, workspace: false, user: false };

export const dictionaryTargetBestMatch = buildTarget(matchKindAll, matchScopeAllButUser);
export const dictionaryTargetBestMatchUser = buildTarget(matchKindAll, matchScopeUser);
export const dictionaryTargetBestMatchWorkspace = buildTarget(matchKindAll, matchScopeWorkspace);
export const dictionaryTargetBestMatchFolder = buildTarget(matchKindAll, matchScopeFolder);
export const dictionaryTargetCSpell = buildTarget(matchKindCSpell, matchScopeAllButUser);
export const dictionaryTargetVSCodeUser = buildTarget(matchKindCSpell, matchScopeUser);
export const dictionaryTargetVSCodeWorkspace = buildTarget(matchKindCSpell, matchScopeWorkspace);
export const dictionaryTargetVSCodeFolder = buildTarget(matchKindCSpell, matchScopeFolder);

export class DictionaryHelper {
    constructor(public client: CSpellClient) {}

    /**
     * Add word or words to the configuration
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param target - where the word should be written: Folder, Workspace, User
     * @param docUri - the related document (helps to determine the configuration location)
     * @returns the promise resolves upon completion.
     */
    public async addWordsToTarget(words: string | string[], target: DictionaryHelperTarget, docUri: Uri | undefined): Promise<void> {
        words = normalizeWords(words);
        const docConfig = await this.getDocConfig(docUri);
        const cfgTarget = findMatchingConfigTarget(target, docConfig.configTargets);

        const result = cfgTarget && (await this.addToTarget(words, cfgTarget));
        if (!result) {
            throw new UnableToAddWordError(`Unable to add "${words}"`, words);
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
        return this.addWordsToTarget([...words], dictionaryTargetBestMatch, doc.uri);
    }

    private addToTarget(words: string[], target: ConfigTarget): Promise<boolean> {
        switch (target.kind) {
            case 'dictionary':
                return this.addToDictionary(words, target);
            case 'cspell':
                return this.addToCSpellConfig(words, target);
            case 'vscode':
                return this.addToVSCodeConfig(words, target);
        }
        return Promise.resolve(false);
    }

    private async addToDictionary(words: string[], target: ConfigTargetDictionary): Promise<boolean> {
        const def: CustomDictDef = {
            name: target.name,
            uri: Uri.parse(target.dictionaryUri),
        };
        await this.addWordsToCustomDictionaries(words, [def]);
        return true;
    }

    private async addToCSpellConfig(words: string[], target: ConfigTargetCSpell): Promise<boolean> {
        await addWordsToSettingsAndUpdate(Uri.parse(target.configUri), words);
        return true;
    }

    private async addToVSCodeConfig(words: string[], target: ConfigTargetVSCode): Promise<boolean> {
        const t = config.targetToConfigurationTarget(target.scope);
        if (!t) return false;
        const actualTarget = resolveConfigTarget(t, Uri.parse(target.docUri));
        return addWordsToSettings(actualTarget, words, false);
    }

    private async getDocConfig(uri: Uri | undefined) {
        if (uri) {
            const doc = await vscode.workspace.openTextDocument(uri);
            return this.client.getConfigurationForDocument(doc);
        }
        return this.client.getConfigurationForDocument(undefined);
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

function isTextDocument(d: vscode.TextDocument | vscode.Uri): d is vscode.TextDocument {
    return !!(<vscode.TextDocument>d).uri;
}

function findMatchingConfigTarget(target: DictionaryHelperTarget, configTargets: ConfigTarget[]): ConfigTarget | undefined {
    for (const t of configTargets) {
        if (target.kind[t.kind] && target.scope[t.scope]) return t;
    }

    return undefined;
}

export function buildTarget(
    kind: Partial<DictionaryHelperTargetKind>,
    scope: Partial<DictionaryHelperTargetScope>
): DictionaryHelperTarget {
    return Object.freeze({
        kind: fillKind(kind),
        scope: fillScope(scope),
    });
}

function fillKind(kind: Partial<DictionaryHelperTargetKind>): DictionaryHelperTargetKind {
    return Object.freeze({ ...matchKindNone, ...kind });
}

function fillScope(scope: Partial<DictionaryHelperTargetScope>): DictionaryHelperTargetScope {
    return Object.freeze({ ...matchScopeNone, ...scope });
}

export class UnableToAddWordError extends Error {
    constructor(msg: string, readonly words: string | string[]) {
        super(msg);
    }
}

export const __testing__ = {
    isTextDocument,
};
