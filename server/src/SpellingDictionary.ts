import { suggest, SuggestionResult } from './suggest';
import { Trie, createTrie, addWordToTrie } from './Trie';
import { genSequence, Sequence } from 'gensequence';
import {} from './DictionaryLoader';
import * as Rx from 'rx';

export interface SpellingDictionary {
    has(word: string): boolean;
    suggest(word: string, numSuggestions?: number): SuggestionResult[];
    size: number;
}

export class SpellingDictionaryInstance implements SpellingDictionary {
    constructor(readonly words: Set<string>, readonly trie: Trie) {
    }

    public has(word: string) {
        return this.words.has(word.toLowerCase());
    }

    public suggest(word: string, numSuggestions?: number): SuggestionResult[] {
        return suggest(this.trie, word.toLowerCase(), numSuggestions);
    }

    public get size() {
        return this.words.size;
    }
}

function reduceWordsToTrieSet(ws: {words: Set<string>, trie: Trie}, word: string): {words: Set<string>, trie: Trie} {
    // @todo: figure out dealing with case in source words
    word = word.toLowerCase();

    const {words, trie} = ws;
    if (! words.has(word)) {
        words.add(word);
        addWordToTrie(trie, word);
    }
    return {words, trie};
}

export function createSpellingDictionary(wordList: string[] | Sequence<string>): SpellingDictionary {
    const {words, trie} = genSequence(wordList)
        .reduce(reduceWordsToTrieSet, { words: new Set<string>(), trie: createTrie() });
    return new SpellingDictionaryInstance(words, trie);
}

export function createSpellingDictionaryRx(words: Rx.Observable<string>): Promise<SpellingDictionary> {
    const promise = words
        .reduce(reduceWordsToTrieSet, { words: new Set<string>(), trie: createTrie() })
        .map(({words, trie}) => new SpellingDictionaryInstance(words, trie))
        .toPromise();
    return Promise.all([promise]).then(a => a[0]);
}

