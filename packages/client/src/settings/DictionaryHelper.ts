import { fileExists } from 'common-utils/file.js';
import * as fs from 'fs-extra';
import { homedir } from 'os';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { Utils as UriUtils } from 'vscode-uri';
import { CSpellClient } from '../client';
import { getCSpellDiags } from '../diags';
import type {
    CSpellUserSettings,
    CustomDictionaries,
    CustomDictionary,
    CustomDictionaryEntry,
    CustomDictionaryScope,
    DictionaryDefinitionCustom,
} from '../client';
import { scrollToText } from '../util/textEditor';
import { ClientConfigTarget } from './clientConfigTarget';
import { ConfigFields } from './configFields';
import { ConfigRepository, CSpellConfigRepository, VSCodeRepository } from './configRepository';
import { dictionaryTargetBestMatches, MatchTargetsFn } from './configTargetHelper';
import { configUpdaterForKeys } from './configUpdater';
import { cspellConfigDirectory, normalizeWords } from './CSpellSettings';
import { createDictionaryTargetForConfigRep, DictionaryTarget } from './DictionaryTarget';
import { configTargetsToDictionaryTargets } from './DictionaryTargetHelper';
import { mapConfigTargetToClientConfigTarget } from './mappers/configTarget';
import { configurationTargetToDictionaryScope } from './targetAndScope';

const defaultCustomDictionaryName = 'custom-dictionary';
const dictionaryTemplate = '# Custom Dictionary Words\n';

export class DictionaryHelper {
    constructor(public client: CSpellClient) {}

    /**
     * Add word or words to the configuration
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param target - where the word should be written: ClientConfigTarget or a matching function.
     * @param docUri - the related document (helps to determine the configuration location)
     * @returns the promise resolves upon completion.
     */
    public async addWordsToTargets(
        words: string | string[],
        target: ClientConfigTarget[] | MatchTargetsFn,
        docUri: Uri | undefined
    ): Promise<void> {
        const cfgTarget = await this.resolveTargets(target, docUri);
        if (!cfgTarget) return;
        return this.addWordToDictionaries(words, cfgTarget);
    }

    /**
     * Add words to the configuration
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param rep - configuration to add the words to
     * @returns
     */
    public addWordsToConfigRep(words: string | string[], rep: ConfigRepository): Promise<void> {
        const dict = createDictionaryTargetForConfigRep(rep);
        return this.addWordToDictionary(words, dict);
    }

    /**
     * Add words to a dictionary (configuration or dictionary file)
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param dictTarget - where to add the words
     */
    public addWordToDictionaries(words: string | string[], dictTarget: DictionaryTarget[]): Promise<void> {
        const all = Promise.all(dictTarget.map((t) => this.addWordToDictionary(words, t)));
        return all.then();
    }

    /**
     * Add words to a dictionary (configuration or dictionary file)
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param dictTarget - where to add the words
     */
    public async addWordToDictionary(words: string | string[], dictTarget: DictionaryTarget): Promise<void> {
        words = normalizeWords(words);
        try {
            await dictTarget.addWords(words);
        } catch (e) {
            throw new UnableToAddWordError(`Unable to add "${words}"`, dictTarget, words, e);
        }
    }

    /**
     * Remove word or words from the configuration
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param target - where the word should be written: ClientConfigTarget or a matching function.
     * @param docUri - the related document (helps to determine the configuration location)
     * @returns the promise resolves upon completion.
     */
    public async removeWordsFromTargets(
        words: string | string[],
        target: ClientConfigTarget[] | MatchTargetsFn,
        docUri: Uri | undefined
    ): Promise<void> {
        words = normalizeWords(words);
        const dictTarget = await this.resolveTargets(target, docUri);
        if (!dictTarget) return;
        return this.removeWordFromDictionaries(words, dictTarget);
    }

    /**
     * Remove words from the configuration
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param rep - configuration to add the words to
     * @returns the promise resolves upon completion.
     */
    public removeWordsFromConfigRep(words: string | string[], rep: ConfigRepository): Promise<void> {
        const dict = createDictionaryTargetForConfigRep(rep);
        return this.removeWordFromDictionary(words, dict);
    }

    /**
     * Remove words from a dictionary file or configuration
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param dictTargets - where to remove the words
     * @returns the promise resolves upon completion.
     */
    public removeWordFromDictionaries(words: string | string[], dictTargets: DictionaryTarget[]): Promise<void> {
        const all = Promise.all(dictTargets.map((t) => this.removeWordFromDictionary(words, t)));
        return all.then();
    }

