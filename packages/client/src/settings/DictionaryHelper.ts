import { fileExists } from 'common-utils/file.js';
import { relativeTo } from 'common-utils/uriHelper.js';
import * as fs from 'fs-extra';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { Utils as UriUtils } from 'vscode-uri';
import { CSpellClient } from '../client';
import { getCSpellDiags } from '../diags';
import type { ConfigKind, ConfigScope, ConfigTarget, CustomDictionaryScope, DictionaryDefinitionCustom } from '../server';
import { ConfigKeysByField } from './configFields';
import { ConfigRepository, CSpellConfigRepository } from './configRepository';
import { cspellConfigDirectory, normalizeWords } from './CSpellSettings';
import { configTargetToDictionaryTarget } from './DictionaryTargetHelper';

type ConfigKindMask = {
    [key in ConfigKind]: boolean;
};

type ConfigScopeMask = {
    [key in ConfigScope]: boolean;
};

interface DictionaryHelperTargetKind extends ConfigKindMask {}
interface DictionaryHelperTargetScope extends ConfigScopeMask {}

const defaultCustomDictionaryFilename = 'custom-dictionary-words.txt';
const dictionaryTemplate = '# Custom Dictionary Words\n';

export interface DictionaryHelperTarget {
    kind: ConfigKindMask;
    scope: ConfigScopeMask;
}

const matchKindNone: ConfigKindMask = { dictionary: false, cspell: false, vscode: false };
const matchKindAll: ConfigKindMask = { dictionary: true, cspell: true, vscode: true };
const matchKindCSpell: ConfigKindMask = { dictionary: false, cspell: true, vscode: false };
const matchKindVSCode: ConfigKindMask = { dictionary: false, cspell: false, vscode: true };

const matchScopeNone: ConfigScopeMask = { unknown: false, folder: false, workspace: false, user: false };
const matchScopeAll: ConfigScopeMask = { unknown: true, folder: true, workspace: true, user: true };
const matchScopeAllButUser: ConfigScopeMask = { unknown: true, folder: true, workspace: true, user: false };
const matchScopeUser: ConfigScopeMask = { unknown: false, folder: false, workspace: false, user: true };
const matchScopeWorkspace: ConfigScopeMask = { unknown: false, folder: false, workspace: true, user: false };
const matchScopeFolder: ConfigScopeMask = { unknown: false, folder: true, workspace: false, user: false };

export type TargetMatchFn = (configTargets: ConfigTarget[]) => Promise<ConfigTarget | undefined> | ConfigTarget | undefined;

export const dictionaryTargetBestMatch = buildMatchTargetFn(matchKindAll, matchScopeAllButUser);
export const dictionaryTargetBestMatchUser = buildMatchTargetFn(matchKindAll, matchScopeUser);
export const dictionaryTargetBestMatchWorkspace = buildMatchTargetFn(matchKindAll, matchScopeWorkspace);
export const dictionaryTargetBestMatchFolder = buildMatchTargetFn(matchKindAll, matchScopeFolder);
export const dictionaryTargetCSpell = buildMatchTargetFn(matchKindCSpell, matchScopeAll);
export const dictionaryTargetVSCodeUser = buildMatchTargetFn(matchKindVSCode, matchScopeUser);
export const dictionaryTargetVSCodeWorkspace = buildMatchTargetFn(matchKindVSCode, matchScopeWorkspace);
export const dictionaryTargetVSCodeFolder = buildMatchTargetFn(matchKindVSCode, matchScopeFolder);

export class DictionaryHelper {
    constructor(public client: CSpellClient) {}

