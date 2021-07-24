import { CSpellUserSettings } from '../server';
import { uriToName } from 'common-utils/uriHelper.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Uri } from 'vscode';
import { unique } from '../util';
import { ConfigRepository } from './configRepository';
import { CustomDictDef } from './CSpellSettings';

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

const configKeyWords = ['words'] as const;

class DictionaryTargetInConfig implements DictionaryTarget {
    readonly name: string;
    constructor(readonly rep: ConfigRepository) {
        this.name = rep.name;
    }

    addWords(words: string[]): Promise<void> {
        return this.rep.update(updateConfigFn(addWordsFn(words)), configKeyWords);
    }

    removeWords(words: string[]): Promise<void> {
        return this.rep.update(updateConfigFn(removeWordsFn(words)), configKeyWords);
    }
}

export function createDictionaryTargetForFile(uri: Uri, name?: string): DictionaryTargetFile {
    return new DictionaryTargetFileInstance(uri, name);
}

export function createDictionaryTargetForConfig(rep: ConfigRepository): DictionaryTarget {
    return new DictionaryTargetInConfig(rep);
}

type UpdateWords = (lines: string[]) => string[];

function updateConfigFn(updateFn: UpdateWords): (cfg: CSpellUserSettings) => CSpellUserSettings {
    return (cfg) => {
        const words = updateFn(cfg.words ?? []);
        return { words };
    };
}

function addWordsFn(words: string[]): (lines: string[]) => string[] {
    return (lines) => lines.concat(words);
}

function removeWordsFn(words: string[]): (lines: string[]) => string[] {
    return (lines) => {
        const current = new Set(lines);
        for (const w of words) {
            current.delete(w);
        }
        return [...current];
    };
}

export async function addWordsToCustomDictionary(words: string[], dict: CustomDictDef): Promise<void> {
    return updateWordInCustomDictionary(addWordsFn(words), dict);
}

async function updateWordInCustomDictionary(updateFn: (words: string[]) => string[], dict: CustomDictDef): Promise<void> {
    const fsPath = dict.uri.fsPath;
    if (!regIsSupportedCustomDictionaryFormat.test(fsPath)) {
        return Promise.reject(new Error(`Failed to add words to dictionary "${dict.name}", unsupported format: "${dict.uri.fsPath}".`));
    }
    try {
        const data = await fs.readFile(fsPath, 'utf8').catch(() => '');

        const lines = unique(updateFn(data.split(/\r?\n/g)))
            .filter((a) => !!a)
            .sort();
        await fs.mkdirp(path.dirname(fsPath));
        await fs.writeFile(fsPath, lines.join('\n').concat('\n'));
    } catch (e) {
        return Promise.reject(new Error(`Failed to add words to dictionary "${dict.name}", ${e.toString()}`));
    }
}
