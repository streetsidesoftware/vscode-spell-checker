import * as fs from 'fs-extra';
import * as json from 'comment-json';
import path = require('path');
import {CSpellUserSettingsWithComments, CSpellUserSettings} from '../server';
import { unique, uniqueFilter } from '../util';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cSpell.json';

export interface CSpellSettings extends CSpellUserSettingsWithComments {
}

// cSpell:ignore hte
const defaultSettings: CSpellUserSettingsWithComments = {
    version: currentSettingsFileVersion,
    language: 'en',
    words: [],
    flagWords: [],
};

// cSpell:ignore hte
const defaultSettingsWithComments: CSpellSettings = {
    ...defaultSettings,
    '//^': [
        '// cSpell Settings'
    ],
    '// version': [`
    // Version of the setting file.  Always ${currentSettingsFileVersion}`
    ],

    '// language': [`
    // language - current active spelling language`],

    '// words': [`
    // words - list of words to be always considered correct`
    ],

    '// flagWords': [`
    // flagWords - list of words to be always considered incorrect
    // This is useful for offensive words and common spelling errors.
    // For example "hte" should be "the"`
    ],
};

export function getDefaultSettings(): CSpellSettings {
    return Object.freeze(defaultSettings);
}

export function readSettings(filename: string): Promise<CSpellSettings> {
    return fs.readFile(filename)
        .then(
            buffer => buffer.toString(),
            () => json.stringify(defaultSettingsWithComments, null, 4)
        )
        .then(cfgJson => (json.parse(cfgJson) as CSpellSettings))
        // covert parse errors into the defaultSettings
        .then(a => a, error => defaultSettingsWithComments)
        .then(settings => ({...defaultSettings, ...settings}));
}

export function updateSettings(filename: string, settings: CSpellSettings) {
    return fs.mkdirp(path.dirname(filename))
        .then(() => fs.writeFile(filename, json.stringify(settings, null, 4)))
        .then(() => settings);
}

export function addWordToSettingsAndUpdate(filename: string, word: string) {
    return readSettings(filename)
        .then(settings => addWordsToSettings(settings, word.split(' ')))
        .then(settings => updateSettings(filename, settings));
}

export function addWordsToSettings(settings: CSpellSettings, wordsToAdd: string[]) {
    const words = (settings.words || [])
        .concat(wordsToAdd)
        .map(a => a.trim())
        .filter(a => !!a)
        .filter(uniqueFilter())
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return {...settings, words};
}

export function removeWordsFromSettings(settings: CSpellSettings, wordsToRemove: string[]) {
    const words = filterOutWords(settings.words || [], wordsToRemove);
    return {...settings, words};
}

export function filterOutWords(words: string[], wordsToRemove: string[]): string[] {
    const toRemove = new Set(wordsToRemove.map(w => w.toLowerCase()));
    return words.filter(w => !toRemove.has(w.toLowerCase()));
}

export function removeWordFromSettingsAndUpdate(filename: string, word: string) {
    return readSettings(filename)
        .then(settings => removeWordsFromSettings(settings, word.split(' ')))
        .then(settings => updateSettings(filename, settings));
}

export function addLanguageIdsToSettings(settings: CSpellSettings, languageIds: string[], onlyIfExits: boolean) {
    if (settings.enabledLanguageIds || !onlyIfExits) {
        const enabledLanguageIds = unique((settings.enabledLanguageIds || []).concat(languageIds));
        return { ...settings, enabledLanguageIds };
    }
    return settings;
}

export function removeLanguageIdsFromSettings(settings: CSpellSettings, languageIds: string[]) {
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
