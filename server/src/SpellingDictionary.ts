import { suggest, SuggestionResult } from './suggest';
import { Trie, createTrie, addWordToTrie } from './Trie';
import { genSequence } from 'gensequence';
import * as Rx from 'rx';

export class SpellingDictionary {
    constructor(readonly words: Set<string>, readonly trie: Trie) {
    }

    public has(word: string) {
        return this.words.has(word);
    }

    public suggest(word: string, numSuggestions?: number): SuggestionResult[] {
        return suggest(this.trie, word, numSuggestions);
    }
}

export function createSpellingDictionary(words: Rx.Observable<string>): Rx.Promise<SpellingDictionary> {
    const promise = words
        .reduce(({words, trie}, word) => {
            if (! words.has(word)) {
                words.add(word);
                addWordToTrie(trie, word);
            }
            return {words, trie};
        }, { words: new Set<string>(), trie: createTrie() })
        .map(({words, trie}) => new SpellingDictionary(words, trie))
        .toPromise();
    return promise;
}

function asPromise<T>(thenable: { then(fnOnFulfil: (value: T) => T | Promise<T> | void, fnOnReject?: (reason?: any) => any): any }){
    return new Promise<T>((resolve, reject) => {
        thenable.then(resolve, reject);
    });
}