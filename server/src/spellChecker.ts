import * as Rx from 'rx';
import * as fs from 'fs';
import * as path from 'path';
import { match } from './util/text';
import { Trie, addWordToTrie, TrieMap } from './suggest';
import * as sug from './suggest';
import * as Text from './util/text';

export interface WordSet {
    [index: string]: boolean;
}

const minWordLength = 3;

export function loadWords(filename: string): Rx.Observable<string> {
    const reader = Rx.Observable.fromNodeCallback<string>(fs.readFile);

    return reader(filename, 'utf-8')
        .flatMap(text => Rx.Observable.from(match(/(.+)(\r?\n)?/g, text)))
        .map(regExpExecArray => regExpExecArray[1])
        .map(line => line.trim())
        .filter(line => line !== '');
}

export function loadWordLists(filenames: string[]): Rx.Observable<WordSet> {
    return processWordListLines(
            Rx.Observable.fromArray(filenames)
                .flatMap(loadWords)
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

export function processWordListLines(lines: Rx.Observable<string>) {
    return lines
        .flatMap(line => Rx.Observable.concat(
            // Add the line
            Rx.Observable.just(line),
            // Add the individual words in the line
            Text.extractWordsFromTextRx(line)
                .flatMap(Text.splitCamelCaseWordWithOffset)
                .map(({word}) => word)
                .filter(word => word.length > minWordLength)
        ))
        .map(word => word.trim())
        .map(word => word.toLowerCase())
        .scan((pair: { setOfWords: WordSet; found: boolean; word: string; }, word: string) => {
            const { setOfWords } = pair;
            const found = setOfWords[word] === true;
            setOfWords[word] = true;
            return { found , word, setOfWords };
        }, { setOfWords: Object.create(null), found: false, word: '' })
        .filter(({found}) => !found);
}

export function setUserWords(...wordSets: string[][]) {
    userWords = Object.create(null);
    processWordListLines(
            Rx.Observable.fromArray(wordSets).flatMap(a => a)
        )
        .tap(({word}) => { trie = addWordToTrie(trie, word); })
        .subscribe(({setOfWords}) => { userWords = setOfWords; });
}

let trie: Trie = { c: new TrieMap() };

let userWords: WordSet = Object.create(null);

const wordList: Rx.Promise<WordSet> =
    loadWordLists([
        path.join(__dirname, '..', '..', 'dictionaries', 'wordsEn.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'typescript.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'node.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'softwareTerms.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'html.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'php.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'go.txt'),
        path.join(__dirname, '..', '..', 'dictionaries', 'companies.txt'),
    ])
    .toPromise();

export function suggest(word: string, numSuggestions?: number): string[] {
    const searchWord = word.toLowerCase();
    return sug.suggest(trie, searchWord, numSuggestions).map(sr => sr.word);
}