import { isErrnoException } from '@internal/common-utils';
import { uriToFilePathOrHref, uriToName } from '@internal/common-utils/uriHelper';
import { format } from 'util';
import type { Uri } from 'vscode';
import { window, workspace } from 'vscode';
import { Utils as UriUtils } from 'vscode-uri';

import { vscodeFs as fs } from '../vscode/fs.mjs';
import type { ConfigRepository } from './configRepository.mjs';
import { createCSpellConfigRepository } from './configRepository.mjs';
import { addWordsFn, removeWordsFn, updaterAddWords, updaterRemoveWords } from './configUpdaters.mjs';
import { replaceDocText } from './replaceDocText.js';

const regBlockUpdateDictionaryFormat = /(\.((gz|jsonc?|yaml|yml|c?js)$|trie\b)|^$|[/\\]$)/i;

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
    constructor(
        readonly uri: Uri,
        name?: string,
    ) {
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
    const def = d as CustomDictDef;
    return typeof def.name === 'string' && typeof def.uri === 'object';
}

export function createDictionaryTargetForCSpell(cspellUri: Uri, name?: string): DictionaryTarget {
    return new DictionaryTargetInConfig(createCSpellConfigRepository(cspellUri, name));
}

export function createDictionaryTargetForConfigRep(rep: ConfigRepository): DictionaryTarget {
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
    if (regBlockUpdateDictionaryFormat.test(dict.uri.path)) {
        return Promise.reject(
            new Error(`Failed to add words to dictionary "${dict.name}", unsupported format: "${uriToFilePathOrHref(dict.uri)}".`),
        );
    }
    try {
        await ensureFileExists(dict.uri);
        const doc = await workspace.openTextDocument(dict.uri);
        const data = doc.getText();
        const lines = updateFn(data.split(/\r?\n/g));
        const text = lines.join('\n').trim() + '\n';
        const success = await replaceDocText(doc, text);
        if (!success) {
            await window.showInformationMessage(`Unable to add words to dictionary "${dict.name}"`);
        }
    } catch (e) {
        const errMsg = isErrnoException(e) ? e.message : format(e);
        return Promise.reject(new Error(`Failed to add words to dictionary "${dict.name}", ${errMsg}`));
    }
}

async function ensureFileExists(uri: Uri): Promise<void> {
    if (await fs.fileExists(uri)) return;

    await fs.createDirectory(UriUtils.dirname(uri));
    await fs.writeFile(uri, '');
}
