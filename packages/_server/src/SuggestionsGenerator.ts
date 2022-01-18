import { CSpellUserSettings } from './config/cspellConfig';
import { SuggestionResult, CompoundWordsMethod } from 'cspell-lib';
import { SpellingDictionaryCollection } from 'cspell-lib';
import type { SuggestOptions } from 'cspell-lib/dist/SpellingDictionary';

const defaultNumSuggestions = 10;

const regexJoinedWords = /[+]/g;

export const maxWordLengthForSuggestions = 20;
export const wordLengthForLimitingSuggestions = 15;
export const maxNumberOfSuggestionsForLongWords = 1;
const maxEdits = 3;

export interface GetSettingsResult {
    settings: CSpellUserSettings;
    dictionary: SpellingDictionaryCollection;
}

export class SuggestionGenerator<DocInfo> {
    constructor(readonly getSettings: (doc: DocInfo) => GetSettingsResult | Promise<GetSettingsResult>) {}

    async genSuggestions(doc: DocInfo, word: string): Promise<SuggestionResult[]> {
        const { settings, dictionary } = await this.getSettings(doc);
        const { numSuggestions = defaultNumSuggestions } = settings;

        if (word.length > maxWordLengthForSuggestions) {
            return [];
        }
        const numSugs =
            word.length > wordLengthForLimitingSuggestions ? Math.min(maxNumberOfSuggestionsForLongWords, numSuggestions) : numSuggestions;
        const options: SuggestOptions = {
            numChanges: maxEdits,
            numSuggestions: numSugs,
            // Turn off compound suggestions for now until it works a bit better.
            compoundMethod: CompoundWordsMethod.NONE,
            ignoreCase: !settings.caseSensitive,
            // Do not included ties, it could create a long list of suggestions.
            includeTies: false,
        };
        return dictionary.suggest(word, options).map((s) => ({ ...s, word: s.word.replace(regexJoinedWords, '') }));
    }

    async genWordSuggestions(doc: DocInfo, word: string): Promise<string[]> {
        return (await this.genSuggestions(doc, word)).map((sr) => sr.word);
    }
}
