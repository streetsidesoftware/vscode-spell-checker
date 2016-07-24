
import * as Rx from 'rx';
import { Trie, addWordToTrie, TrieMap, SuggestionResult } from './suggest';
import * as Suggest from './suggest';

export class WordDictionary {

    public static create(words: Rx.Observable<string>, caseFn = (word: string) => word.toLowerCase()): Rx.Promise<WordDictionary> {
        return WordDictionary.loadWords(words, caseFn)
            .then(wst => new WordDictionary(wst, caseFn));
    }

    constructor(private wst: WordSetAndTrie, protected caseFn = (word: string) => word.toLowerCase()) {
    }

    /**
     * The promise resolves to true if the word is in the dictionary.
     *
     * @param {string} word
     * @returns {boolean}
     */
    public has(word: string): boolean {
        const {wordSet} = this.wst;
        return wordSet.has(word)
            || wordSet.has(word.toLowerCase());
    }

    /**
     * Make spelling suggestions.
     *
     * @param {string} word
     * @param {number} [numSuggestions]
     * @returns {SuggestionResult[]}
     */
    public suggest(word: string, numSuggestions?: number): SuggestionResult[] {
        return Suggest.suggest(this.wst.trie, this.caseFn(word), numSuggestions);
    }

    private static loadWords(words: Rx.Observable<string>, caseFn: (w: string) => string): Rx.Promise<WordSetAndTrie> {
        return words
            .map(caseFn)
            .reduce<WordSetAndTrie>((wst, word) => {
                if (! wst.wordSet.has(word)) {
                    wst.wordSet.add(word);
                    wst.trie = addWordToTrie(wst.trie, word);
                }
                return wst;
            }, {trie: { c: new TrieMap() }, wordSet: new Set<string>()})
            .toPromise();
    }

    public getWordCount() {
        return this.wst.wordSet.size;
    }
}

export interface WordSetAndTrie {
    trie: Trie;
    wordSet: Set<string>;
}

/**
 * Check if any of the `dictionaries` has `word`.
 *
 * @export
 * @param {WordDictionary[]} dictionaries
 * @param {string} word
 * @returns {boolean}
 */
export function has(dictionaries: WordDictionary[], word: string): boolean {
    for (const dic of dictionaries) {
        if (dic.has(word)) {
            return true;
        }
    }
    return false;
}

/**
 * Combine the suggestions from a list of dictionaries
 *
 * @export
 * @param {WordDictionary[]} dictionaries
 * @param {string} word
 * @param {number} numSuggestions
 * @return {SuggestionResult[]}
 */
export function suggestions(dictionaries: WordDictionary[], word: string, numSuggestions: number): SuggestionResult[] {
    const result = dictionaries
        .map(dict => dict.suggest(word, numSuggestions))
        .reduce((a, b) => {
            const c = a.concat(b).sort((a, b) => a.cost - b.cost);
            c.length = c.length < numSuggestions ? c.length : numSuggestions;
            return c;
        });
    return result;
}
