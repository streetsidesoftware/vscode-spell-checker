import * as Rx from 'rx';
import * as path from 'path';
import {
    loadWordsRx,
    splitLineIntoWordsRx, splitLineIntoCodeWordsRx
} from '../src/wordListHelper';

import { SpellingDictionary } from './SpellingDictionary';
import { createCollectionRx, createCollection } from './SpellingDictionaryCollection';

export function loadSimpleWordList(filename: string): Rx.Observable<string> {
    return loadWordsRx(filename);
}

export function loadWordList(filename: string) {
    return loadWordsRx(filename).flatMap(splitLineIntoWordsRx);
}

export function loadCodeWordList(filename: string) {
    return loadWordsRx(filename).flatMap(splitLineIntoCodeWordsRx);
}

export function isWordInDictionaryP(word: string): Promise<boolean> {
    return dictionariesP.then(() => activeDictionary.has(word));
}

export function isWordInDictionary(word: string): boolean {
    return activeDictionary.has(word);
}

const wordListRx = [
    loadSimpleWordList(path.join(__dirname, '..', '..', 'dictionaries', 'wordsEn.txt')),
    loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'typescript.txt')),
    loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'node.txt')),
    loadWordList(path.join(__dirname, '..', '..', 'dictionaries', 'softwareTerms.txt')),
    loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'html.txt')),
    loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'php.txt')),
    loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'go.txt')),
    loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'companies.txt')),
    loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'python.txt')),
    loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'fonts.txt')),
];

export function suggest(word: string, numSuggestions: number): string[] {
    return activeDictionary.suggest(word, numSuggestions)
        .map(sr => sr.word);
}

// @todo: implement using dependency injection.  For now this is used for the refactoring.

let dictionaries = createCollection([]);
let activeDictionary = dictionaries;
const dictionariesP: Promise<SpellingDictionary> = createCollectionRx(wordListRx)
    .then(loadedDictionary => {
        dictionaries = loadedDictionary;
        return updateActiveDictionary();
    });

function updateActiveDictionary() {
    activeDictionary = dictionaries;
    return activeDictionary;
}

export function onDictionaryReady(): Promise<SpellingDictionary> {
    return dictionariesP;
}

export function getActiveDictionary(): SpellingDictionary {
    return activeDictionary;
}