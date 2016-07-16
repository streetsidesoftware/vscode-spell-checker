
import * as Rx from 'rx';
import { Trie, addWordToTrie, TrieMap, suggest, SuggestionResult } from './suggest';

export class WordDictionary {

    private wst: Rx.Promise<WordSetAndTrie>;

    constructor(words: Rx.Observable<string>, protected caseFn = (word: string) => word.toLowerCase()) {
        this.wst = this.loadWords(words.shareReplay());
    }

    public has(word: string): Rx.Promise<boolean> {
        return this.wst.then(({wordSet}) => {
            return wordSet.has(word) ||
                wordSet.has(word.toLowerCase());
        });
    }

    public suggest(word: string, numSuggestions?: number): Rx.Promise<SuggestionResult[]> {
        return this.wst.then(wst => suggest(wst.trie, this.caseFn(word), numSuggestions));
    }

    private loadWords(words: Rx.Observable<string>): Rx.Promise<WordSetAndTrie> {
        return words
            .map(this.caseFn)
            .reduce<WordSetAndTrie>((wst, word) => {
                if (! wst.wordSet.has(word)) {
                    wst.wordSet.add(word);
                    wst.trie = addWordToTrie(wst.trie, word);
                }
                return wst;
            }, {trie: { c: new TrieMap() }, wordSet: new Set<string>() })
            .toPromise();
    }
}

interface WordSetAndTrie {
    trie: Trie;
    wordSet: Set<string>;
}