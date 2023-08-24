import * as cspell from 'cspell-lib';
import { describe, expect, test } from 'vitest';

import { maxNumberOfSuggestionsForLongWords, SuggestionGenerator } from './SuggestionsGenerator.mjs';

const timeout = 30000;

describe('Validate Suggestions', () => {
    interface DocInfo {
        languageId: string;
        text?: string;
    }

    test(
        'genWordSuggestions',
        async () => {
            const gen = new SuggestionGenerator(getSettings);
            const doc = { languageId: 'typescript', text: '' };
            const { settings } = await getSettings(doc);
            const result = await gen.genWordSuggestions(doc, 'code');
            const resultWords = result.map((s) => s.word);
            expect(resultWords).toContain('code');
            expect(result).toHaveLength(settings.numSuggestions || 0);
        },
        timeout,
    );

    test(
        'genWordSuggestions for long words',
        async () => {
            const gen = new SuggestionGenerator(getSettings);
            const doc = { languageId: 'typescript', text: '' };
            const result = await gen.genWordSuggestions(doc, 'Acknowledgements');
            expect(result).toHaveLength(maxNumberOfSuggestionsForLongWords);
            expect(result.map((s) => s.word)).toContain('acknowledgements');
        },
        timeout,
    );

    async function getSettings(doc: DocInfo) {
        const settings = await cspell.constructSettingsForText(cspell.getDefaultSettings(), doc.text || '', doc.languageId);
        const dictionary = await cspell.getDictionary(settings);
        return { settings, dictionary };
    }
});
