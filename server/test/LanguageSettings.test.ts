import { expect } from 'chai';
import { calcSettingsForLanguage, defaultLanguageSettings } from '../src/LanguageSettings';

describe('Validate LanguageSettings', () => {
    it('tests merging language settings', () => {
        const sPython = calcSettingsForLanguage(defaultLanguageSettings, 'python', 'en');
        expect(sPython.allowCompoundWords).to.be.true;
        expect((sPython.dictionaries || []).sort()).to.be.deep.equal(['wordsEn', 'companies', 'softwareTerms', 'python', 'misc'].sort());

        const sPhp = calcSettingsForLanguage(defaultLanguageSettings, 'php', 'en-gb');
        expect(sPhp.allowCompoundWords).to.be.undefined;
        expect((sPhp.dictionaries || []).sort())
            .to.be.deep.equal(['wordsEnGb', 'companies', 'softwareTerms', 'php', 'html', 'fonts', 'css', 'typescript', 'misc'].sort());
    });
});