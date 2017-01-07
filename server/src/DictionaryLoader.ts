import * as path from 'path';
import {
    loadWordsRx,
    splitLineIntoWordsRx, splitLineIntoCodeWordsRx
} from '../src/wordListHelper';
import { SpellingDictionary, createSpellingDictionaryRx } from './SpellingDictionary';
import * as Rx from 'rx';

export interface LoadOptions {
    // Type of file:
    //  S - single word per line,
    //  W - each line can contain one or more word separated by space,
    //  C - each line is treated like code (Camel Case is allowed)
    // Default is C
    // C is the slowest to load due to the need to split each line based upon code splitting rules.
    type?: 'S'|'W'|'C';
}

const loaders = {
    S: loadSimpleWordList,
    W: loadWordList,
    C: loadCodeWordList,
};

const dictionaryCache = new Map<string, Promise<SpellingDictionary>>();

export function loadDictionary(uri: string, options: LoadOptions): Promise<SpellingDictionary> {
    const { type = 'C' } = options;
    const key = [uri, type].join('|');
    if (!dictionaryCache.has(key)) {
        const loader = loaders[type];
        dictionaryCache.set(key, createSpellingDictionaryRx(loader(uri)));
    }

    return dictionaryCache.get(key)!;
}

function loadSimpleWordList(filename: string): Rx.Observable<string> {
    return loadWordsRx(filename);
}

function loadWordList(filename: string) {
    return loadWordsRx(filename).flatMap(splitLineIntoWordsRx);
}

function loadCodeWordList(filename: string) {
    return loadWordsRx(filename).flatMap(splitLineIntoCodeWordsRx);
}
