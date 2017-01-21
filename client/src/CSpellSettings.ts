import * as fs from 'fs';
import {merge} from 'tsmerge';
import * as json from 'comment-json';
import mkdirp = require('mkdirp');
import path = require('path');
import {asPromise} from './asPromise';
import {CSpellUserSettingsWithComments, CSpellUserSettings} from '../server/src/CSpellSettingsDef';
export * from '../server/src/CSpellSettingsDef';
import { unique } from './util';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cSpell.json';

const mkDirP = asPromise(mkdirp);
const writeFile = asPromise<void, string, any>(fs.writeFile);
const readFile = asPromise(fs.readFile);


// cSpell:ignore hte
const defaultSettings: CSpellUserSettingsWithComments = {
    '//^': [
        '// cSpell Settings'
    ],
    '// version': [`
    // Version of the setting file.  Always 0.1`
    ],
    version: currentSettingsFileVersion,

    '// language': [`
    // language - current active spelling language`],
    language: 'en',

    '// words': [`
    // words - list of words to be always considered correct`
    ],
    words: [],

    '// flagWords': [`
    // flagWords - list of words to be always considered incorrect
    // This is useful for offensive words and common spelling errors.
    // For example "hte" should be "the"`
    ],
    flagWords: ['hte'],
};

export function getDefaultSettings(): CSpellUserSettings {
    return defaultSettings;
}

export function readSettings(filename: string): Promise<CSpellUserSettings> {
    return readFile(filename)
        .then(
            buffer => buffer.toString(),
            () => json.stringify(defaultSettings, null, 4)
        )
        .then(json.parse)
        // covert parse errors into the defaultSettings
        .then(a => a, error => defaultSettings)
        .then(settings => merge(defaultSettings, settings));
}

export function updateSettings(filename: string, settings: CSpellUserSettings) {
    return mkDirP(path.dirname(filename))
        .then(() => writeFile(filename, json.stringify(settings, null, 4)))
        .then(() => settings);
}

export function addWordToSettingsAndUpdate(filename: string, word: string) {
    return readSettings(filename)
        .then(settings => addWordsToSettings(settings, [word]))
        .then(settings => updateSettings(filename, settings));
}

export function addWordsToSettings(settings: CSpellUserSettingsWithComments, wordsToAdd: string[]) {
    const words = unique(settings.words.concat(wordsToAdd));
    return {...settings, words};
}
export function addLanguageIdsToSettings(settings: CSpellUserSettingsWithComments, languageIds: string[], onlyIfExits: boolean) {
    if (settings.enabledLanguageIds || !onlyIfExits) {
        const enabledLanguageIds = unique((settings.enabledLanguageIds || []).concat(languageIds));
        return { ...settings, enabledLanguageIds };
    }
    return settings;
}

export function removeLanguageIdsFromSettings(settings: CSpellUserSettingsWithComments, languageIds: string[]) {
    if (settings.enabledLanguageIds) {
        const excludeLangIds = new Set(languageIds);
        const enabledLanguageIds = settings.enabledLanguageIds.filter(a => !excludeLangIds.has(a));
        const newSettings = {...settings, enabledLanguageIds};
        if (!newSettings.enabledLanguageIds.length) {
            delete newSettings.enabledLanguageIds;
        }
        return newSettings;
    }
    return settings;
}

export function writeAddLanguageIdsToSettings(filename: string, languageIds: string[], onlyIfExits: boolean) {
    return readSettings(filename)
        .then(settings => addLanguageIdsToSettings(settings, languageIds, onlyIfExits))
        .then(settings => updateSettings(filename, settings));
}

export function removeLanguageIdsFromSettingsAndUpdate(filename: string, languageIds: string[]) {
    return readSettings(filename)
        .then(settings => removeLanguageIdsFromSettings(settings, languageIds))
        .then(settings => updateSettings(filename, settings));
}