    /**
     * Remove words from a dictionary file or configuration
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param dictTarget - where to remove the words
     * @returns the promise resolves upon completion.
     */
    public async removeWordFromDictionary(words: string | string[], dictTarget: DictionaryTarget): Promise<void> {
        words = normalizeWords(words);
        try {
            await dictTarget.removeWords(words);
        } catch (e) {
            throw new DictionaryTargetError(`Unable to remove "${words}" from "${dictTarget.name}"`, dictTarget, e);
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
        return this.addWordsToTargets([...words], dictionaryTargetBestMatches, doc.uri);
    }

    /**
     * createCustomDictionary
     */
    public async createCustomDictionary(cfgRep: ConfigRepository, name?: string): Promise<void> {
        const dictInfo = await createCustomDictionaryForConfigRep(cfgRep);
        if (!dictInfo) throw new Error('Unable to determine location to create dictionary.');
        await this.addCustomDictionaryToConfig(cfgRep, dictInfo.relPath, name || dictInfo.name, dictInfo.scope);
        if (CSpellConfigRepository.isCSpellConfigRepository(cfgRep)) {
            const editor = await vscode.window.showTextDocument(cfgRep.configFileUri, { viewColumn: vscode.ViewColumn.Active });
            scrollToText(editor, 'dictionaryDefinitions');
        }
        await vscode.window.showTextDocument(dictInfo.uri, { viewColumn: vscode.ViewColumn.Beside });
    }

    /**
     * addCustomDictionaryToConfig
     */
    public addCustomDictionaryToConfig(
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
        return addCustomDictionaryToConfig(cfgRep, def);
    }

    private async getDocConfig(uri: Uri | undefined) {
        if (uri) {
            const doc = await vscode.workspace.openTextDocument(uri);
            return this.client.getConfigurationForDocument(doc);
        }
        return this.client.getConfigurationForDocument(undefined);
    }

    private async resolveTargets(
        target: ClientConfigTarget[] | MatchTargetsFn,
        docUri: Uri | undefined
    ): Promise<DictionaryTarget[] | undefined> {
        if (typeof target !== 'function') return configTargetsToDictionaryTargets(target);

        const docConfig = await this.getDocConfig(docUri);
        const targets = docConfig.configTargets.map(mapConfigTargetToClientConfigTarget);
        const cfgTarget = await target(targets);
        return cfgTarget && configTargetsToDictionaryTargets(cfgTarget);
    }
}

function isTextDocument(d: vscode.TextDocument | vscode.Uri): d is vscode.TextDocument {
    return !!(<vscode.TextDocument>d).uri;
}

interface DictInfo {
    uri: Uri;
    relPath: string;
    name: string;
    scope: CustomDictionaryScope | undefined;
}

async function createCustomDictionaryForConfigRep(configRep: ConfigRepository): Promise<DictInfo | undefined> {
    const dictInfo = calcDictInfoForConfigRep(configRep);
    if (!dictInfo) return;

    await createCustomDictionaryFile(dictInfo.uri);
    return dictInfo;
}

function calcDictInfoForConfigRep(configRep: ConfigRepository): DictInfo | undefined {
    const dictInfo = CSpellConfigRepository.isCSpellConfigRepository(configRep)
        ? calcDictInfoForConfigRepCSpell(configRep)
        : VSCodeRepository.isVSCodeRepository(configRep)
        ? calcDictInfoForConfigRepVSCode(configRep)
        : undefined;

    return dictInfo;
}

function calcDictInfoForConfigRepCSpell(cfgRep: CSpellConfigRepository): DictInfo | undefined {
    const scope = cfgRep.defaultDictionaryScope;
    const name = scopeToName(scope);
    const dir = UriUtils.dirname(cfgRep.configFileUri);
    const path = `${cspellConfigDirectory}/${name}.txt`;
    const dictUri = Uri.joinPath(dir, path);
    const relPath = './' + path;
    return { uri: dictUri, relPath, name, scope };
}

function calcDictInfoForConfigRepVSCode(configRep: VSCodeRepository): DictInfo | undefined {
    const scope = configurationTargetToDictionaryScope(configRep.target);
    if (configRep.target === vscode.ConfigurationTarget.Global) {
        const name = scopeToName(scope);
        const path = `${cspellConfigDirectory}/${name}.txt`;
        const dir = Uri.file(homedir());
        const uri = Uri.joinPath(dir, path);
        const relPath = '~/' + path;
        return { uri, relPath, name, scope };
    }
    const folder = configRep.getWorkspaceFolder();
    if (!folder) return;
    const suffix = scope === 'folder' ? '-' + cleanFolderName(folder.name) : '';
    const name = scopeToName(configurationTargetToDictionaryScope(configRep.target)) + suffix;
    const path = `${cspellConfigDirectory}/${name}.txt`;
    const uri = Uri.joinPath(folder.uri, path);
    const relPath = `\${workspaceFolder:${folder.name}}/${path}`;
    return { uri, relPath, name, scope };
}

function scopeToName(scope: CustomDictionaryScope | undefined): string {
    return scope ? `${defaultCustomDictionaryName}-${scope}` : defaultCustomDictionaryName;
}

function cleanFolderName(name: string): string {
    return name.toLowerCase().replace(/[^\w]/g, '-');
}

async function createCustomDictionaryFile(dictUri: Uri, overwrite = false): Promise<void> {
    overwrite = overwrite || !(await fileExists(dictUri));
    if (!overwrite) return;

    await fs.mkdirp(UriUtils.dirname(dictUri).fsPath);
    await fs.writeFile(dictUri.fsPath, dictionaryTemplate, 'utf8');
}

async function addCustomDictionaryToConfig(cfgRep: ConfigRepository, def: DictionaryDefinitionCustom): Promise<void> {
    const updater = CSpellConfigRepository.isCSpellConfigRepository(cfgRep)
        ? updaterForCustomDictionaryToConfigCSpell(def)
        : VSCodeRepository.isVSCodeRepository(cfgRep)
        ? updaterForCustomDictionaryToConfigVSCode(def)
        : undefined;
    if (!updater) throw Error(`Unsupported config ${cfgRep.kind}`);
    return cfgRep.update(updater);
}

function updaterForCustomDictionaryToConfigCSpell(def: DictionaryDefinitionCustom) {
    const name = def.name;
    return configUpdaterForKeys([ConfigFields.dictionaries, ConfigFields.dictionaryDefinitions], (cfg) => {
        const { dictionaries = [], dictionaryDefinitions = [] } = cfg;
        const defsByName = new Map(dictionaryDefinitions.map((d) => [d.name, d]));
        const dictNames = new Set(dictionaries);

        defsByName.set(name, def);
        dictNames.add(name);

        return {
            dictionaries: [...dictNames],
            dictionaryDefinitions: [...defsByName.values()],
        };
    });
}

function updaterForCustomDictionaryToConfigVSCode(def: DictionaryDefinitionCustom) {
    const name = def.name;
    return configUpdaterForKeys(
        [
            ConfigFields.customDictionaries,
            ConfigFields.customFolderDictionaries,
            ConfigFields.customWorkspaceDictionaries,
            ConfigFields.customUserDictionaries,
        ],
        (cfg) => {
            const { customDictionaries, ...rest } = combineCustomDictionaries(cfg);
            customDictionaries[name] = def;
            return {
                ...rest,
                customDictionaries,
            };
        }
    );
}

interface CombineCustomDictionariesResult extends Required<Pick<CSpellUserSettings, 'customDictionaries'>> {
    customFolderDictionaries: undefined;
    customWorkspaceDictionaries: undefined;
    customUserDictionaries: undefined;
}

function combineCustomDictionaries(s: CSpellUserSettings): CombineCustomDictionariesResult {
    const { customDictionaries = {}, customFolderDictionaries = [], customWorkspaceDictionaries = [], customUserDictionaries = [] } = s;

    const cdLegacy = [
        customUserDictionaries.map(mapScopeToCustomDictionaryEntry('user')),
        customWorkspaceDictionaries.map(mapScopeToCustomDictionaryEntry('workspace')),
        customFolderDictionaries.map(mapScopeToCustomDictionaryEntry('folder')),
    ].reduce(combineDictionaryEntries, customDictionaries);

    return {
        customDictionaries: { ...cdLegacy, ...customDictionaries },
        customFolderDictionaries: undefined,
        customWorkspaceDictionaries: undefined,
        customUserDictionaries: undefined,
    };
}

function mapScopeToCustomDictionaryEntry(scope: CustomDictionary['scope']): (c: CustomDictionaryEntry) => CustomDictionaryEntry {
    return (c: CustomDictionaryEntry) => {
        if (typeof c === 'string') return c;
        return { ...c, scope: c.scope || scope };
    };
}

function combineDictionaryEntries(c: CustomDictionaries, entries: CustomDictionaryEntry[]): CustomDictionaries {
    return entries.reduce(combineDictionaryEntry, c);
}

function combineDictionaryEntry(c: CustomDictionaries, entry: CustomDictionaryEntry): CustomDictionaries {
    const r = { ...c };
    if (typeof entry === 'string') {
        r[entry] = true;
    } else {
        r[entry.name] = entry;
    }

    return r;
}

export class DictionaryTargetError extends Error {
    constructor(msg: string, readonly dictTarget: DictionaryTarget, readonly cause: Error | unknown) {
        super(msg);
    }
}

export class UnableToAddWordError extends DictionaryTargetError {
    constructor(msg: string, dictTarget: DictionaryTarget, readonly words: string | string[], readonly cause: Error | unknown) {
        super(msg, dictTarget, cause);
    }
}

export const __testing__ = {
    addCustomDictionaryToConfig,
    calcDictInfoForConfigRep,
    combineCustomDictionaries,
    createCustomDictionaryFile,
    createCustomDictionaryForConfigRep,
    isTextDocument,
};
