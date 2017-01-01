import { SpellingDictionary, createSpellingDictionaryRx } from './SpellingDictionary';
import { genSequence } from 'gensequence';
import { SuggestionResult } from './suggest';

export class SpellingDictionaryCollection implements SpellingDictionary {
    constructor(readonly dictionaries: SpellingDictionary[]) {
    }

    public has(word: string) {
        return isWordInAnyDictionary(this.dictionaries, word);
    }

    public suggest(word: string, numSuggestions: number) {
        return makeSuggestions(this.dictionaries, word, numSuggestions);
    }
}

export function createCollection(dictionaries: SpellingDictionary[]) {
    return new SpellingDictionaryCollection(dictionaries);
}

export function isWordInAnyDictionary(dicts: SpellingDictionary[], word: string) {
    return !!genSequence(dicts)
        .first(dict => dict.has(word));
}

export function makeSuggestions(dicts: SpellingDictionary[], word: string, numSuggestions: number) {

    // Make a map of the unique suggestions.  If there are duplicates, keep the lowest cost.
    const allSuggestions = genSequence(dicts)
        .concatMap(dict => dict.suggest(word, numSuggestions))
        .reduceToSequence<[string, SuggestionResult], Map<string, SuggestionResult>>((map, sug) => {
            const cost = Math.min(sug.cost, (map.get(sug.word) || sug).cost);
            map.set(sug.word, { ...sug, cost });
            return map;
        }, new Map<string, SuggestionResult>())
        // Convert the [k, v] to the v
        .map(([, v]) => v)
        .toArray()
        .sort((a, b) => a.cost - b.cost);

    return allSuggestions.slice(0, numSuggestions);
}

export function createCollectionRx(wordLists: Rx.Observable<string>[]): Promise<SpellingDictionaryCollection> {
    const dictionaries = wordLists.map(words => createSpellingDictionaryRx(words));
    return Promise.all(dictionaries)
        .then(dicts => new SpellingDictionaryCollection(dicts));
}
