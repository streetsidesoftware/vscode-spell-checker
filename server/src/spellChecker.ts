import * as Rx from 'rx';
import * as path from 'path';
import {
    loadWordsRx,
    splitLineIntoWordsRx, splitLineIntoCodeWordsRx
} from '../src/wordListHelper';

import { SpellingDictionary } from './SpellingDictionary';
import { createCollection, createCollectionP } from './SpellingDictionaryCollection';
import { loadDictionary } from './DictionaryLoader';

const dictionaryFiles: ['C' | 'S' | 'W', string][] = [
    ['S', path.join(__dirname, '..', '..', 'dictionaries', 'wordsEn.txt')],
    ['C', path.join(__dirname, '..', '..', 'dictionaries', 'typescript.txt')],
    ['C', path.join(__dirname, '..', '..', 'dictionaries', 'node.txt')],
    ['W', path.join(__dirname, '..', '..', 'dictionaries', 'softwareTerms.txt')],
    ['C', path.join(__dirname, '..', '..', 'dictionaries', 'html.txt')],
    ['C', path.join(__dirname, '..', '..', 'dictionaries', 'php.txt')],
    ['C', path.join(__dirname, '..', '..', 'dictionaries', 'go.txt')],
    ['C', path.join(__dirname, '..', '..', 'dictionaries', 'companies.txt')],
    ['C', path.join(__dirname, '..', '..', 'dictionaries', 'python.txt')],
    ['C', path.join(__dirname, '..', '..', 'dictionaries', 'fonts.txt')],
];

function loadDictionaries(): Promise<SpellingDictionary> {
    return createCollectionP(dictionaryFiles
        .map(([type, filename]) => loadDictionary(filename, { type }))
    );
}

// @todo: implement using dependency injection.  For now this is used for the refactoring.

let activeDictionary: SpellingDictionary = createCollection([]);
const dictionariesP: Promise<SpellingDictionary> = loadDictionaries().then(dictionaries => activeDictionary = dictionaries);

export function onDictionaryReady(): Promise<SpellingDictionary> {
    return dictionariesP;
}

export function getActiveDictionary(): SpellingDictionary {
    return activeDictionary;
}