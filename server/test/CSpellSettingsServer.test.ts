import { expect } from 'chai';
import { mergeSettings } from '../src/CSpellSettingsServer';

describe('Validate CSpellSettingsServer', () => {
    it('tests mergeSettings', () => {
        expect(mergeSettings({}, {})).to.be.deep.equal({
            words: [],
            userWords: [],
            flagWords: [],
            enabledLanguageIds: [],
            ignoreRegExpList: [],
        });
    });
});
