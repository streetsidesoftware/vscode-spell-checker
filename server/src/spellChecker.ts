import * as Rx from 'rx';
import * as path from 'path';
import { Trie, addWordToTrie, TrieMap } from './suggest';
import * as sug from './suggest';
import { loadWords, processWordListLines, WordDictionary } from '../src/wordListHelper';

const minWordLength = 3;

export function loadWordLists(filenames: string[]): Rx.Observable<WordDictionary> {
    return processWordListLines(
            Rx.Observable.fromArray(filenames)
                .flatMap(loadWords),
            minWordLength
        )
        .tap(({word}) => { trie = addWordToTrie(trie, word); })
        .last()
        .map(({setOfWords}) => setOfWords);
}

export function isWordInDictionary(word: string): Rx.Promise<boolean> {
    const nWord = word.toLocaleLowerCase();
    return wordList.then(wordList => {
        return wordList[nWord] === true
            || userWords[nWord] === true;
    });
}

export function setUserWords(...wordSets: string[][]) {
    userWords = Object.create(null);
    processWordListLines(
            Rx.Observable.fromArray(wordSets).flatMap(a => a),
            minWordLength
        )
        .tap(({word}) => { trie = addWordToTrie(trie, word); })
        .subscribe(({setOfWords}) => { userWords = setOfWords; });
}

let trie: Trie = { c: new TrieMap };

let userWords: WordDictionary = Object.create(null);

const wordList: Rx.Promise<WordDictionary> =
    loadWordLists([
        path.join(__dirname, '..', '..', 'dictionaries', 'wordsEn.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'typescript.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'node.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'softwareTerms.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'html.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'php.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'go.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'companies.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'python.txt'),
    ])
    .toPromise();

export function suggest(word: string, numSuggestions?: number): string[] {
    const searchWord = word.toLowerCase();
    return sug.suggest(trie, searchWord, numSuggestions).map(sr => sr.word);
}