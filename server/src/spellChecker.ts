import * as Rx from 'rx';
import * as path from 'path';
import { Trie, addWordToTrie, TrieMap } from './suggest';
import * as sug from './suggest';
import { loadWords, processWordListLines, processWords, WordSet, splitLineIntoWordsRx, splitLineIntoCodeWordsRx } from '../src/wordListHelper';

const minWordLength = 3;

export function loadSimpleWordList(filename: string) {
    return loadWords(filename);
}

export function loadWordList(filename: string) {
    return loadWords(filename).flatMap(splitLineIntoWordsRx);
}

export function loadCodeWordList(filename: string) {
    return loadWords(filename).flatMap(splitLineIntoCodeWordsRx);
}

export function loadWordLists(wordLists: Rx.Observable<string>[]): Rx.Observable<WordSet> {
    return processWords(
            Rx.Observable.fromArray(wordLists).flatMap(a => a)
        )
        .tap(({word}) => { trie = addWordToTrie(trie, word); })
        .last()
        .map(({setOfWords}) => setOfWords);
}

export function isWordInDictionary(word: string): Rx.Promise<boolean> {
    const nWord = word.toLocaleLowerCase();
    return wordList.then(wordList => {
        return wordList.has(nWord)
            || userWords.has(nWord);
    });
}

export function setUserWords(...wordSets: string[][]) {
    userWords = new Set<string>();
    processWordListLines(
            Rx.Observable.fromArray(wordSets).flatMap(a => a),
            minWordLength
        )
        .tap(({word}) => { trie = addWordToTrie(trie, word); })
        .subscribe(({setOfWords}) => { userWords = setOfWords; });
}

let trie: Trie = { c: new TrieMap };

let userWords: WordSet = new Set<string>();

const wordList: Rx.Promise<WordSet> =
    loadWordLists([
        loadSimpleWordList(path.join(__dirname, '..', '..', 'dictionaries', 'wordsEn.txt')),
        loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'typescript.txt')),
        loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'node.txt')),
        loadWordList(path.join(__dirname, '..', '..', 'dictionaries', 'softwareTerms.txt')),
        loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'html.txt')),
        loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'php.txt')),
        loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'go.txt')),
        loadWordList(path.join(__dirname, '..', '..', 'dictionaries', 'companies.txt')),
        loadCodeWordList(path.join(__dirname, '..', '..', 'dictionaries', 'python.txt')),
    ])
    .toPromise();

export function suggest(word: string, numSuggestions?: number): string[] {
    const searchWord = word.toLowerCase();
    return sug.suggest(trie, searchWord, numSuggestions).map(sr => sr.word);
}
