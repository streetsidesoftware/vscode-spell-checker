import * as Rx from 'rx';
import * as path from 'path';
import {
    loadWordsRx,
    splitLineIntoWordsRx, splitLineIntoCodeWordsRx
} from '../src/wordListHelper';
import { genSequence } from 'gensequence';

import { SpellingDictionary, createSpellingDictionary } from './SpellingDictionary';
import { createCollectionRx, createCollection } from './SpellingDictionaryCollection';

export function loadSimpleWordList(filename: string) {
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

export function setUserWords(...wordSets: string[][]) {
    const words = genSequence(wordSets)
        .concatMap(processWords);
    userDictionary = createSpellingDictionary(words);
    updateActiveDictionary();
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

function processWords(words: string[]): string[] {
    return words.map(processWord);
}

function processWord(word: string) {
    return word.trim().toLowerCase();
}

// @todo: implement using dependency injection.  For now this is used for the refactoring.

let userDictionary = createSpellingDictionary([]);
let dictionaries = createCollection([]);
let activeDictionary = createCollection([dictionaries, userDictionary]);
const dictionariesP: Promise<SpellingDictionary> = createCollectionRx(wordListRx.map(words => words.map(processWord)))
    .then(loadedDictionary => {
        dictionaries = loadedDictionary;
        return updateActiveDictionary();
    });

function updateActiveDictionary() {
    activeDictionary = createCollection([dictionaries, userDictionary]);
    return activeDictionary;
}

export function onDictionaryReady(): Promise<boolean> {
    return dictionariesP.then(() => true);
}

export function getActiveDictionary(): SpellingDictionary {
    return activeDictionary;
}