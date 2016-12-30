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

export function createSpellingDictionary(wordList: string[]): SpellingDictionary {
    const {words, trie} = genSequence(wordList)
        .reduce(({words, trie}, word) => {
            if (! words.has(word)) {
                words.add(word);
                addWordToTrie(trie, word);
            }
            return {words, trie};
        }, { words: new Set<string>(), trie: createTrie() });
    return new SpellingDictionary(words, trie);
}

export function createSpellingDictionaryRx(words: Rx.Observable<string>): Rx.Promise<SpellingDictionary> {
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

