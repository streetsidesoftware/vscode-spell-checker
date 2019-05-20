import { CSpellUserSettings } from './cspellConfig';
import { SuggestionResult, getDictionary, CompoundWordsMethod } from 'cspell-lib';

const defaultNumSuggestions = 10;

const regexJoinedWords = /[+]/g;

export const maxWordLengthForSuggestions = 20;
export const wordLengthForLimitingSuggestions = 15;
export const maxNumberOfSuggestionsForLongWords = 1;
const maxEdits = 3;

export class SuggestionGenerator<DocInfo> {
    constructor(readonly getSettings: (doc: DocInfo) => (CSpellUserSettings | Promise<CSpellUserSettings>)) {}

    async genSuggestions(doc: DocInfo, word: string): Promise<SuggestionResult[]> {
        const settings = await this.getSettings(doc);
        const dictionary = await getDictionary(settings);
        const { numSuggestions = defaultNumSuggestions } = settings;

        if (word.length > maxWordLengthForSuggestions) {
            return [];
        }
        const numSugs = word.length > wordLengthForLimitingSuggestions ? maxNumberOfSuggestionsForLongWords : numSuggestions;
        const numEdits = maxEdits;
        // Turn off compound suggestions for now until it works a bit better.
        return dictionary.suggest(word, numSugs, CompoundWordsMethod.NONE, numEdits);
    }

    async genWordSuggestions(doc: DocInfo, word: string): Promise<string[]> {
        return (await this.genSuggestions(doc, word)).map(sr => sr.word.replace(regexJoinedWords, ''));
    }
}

