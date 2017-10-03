import * as fs from 'fs-extra';
import {merge} from 'tsmerge';
import * as json from 'comment-json';
import path = require('path');
import {CSpellUserSettingsWithComments, CSpellUserSettings} from '../server';
import { unique, uniqueFilter } from '../util';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cSpell.json';

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
    flagWords: [],
};

export function getDefaultSettings(): CSpellUserSettings {
    return defaultSettings;
}

export function readSettings(filename: string): Promise<CSpellUserSettings> {
    return fs.readFile(filename)
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
    return fs.mkdirp(path.dirname(filename))
        .then(() => fs.writeFile(filename, json.stringify(settings, null, 4)))
        .then(() => settings);
}

export function addWordToSettingsAndUpdate(filename: string, word: string) {
    return readSettings(filename)
        .then(settings => addWordsToSettings(settings, word.split(' ')))
        .then(settings => updateSettings(filename, settings));
}

export function addWordsToSettings(settings: CSpellUserSettingsWithComments, wordsToAdd: string[]) {
    const words = (settings.words || [])
        .concat(wordsToAdd)
        .map(a => a.trim())
        .filter(a => !!a)
        .filter(uniqueFilter())
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
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
