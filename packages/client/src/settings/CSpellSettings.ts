import * as fs from 'fs-extra';
import * as json from 'comment-json';
import * as path from 'path';
import { CSpellUserSettingsWithComments } from '../server';
import { unique, uniqueFilter } from '../util';

const currentSettingsFileVersion = '0.2';

export const defaultFileName = 'cspell.json';

export interface CSpellSettings extends CSpellUserSettingsWithComments {}

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
    return (
        fs
            .readFile(filename)
            .then(
                (buffer) => buffer.toString(),
                () => json.stringify(defaultSettingsWithComments, null, 4)
            )
            .then((cfgJson) => json.parse(cfgJson) as CSpellSettings)
            // covert parse errors into the defaultSettings
            .then(
                (a) => a,
                (_error) => defaultSettingsWithComments
            )
            .then((settings) => ({ ...defaultSettings, ...settings }))
    );
}

export function updateSettings(filename: string, settings: CSpellSettings): Promise<CSpellSettings> {
    return fs
        .mkdirp(path.dirname(filename))
        .then(() => fs.writeFile(filename, json.stringify(settings, null, 4)))
        .then(() => settings);
}

export function addWordToSettingsAndUpdate(filename: string, word: string): Promise<CSpellSettings> {
    return readSettingsFileAndApplyUpdate(filename, (settings) => addWordsToSettings(settings, normalizeWord(word)));
}

export function addWordsToSettings(settings: CSpellSettings, wordsToAdd: string[]): CSpellSettings {
    const words = mergeWords(settings.words, wordsToAdd);
    return { ...settings, words };
}

export function addIgnoreWordToSettingsAndUpdate(filename: string, word: string): Promise<CSpellSettings> {
    return readSettingsFileAndApplyUpdate(filename, (settings) => addIgnoreWordsToSettings(settings, normalizeWord(word)));
}

export function addIgnoreWordsToSettings(settings: CSpellSettings, wordsToAdd: string[]): CSpellSettings {
    const ignoreWords = mergeWords(settings.ignoreWords, wordsToAdd);
    return { ...settings, ignoreWords };
}

function mergeWords(wordsLeft: string[] | undefined, wordsRight: string[]): string[] {
    const words = (wordsLeft || [])
        .concat(wordsRight)
        .map((a) => a.trim())
        .filter((a) => !!a)
        .filter(uniqueFilter());

    words.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return words;
}

export function removeWordsFromSettings(settings: CSpellSettings, wordsToRemove: string[]): CSpellSettings {
    const words = filterOutWords(settings.words || [], wordsToRemove);
    return { ...settings, words };
}

export function filterOutWords(words: string[], wordsToRemove: string[]): string[] {
    const toRemove = new Set(wordsToRemove.map((w) => w.toLowerCase()));
    return words.filter((w) => !toRemove.has(w.toLowerCase()));
}

export function removeWordFromSettingsAndUpdate(filename: string, word: string): Promise<CSpellSettings> {
    return readSettingsFileAndApplyUpdate(filename, (settings) => removeWordsFromSettings(settings, normalizeWord(word)));
}

export function addLanguageIdsToSettings(settings: CSpellSettings, languageIds: string[], onlyIfExits: boolean): CSpellSettings {
    if (settings.enabledLanguageIds || !onlyIfExits) {
        const enabledLanguageIds = unique((settings.enabledLanguageIds || []).concat(languageIds));
        return { ...settings, enabledLanguageIds };
    }
    return settings;
}

export function removeLanguageIdsFromSettings(settings: CSpellSettings, languageIds: string[]): CSpellSettings {
    if (settings.enabledLanguageIds) {
        const excludeLangIds = new Set(languageIds);
        const enabledLanguageIds = settings.enabledLanguageIds.filter((a) => !excludeLangIds.has(a));
        const newSettings: CSpellSettings = { ...settings, enabledLanguageIds };
        if (!newSettings.enabledLanguageIds?.length) {
            delete newSettings.enabledLanguageIds;
        }
        return newSettings;
    }
    return settings;
}

export function writeAddLanguageIdsToSettings(filename: string, languageIds: string[], onlyIfExits: boolean): Promise<CSpellSettings> {
    return readSettingsFileAndApplyUpdate(filename, (settings) => addLanguageIdsToSettings(settings, languageIds, onlyIfExits));
}

export function removeLanguageIdsFromSettingsAndUpdate(filename: string, languageIds: string[]): Promise<CSpellSettings> {
    return readSettingsFileAndApplyUpdate(filename, (settings) => removeLanguageIdsFromSettings(settings, languageIds));
}

export async function readSettingsFileAndApplyUpdate(
    filename: string,
    action: (settings: CSpellSettings) => CSpellSettings
): Promise<CSpellSettings> {
    const settings = await readSettings(filename);
    const newSettings = action(settings);
    return updateSettings(filename, newSettings);
}

export function normalizeWord(word: string): string[] {
    return [word].map((a) => a.trim()).filter((a) => !!a);
}
