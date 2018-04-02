import {expect} from 'chai';
import * as path from 'path';
import { readSettings, updateSettings } from './CSpellSettings';
import * as CSS from './CSpellSettings';
import {unique} from '../util';
import { CSpellUserSettings } from '.';


describe('Validate CSpellSettings functions', () => {

    const filenameSampleCSpellFile = getPathToSample('cSpell.json');

    it('tests reading a settings file', () => {
        return readSettings(filenameSampleCSpellFile).then((settings => {
            expect(settings).to.not.be.empty;
            expect(settings.enabled).to.be.undefined;
            expect(settings.enabledLanguageIds).to.be.undefined;
        }));
    });

    it('tests writing a file', () => {
        const filename = getPathToTemp('tempCSpell.json');
        return readSettings(filenameSampleCSpellFile)
        .then(settings => {
            settings.enabled = false;
            return updateSettings(filename, settings)
            .then(() => readSettings(filename))
            .then(writtenSettings => {
                expect(writtenSettings).to.be.deep.equal(settings);
            });
        });
    });

    it('Validate default settings', () => {
        const defaultSetting = CSS.getDefaultSettings();
        expect(defaultSetting.words).to.be.length(0);
        expect(defaultSetting.version).to.be.equal('0.1');
    });

    it('tests adding words', () => {
        const words = ['test', 'case', 'case'];
        const defaultSettings = CSS.getDefaultSettings();
        Object.freeze(defaultSettings);
        const newSettings = CSS.addWordsToSettings(defaultSettings, words);
        expect(newSettings).to.not.be.equal(defaultSettings);
        expect(newSettings.words).to.not.be.empty;
        expect(newSettings.words.sort()).to.be.deep.equal(unique(words).sort());
    });


    it('tests adding languageIds', () => {
        const ids = ['cpp', 'cs', 'php', 'json', 'cs'];
        const defaultSettings = CSS.getDefaultSettings();
        Object.freeze(defaultSettings);
        expect(defaultSettings.enabledLanguageIds).to.be.undefined;
        const s1 = CSS.addLanguageIdsToSettings(defaultSettings, ids, true);
        expect(s1.enabledLanguageIds).to.be.undefined;
        const s2 = CSS.addLanguageIdsToSettings(defaultSettings, ids, false);
        expect(s2.enabledLanguageIds).to.not.be.empty;
        expect(s2.enabledLanguageIds!.sort()).to.be.deep.equal(unique(ids).sort());
    });

    it('tests removing languageIds', () => {
        const ids = ['cpp', 'cs', 'php', 'json', 'cs'];
        const toRemove = ['cs', 'php', 'php'];
        const expected = ['cpp', 'json'];
        const defaultSettings = CSS.getDefaultSettings();
        expect(defaultSettings.enabledLanguageIds).to.be.undefined;
        const s2 = CSS.addLanguageIdsToSettings(defaultSettings, ids, false);
        Object.freeze(s2);
        expect(s2.enabledLanguageIds).to.not.be.empty;
        expect(s2.enabledLanguageIds!.sort()).to.be.deep.equal(unique(ids).sort());
        const s3 = CSS.removeLanguageIdsFromSettings(s2, toRemove);
        expect(s3.enabledLanguageIds).to.not.be.empty;
        expect(s3.enabledLanguageIds!.sort()).to.be.deep.equal(expected);
        const s4 = CSS.removeLanguageIdsFromSettings(defaultSettings, toRemove);
        expect(s4.enabledLanguageIds).to.be.undefined;
        const s5 = CSS.removeLanguageIdsFromSettings(s2, ids);
        expect(s5.enabledLanguageIds).to.be.undefined;
    });

    it('tests removing words from the settings', () => {
        const defaultSettings = CSS.getDefaultSettings();
        const settings: CSpellUserSettings = {...defaultSettings, words: ['apple', 'banana', 'orange', 'blue', 'green', 'red', 'Yellow']};
        Object.freeze(settings);
        const result = CSS.removeWordsFromSettings(settings, ['BLUE', 'pink', 'yellow']);
        expect(result.words).to.be.eql([ 'apple', 'banana', 'orange', 'green', 'red']);
    });
});


function getPathToSample(baseFilename: string) {
    return path.join(__dirname, '..', '..', 'samples', baseFilename);
}

function getPathToTemp(baseFilename: string) {
    return path.join(__dirname, '..', '..', 'temp', baseFilename);
}