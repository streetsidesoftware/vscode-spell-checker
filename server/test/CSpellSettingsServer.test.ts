import { expect } from 'chai';
import { mergeSettings, readSettings } from '../src/CSpellSettingsServer';
import * as path from 'path';

describe('Validate CSpellSettingsServer', () => {
    it('tests mergeSettings', () => {
        expect(mergeSettings({}, {})).to.be.deep.equal({
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
        });
    });

    it('tests loading a cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', '..', 'server', 'sampleSourceFiles', 'cSpell.json');
        const settings = readSettings(filename);
        const x = settings;
    });
});
