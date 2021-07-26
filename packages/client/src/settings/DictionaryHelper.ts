import { fileExists } from 'common-utils/file.js';
import { relativeTo } from 'common-utils/uriHelper.js';
import * as fs from 'fs-extra';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { Utils as UriUtils } from 'vscode-uri';
import { CSpellClient } from '../client';
import { getCSpellDiags } from '../diags';
import type { CustomDictionaryScope, DictionaryDefinitionCustom } from '../server';
import { ClientConfigTarget } from './clientConfigTarget';
import { ConfigKeysByField } from './configFields';
import { ConfigRepository, CSpellConfigRepository } from './configRepository';
import { dictionaryTargetBestMatch, TargetMatchFn } from './configTargetHelper';
import { cspellConfigDirectory, normalizeWords } from './CSpellSettings';
import { createDictionaryTargetForConfigRep, DictionaryTarget } from './DictionaryTarget';
import { configTargetToDictionaryTarget } from './DictionaryTargetHelper';
import { mapConfigTargetToClientConfigTarget } from './mappers/configTarget';

const defaultCustomDictionaryFilename = 'custom-dictionary-words.txt';
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
    public async addWordsToTarget(
        words: string | string[],
        target: ClientConfigTarget | TargetMatchFn,
        docUri: Uri | undefined
    ): Promise<void> {
        const cfgTarget = await this.resolveTarget(target, docUri);
        if (!cfgTarget) return;
        return this.addWordToDictionary(words, cfgTarget);
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
    public async addWordToDictionary(words: string | string[], dictTarget: DictionaryTarget): Promise<void> {
        words = normalizeWords(words);
        try {
            await dictTarget.addWords(words);
        } catch (e) {
            throw new UnableToAddWordError(`Unable to add "${words}"`, dictTarget, words);
        }
    }

    /**
     * Remove word or words from the configuration
     * @param words - a single word or multiple words separated with a space or an array of words.
     * @param target - where the word should be written: ClientConfigTarget or a matching function.
     * @param docUri - the related document (helps to determine the configuration location)
     * @returns the promise resolves upon completion.
     */
    public async removeWordsFromTarget(
        words: string | string[],
        target: ClientConfigTarget | TargetMatchFn,
        docUri: Uri | undefined
    ): Promise<void> {
        words = normalizeWords(words);
        const dictTarget = await this.resolveTarget(target, docUri);
        if (!dictTarget) return;
        return this.removeWordFromDictionary(words, dictTarget);
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
     * @param dictTarget - where to remove the words
     * @returns the promise resolves upon completion.
     */
    public async removeWordFromDictionary(words: string | string[], dictTarget: DictionaryTarget): Promise<void> {
        words = normalizeWords(words);
        try {
            await dictTarget.addWords(words);
        } catch (e) {
            throw new DictionaryTargetError(`Unable to remove "${words}" from "${dictTarget.name}"`, dictTarget);
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

    private async getDocConfig(uri: Uri | undefined) {
        if (uri) {
            const doc = await vscode.workspace.openTextDocument(uri);
            return this.client.getConfigurationForDocument(doc);
        }
        return this.client.getConfigurationForDocument(undefined);
    }

    private async resolveTarget(
        target: ClientConfigTarget | TargetMatchFn,
        docUri: Uri | undefined
    ): Promise<DictionaryTarget | undefined> {
        if (typeof target !== 'function') return configTargetToDictionaryTarget(target);

        const docConfig = await this.getDocConfig(docUri);
        const targets = docConfig.configTargets.map(mapConfigTargetToClientConfigTarget);
        const cfgTarget = await target(targets);
        return cfgTarget && configTargetToDictionaryTarget(cfgTarget);
    }
}

function isTextDocument(d: vscode.TextDocument | vscode.Uri): d is vscode.TextDocument {
    return !!(<vscode.TextDocument>d).uri;
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

export class DictionaryTargetError extends Error {
    constructor(msg: string, readonly dictTarget: DictionaryTarget) {
        super(msg);
    }
}

export class UnableToAddWordError extends DictionaryTargetError {
    constructor(msg: string, dictTarget: DictionaryTarget, readonly words: string | string[]) {
        super(msg, dictTarget);
    }
}

export const __testing__ = {
    isTextDocument,
    createCustomDictionaryFile,
};
