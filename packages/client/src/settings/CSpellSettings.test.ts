import * as path from 'path';
import { readSettings, updateSettings } from './CSpellSettings';
import * as CSS from './CSpellSettings';
import {unique} from '../util';
import { CSpellUserSettings } from '.';


describe('Validate CSpellSettings functions', () => {

    const filenameSampleCSpellFile = getPathToSample('cSpell.json');

    test('tests reading a settings file', () => {
        return readSettings(filenameSampleCSpellFile).then((settings => {
            expect(Object.keys(settings)).not.toHaveLength(0);
            expect(settings.enabled).toBeUndefined();
            expect(settings.enabledLanguageIds).toBeUndefined();
        }));
    });

    test('tests writing a file', () => {
        const filename = getPathToTemp('tempCSpell.json');
        return readSettings(filenameSampleCSpellFile)
        .then(settings => {
            settings.enabled = false;
            return updateSettings(filename, settings)
            .then(() => readSettings(filename))
            .then(writtenSettings => {
                expect(writtenSettings).toEqual(settings);
            });
        });
    });

    test('Validate default settings', () => {
        const defaultSetting = CSS.getDefaultSettings();
        expect(defaultSetting.words).toHaveLength(0);
        expect(defaultSetting.version).toBe('0.1');
    });

    test('tests adding words', () => {
        const words = ['test', 'case', 'case'];
        const defaultSettings = CSS.getDefaultSettings();
        Object.freeze(defaultSettings);
        const newSettings = CSS.addWordsToSettings(defaultSettings, words);
        expect(newSettings).not.toBe(defaultSettings);
        expect(newSettings.words).not.toHaveLength(0);
        expect(newSettings.words.sort()).toEqual(unique(words).sort());
    });


    test('tests adding languageIds', () => {
        const ids = ['cpp', 'cs', 'php', 'json', 'cs'];
        const defaultSettings = CSS.getDefaultSettings();
        Object.freeze(defaultSettings);
        expect(defaultSettings.enabledLanguageIds).toBeUndefined();
        const s1 = CSS.addLanguageIdsToSettings(defaultSettings, ids, true);
        expect(s1.enabledLanguageIds).toBeUndefined();
        const s2 = CSS.addLanguageIdsToSettings(defaultSettings, ids, false);
        expect(s2.enabledLanguageIds).not.toHaveLength(0);
        expect(s2.enabledLanguageIds!.sort()).toEqual(unique(ids).sort());
    });

    test('tests removing languageIds', () => {
        const ids = ['cpp', 'cs', 'php', 'json', 'cs'];
        const toRemove = ['cs', 'php', 'php'];
        const expected = ['cpp', 'json'];
        const defaultSettings = CSS.getDefaultSettings();
        expect(defaultSettings.enabledLanguageIds).toBeUndefined();
        const s2 = CSS.addLanguageIdsToSettings(defaultSettings, ids, false);
        Object.freeze(s2);
        expect(s2.enabledLanguageIds).not.toHaveLength(0);
        expect(s2.enabledLanguageIds!.sort()).toEqual(unique(ids).sort());
        const s3 = CSS.removeLanguageIdsFromSettings(s2, toRemove);
        expect(s3.enabledLanguageIds).not.toHaveLength(0);
        expect(s3.enabledLanguageIds!.sort()).toEqual(expected);
        const s4 = CSS.removeLanguageIdsFromSettings(defaultSettings, toRemove);
        expect(s4.enabledLanguageIds).toBeUndefined();
        const s5 = CSS.removeLanguageIdsFromSettings(s2, ids);
        expect(s5.enabledLanguageIds).toBeUndefined();
    });

    test('tests removing words from the settings', () => {
        const defaultSettings = CSS.getDefaultSettings();
        const settings: CSpellUserSettings = {...defaultSettings, words: ['apple', 'banana', 'orange', 'blue', 'green', 'red', 'Yellow']};
        Object.freeze(settings);
        const result = CSS.removeWordsFromSettings(settings, ['BLUE', 'pink', 'yellow']);
        expect(result.words).toEqual([ 'apple', 'banana', 'orange', 'green', 'red']);
    });
});


function getPathToSample(baseFilename: string) {
    return path.join(__dirname, '..', '..', 'samples', baseFilename);
}

function getPathToTemp(baseFilename: string) {
    return path.join(__dirname, '..', '..', 'temp', baseFilename);
}