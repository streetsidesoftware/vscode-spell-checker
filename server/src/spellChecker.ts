import * as Rx from 'rx';
import * as path from 'path';
import { Trie, addWordToTrie, TrieMap } from './suggest';
import * as sug from './suggest';
import { loadWords, processWordListLines, WordSet } from '../src/wordListHelper';

const minWordLength = 3;

export function loadWordListsFromFilenames(filenames: string[]): Rx.Observable<WordSet> {
    const wordLists = filenames.map(loadWords);
    return loadWordLists(wordLists);
}

export function loadWordLists(wordLists: Rx.Observable<string>[]): Rx.Observable<WordSet> {
    return processWordListLines(
            Rx.Observable.fromArray(wordLists).flatMap(a=>a),
            minWordLength
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
    loadWordListsFromFilenames([
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