    /**
     * Add word or words to the configuration
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param target - where the word should be written: Folder, Workspace, User
     * @param docUri - the related document (helps to determine the configuration location)
     * @returns the promise resolves upon completion.
     */
    public async addWordsToTarget(words: string | string[], target: ConfigTarget | TargetMatchFn, docUri: Uri | undefined): Promise<void> {
        words = normalizeWords(words);
        const cfgTarget = await this.resolveTarget(target, docUri);
        if (!cfgTarget) return;
        const result = await this._addWordsToTarget(words, cfgTarget);
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

    /**
     * createCustomDictionary
     */
    public async createCustomDictionary(cfgRep: CSpellConfigRepository, name = 'custom-words', filename?: string): Promise<void> {
        const dir = UriUtils.dirname(cfgRep.configFileUri);
        const dictUri = await createCustomDictionaryFile(dir, filename);
        const relPath = './' + relativeTo(dir, dictUri);
        return this.addCustomDictionaryToConfig(cfgRep, relPath, name);
    }

    /**
     * addCustomDictionaryToConfig
     */
    public async addCustomDictionaryToConfig(
        cfgRep: ConfigRepository,
        relativePathToDictionary: string,
        name: string,
        scope?: CustomDictionaryScope
    ): Promise<void> {
        const def: DictionaryDefinitionCustom = {
            name,
            path: relativePathToDictionary,
            addWords: true,
            scope: scope ?? cfgRep.defaultDictionaryScope,
        };

        await cfgRep.update({
            updateFn: (cfg) => {
                const { dictionaries = [], dictionaryDefinitions = [] } = cfg;
                const defsByName = new Map(dictionaryDefinitions.map((d) => [d.name, d]));
                const dictNames = new Set(dictionaries);

                defsByName.set(name, def);
                dictNames.add(name);

                return {
                    dictionaries: [...dictNames],
                    dictionaryDefinitions: [...defsByName.values()],
                };
            },
            keys: [ConfigKeysByField.dictionaries, ConfigKeysByField.dictionaryDefinitions],
        });
    }

    private async _addWordsToTarget(words: string[], target: ConfigTarget): Promise<boolean> {
        const dictTarget = configTargetToDictionaryTarget(target);
        await dictTarget.addWords(words);
        return true;
    }

    private async getDocConfig(uri: Uri | undefined) {
        if (uri) {
            const doc = await vscode.workspace.openTextDocument(uri);
            return this.client.getConfigurationForDocument(doc);
        }
        return this.client.getConfigurationForDocument(undefined);
    }

    private async resolveTarget(target: ConfigTarget | TargetMatchFn, docUri: Uri | undefined): Promise<ConfigTarget | undefined> {
        if (typeof target !== 'function') return target;

        const docConfig = await this.getDocConfig(docUri);
        return target(docConfig.configTargets);
    }
}

function isTextDocument(d: vscode.TextDocument | vscode.Uri): d is vscode.TextDocument {
    return !!(<vscode.TextDocument>d).uri;
}

function findMatchingConfigTarget(target: DictionaryHelperTarget, configTargets: ConfigTarget[]): ConfigTarget[] {
    const matches: ConfigTarget[] = [];

    for (const t of configTargets) {
        if (!target.kind[t.kind] || !target.scope[t.scope]) continue;
        if (matches.length && (matches[0].kind !== t.kind || matches[0].scope !== t.scope)) break;
        matches.push(t);
    }

    return matches;
}

async function createCustomDictionaryFile(configDir: Uri, filename = defaultCustomDictionaryFilename, overwrite = false): Promise<Uri> {
    const dictDir =
        UriUtils.basename(configDir) === cspellConfigDirectory ? configDir : UriUtils.joinPath(configDir, cspellConfigDirectory);
    const dictUri = UriUtils.joinPath(dictDir, filename);
    overwrite = overwrite || !(await fileExists(dictUri));
    if (overwrite) {
        await fs.mkdirp(dictDir.fsPath);
        await fs.writeFile(dictUri.fsPath, dictionaryTemplate, 'utf8');
    }
    return dictUri;
}

export function buildMatchTargetFn(kind: Partial<DictionaryHelperTargetKind>, scope: Partial<DictionaryHelperTargetScope>): TargetMatchFn {
    const match = {
        kind: fillKind(kind),
        scope: fillScope(scope),
    };

    return async function (configTargets: ConfigTarget[]) {
        const found = findMatchingConfigTarget(match, configTargets);
        if (!found.length) throw new UnableToFindTarget('No matching configuration found.');
        if (found.length === 1) return found[0];

        const sel = await vscode.window.showQuickPick(
            found.map((f) => ({ label: f.name, _found: f })),
            { title: 'Choose Destination' }
        );
        return sel?._found;
    };
}

function fillKind(kind: Partial<DictionaryHelperTargetKind>): DictionaryHelperTargetKind {
    return merge(matchKindNone, kind);
}

function fillScope(scope: Partial<DictionaryHelperTargetScope>): DictionaryHelperTargetScope {
    return merge(matchScopeNone, scope);
}

function merge<T>(a: T, b: Partial<T>): T {
    const v: T = { ...a };
    type KeyOfT = keyof T;
    for (const [key, value] of Object.entries(b) as [KeyOfT, T[KeyOfT] | undefined][]) {
        if (value !== undefined) {
            v[key] = value;
        }
    }
    return v;
}

export class UnableToAddWordError extends Error {
    constructor(msg: string, readonly words: string | string[]) {
        super(msg);
    }
}

export class UnableToFindTarget extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export const __testing__ = {
    isTextDocument,
    createCustomDictionaryFile,
};
