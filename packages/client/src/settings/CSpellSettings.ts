import * as fs from 'fs-extra';
import * as json from 'comment-json';
import * as path from 'path';
import { CSpellUserSettingsWithComments } from '../server';
import { unique, uniqueFilter } from '../util';
import { Uri } from 'vscode';

const currentSettingsFileVersion = '0.2';

export const defaultFileName = 'cspell.json';

export const configFileLocations = [
    // Original locations
    '.cspell.json',
    'cspell.json',
    '.cSpell.json',
    'cSpell.json',
    // Original locations jsonc
    '.cspell.jsonc',
    'cspell.jsonc',
    // Alternate locations
    '.vscode/cspell.json',
    '.vscode/cSpell.json',
    '.vscode/.cspell.json',
    // Standard Locations
    'cspell.config.json',
    'cspell.config.jsonc',
    'cspell.config.yaml',
    'cspell.config.yml',
    'cspell.yaml',
    'cspell.yml',
    // Dynamic config is looked for last
    'cspell.config.js',
    'cspell.config.cjs',
];

export const nestedConfigLocations = ['package.json'];

const regIsJson = /\.jsonc?$/;
export const configFileLocationsJson = configFileLocations.filter((a) => regIsJson.test(a));

export const possibleConfigFiles = new Set(configFileLocations.concat(nestedConfigLocations));
/**
 * A set of files that if changed, could indicate that the cspell configuration changed.
 *
 * An alias of possibleConfigFiles
 */
export const configFilesToWatch = possibleConfigFiles;

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

export function readSettings(filename: Uri): Promise<CSpellSettings> {
    return (
        fs
            .readFile(filename.fsPath, 'utf8')
            .then(
                (cfgJson) => cfgJson,
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

export function updateSettings(filename: Uri, settings: CSpellSettings): Promise<CSpellSettings> {
    const fsPath = filename.fsPath;
    return fs
        .mkdirp(path.dirname(fsPath))
        .then(() => fs.writeFile(fsPath, json.stringify(settings, null, 4)))
        .then(() => settings);
}

export function addWordToSettingsAndUpdate(filename: Uri, word: string): Promise<CSpellSettings> {
    return readSettingsFileAndApplyUpdate(filename, (settings) => addWordsToSettings(settings, normalizeWord(word)));
}

export function addWordsToSettings(settings: CSpellSettings, wordsToAdd: string[]): CSpellSettings {
    const words = mergeWords(settings.words, wordsToAdd);
    return { ...settings, words };
}

export function addIgnoreWordToSettingsAndUpdate(filename: Uri, word: string): Promise<CSpellSettings> {
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

export function removeWordFromSettingsAndUpdate(filename: Uri, word: string): Promise<CSpellSettings> {
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

export function writeAddLanguageIdsToSettings(filename: Uri, languageIds: string[], onlyIfExits: boolean): Promise<CSpellSettings> {
    return readSettingsFileAndApplyUpdate(filename, (settings) => addLanguageIdsToSettings(settings, languageIds, onlyIfExits));
}

export function removeLanguageIdsFromSettingsAndUpdate(filename: Uri, languageIds: string[]): Promise<CSpellSettings> {
    return readSettingsFileAndApplyUpdate(filename, (settings) => removeLanguageIdsFromSettings(settings, languageIds));
}

export async function readSettingsFileAndApplyUpdate(
    filename: Uri,
    action: (settings: CSpellSettings) => CSpellSettings
): Promise<CSpellSettings> {
    const settings = await readSettings(filename);
    const newSettings = action(settings);
    return updateSettings(filename, newSettings);
}

export function normalizeWord(word: string): string[] {
    return [word].map((a) => a.trim()).filter((a) => !!a);
}

export class UnsupportedConfigFileFormat extends Error {
    constructor(message: string) {
        super(message);
    }
}
