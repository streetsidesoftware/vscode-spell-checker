import { uriToName } from 'common-utils/uriHelper.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Uri } from 'vscode';
import { ConfigRepository, CSpellConfigRepository } from './configRepository';
import { addWordsFn, removeWordsFn, updaterAddWords, updaterRemoveWords } from './configUpdaters';

const regIsSupportedCustomDictionaryFormat = /\.txt$/i;

export interface DictionaryTarget {
    /** Name of dictionary */
    readonly name: string;
    addWords: (words: string[]) => Promise<void>;
    removeWords: (words: string[]) => Promise<void>;
}

export interface DictionaryTargetFile extends DictionaryTarget {
    /** Uri of the dictionary file */
    readonly uri: Uri;
}

class DictionaryTargetFileInstance implements DictionaryTargetFile {
    readonly name: string;
    constructor(readonly uri: Uri, name?: string) {
        this.name = name ?? uriToName(uri);
    }

    addWords(words: string[]): Promise<void> {
        return addWordsToCustomDictionary(words, this);
    }

    removeWords(words: string[]): Promise<void> {
        return updateWordInCustomDictionary(removeWordsFn(words), this);
    }
}

class DictionaryTargetInConfig implements DictionaryTarget {
    readonly name: string;
    constructor(readonly rep: ConfigRepository) {
        this.name = rep.name;
    }

    addWords(words: string[]): Promise<void> {
        return this.rep.update(updaterAddWords(words));
    }

    removeWords(words: string[]): Promise<void> {
        return this.rep.update(updaterRemoveWords(words));
    }
}

export function createDictionaryTargetForFile(def: CustomDictDef): DictionaryTargetFile;
export function createDictionaryTargetForFile(uri: Uri, name?: string): DictionaryTargetFile;
export function createDictionaryTargetForFile(defOrUri: Uri | CustomDictDef, maybeName?: string): DictionaryTargetFile {
    const { uri, name } = isCustomDictDef(defOrUri) ? defOrUri : { uri: defOrUri, name: maybeName };
    return new DictionaryTargetFileInstance(uri, name);
}

function isCustomDictDef(d: CustomDictDef | Uri): d is CustomDictDef {
    const def = <CustomDictDef>d;
    return typeof def.name === 'string' && typeof def.uri === 'object';
}

export function createDictionaryTargetForCSpell(cspellUri: Uri, name?: string): DictionaryTarget {
    return new DictionaryTargetInConfig(new CSpellConfigRepository(cspellUri, name));
}

export function createDictionaryTargetForConfig(rep: ConfigRepository): DictionaryTarget {
    return new DictionaryTargetInConfig(rep);
}

export interface CustomDictDef {
    name: string;
    uri: Uri;
}

async function addWordsToCustomDictionary(words: string[], dict: CustomDictDef): Promise<void> {
    return updateWordInCustomDictionary(addWordsFn(words), dict);
}

async function updateWordInCustomDictionary(updateFn: (words: string[]) => string[], dict: CustomDictDef): Promise<void> {
    const fsPath = dict.uri.fsPath;
    if (!regIsSupportedCustomDictionaryFormat.test(fsPath)) {
        return Promise.reject(new Error(`Failed to add words to dictionary "${dict.name}", unsupported format: "${dict.uri.fsPath}".`));
    }
    try {
        const data = await fs.readFile(fsPath, 'utf8').catch(() => '');
        const lines = updateFn(data.split(/\r?\n/g).filter((a) => !!a));
        await fs.mkdirp(path.dirname(fsPath));
        await fs.writeFile(fsPath, lines.join('\n').trim().concat('\n'));
    } catch (e) {
        return Promise.reject(new Error(`Failed to add words to dictionary "${dict.name}", ${e.toString()}`));
    }
}
