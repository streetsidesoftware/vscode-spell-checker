import * as cspell from 'cspell';
import { SuggestionGenerator, maxNumberOfSuggestionsForLongWords } from './SuggestionsGenerator';

describe('Validate Suggestions', () => {
    interface DocInfo {
        languageId: string;
        text?: string;
    }

    test('genWordSuggestions', async () => {
        const gen = new SuggestionGenerator(getSettings);
        const doc = { languageId: 'typescript', text: '' };
        const settings = getSettings(doc);
        const result = await gen.genWordSuggestions(doc, 'code');
        expect(result).toContain('code');
        expect(result).toHaveLength(settings.numSuggestions || 0);
    });

    test('genWordSuggestions for long words', async () => {
        const gen = new SuggestionGenerator(getSettings);
        const doc = { languageId: 'typescript', text: '' };
        const result = await gen.genWordSuggestions(doc, 'Acknowledgements');
        expect(result).toHaveLength(maxNumberOfSuggestionsForLongWords);
        expect(result).toContain('acknowledgements');
    });

    function getSettings(doc: DocInfo) {
        return cspell.constructSettingsForText(cspell.getDefaultSettings(), doc.text || '', doc.languageId);
    }
});