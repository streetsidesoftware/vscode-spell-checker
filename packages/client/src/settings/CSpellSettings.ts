import * as fs from 'fs-extra';
import * as json from 'comment-json';
import path = require('path');
import {CSpellUserSettingsWithComments} from '../server';
import { unique, uniqueFilter } from '../util';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cSpell.json';

export interface CSpellSettings extends CSpellUserSettingsWithComments {
}

// cSpell:ignore hte
const defaultSettings: CSpellUserSettingsWithComments = {
    version: currentSettingsFileVersion,
};

// cSpell:ignore hte
const defaultSettingsWithComments: CSpellSettings = {
    ...defaultSettings,
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
    return readApplyUpdateSettingsFile(
        filename,
        settings => addWordsToSettings(settings, word.split(' '))
    );
}

export function addWordsToSettings(settings: CSpellSettings, wordsToAdd: string[]) {
    const words = mergeWords(settings.words, wordsToAdd);
    return {...settings, words};
}

export function addIgnoreWordToSettingsAndUpdate(filename: string, word: string) {
    return readApplyUpdateSettingsFile(
        filename,
        settings => addIgnoreWordsToSettings(settings, word.split(' '))
    );
}

export function addIgnoreWordsToSettings(settings: CSpellSettings, wordsToAdd: string[]) {
    const ignoreWords = mergeWords(settings.ignoreWords, wordsToAdd);
    return {...settings, ignoreWords};
}

function mergeWords(wordsLeft: string[] | undefined, wordsRight: string[]): string[] {
    return (wordsLeft || [])
        .concat(wordsRight)
        .map(a => a.trim())
        .filter(a => !!a)
        .filter(uniqueFilter())
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
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
    return readApplyUpdateSettingsFile(
        filename,
        settings => removeWordsFromSettings(settings, word.split(' '))
    );
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
    return readApplyUpdateSettingsFile(
        filename,
        settings => addLanguageIdsToSettings(settings, languageIds, onlyIfExits)
    );
}

export function removeLanguageIdsFromSettingsAndUpdate(filename: string, languageIds: string[]) {
    return readApplyUpdateSettingsFile(
        filename,
        settings => removeLanguageIdsFromSettings(settings, languageIds)
    );
}

export async function readApplyUpdateSettingsFile(filename: string, action: (settings: CSpellSettings) => CSpellSettings) {
    const settings = await readSettings(filename);
    const newSettings = action(settings);
    return updateSettings(filename, newSettings);
}
