import { CSpellUserSettingsWithComments, DictionaryDefinitionCustom } from '../server';
import { unique, uniqueFilter } from '../util';
import { Uri } from 'vscode';
import { ConfigUpdateFn, isHandled, readConfigFile, UnhandledFileType, updateConfigFile, writeConfigFile } from './configFileReadWrite';
import { CustomDictDef } from './DictionaryTarget';

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
    'package.json',
    // Dynamic config is looked for last
    'cspell.config.js',
    'cspell.config.cjs',
];

export const nestedConfigLocations = ['package.json'];

export const cspellConfigDirectory = '.cspell';

export const possibleConfigFiles = new Set(configFileLocations.concat(nestedConfigLocations));
/**
 * A set of files that if changed, could indicate that the cspell configuration changed.
 *
 * An alias of possibleConfigFiles
 */
export const configFilesToWatch = possibleConfigFiles;

export interface CSpellSettings extends CSpellUserSettingsWithComments {}

const defaultSettings: CSpellSettings = Object.freeze({
    version: currentSettingsFileVersion,
});

export function getDefaultSettings(): CSpellSettings {
    return defaultSettings;
}

export function readSettings(filename: Uri, defaultSettingsIfNotFound?: CSpellSettings): Promise<CSpellSettings> {
    const defaults = defaultSettingsIfNotFound ?? defaultSettings;
    return readConfigFile(filename, defaults);
}

export function writeSettings(filename: Uri, settings: CSpellSettings): Promise<CSpellSettings> {
    return writeConfigFile(filename, settings).then(() => settings);
}

export function addIgnoreWordToSettingsAndUpdate(filename: Uri, word: string): Promise<void> {
    return readSettingsFileAndApplyUpdate(filename, (settings) => addIgnoreWordsToSettings(settings, normalizeWords(word)));
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
    return readSettingsFileAndApplyUpdateWithResult(filename, (settings) => removeWordsFromSettings(settings, normalizeWords(word)));
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
    return readSettingsFileAndApplyUpdateWithResult(filename, (settings) => addLanguageIdsToSettings(settings, languageIds, onlyIfExits));
}

export function removeLanguageIdsFromSettingsAndUpdate(filename: Uri, languageIds: string[]): Promise<CSpellSettings> {
    return readSettingsFileAndApplyUpdateWithResult(filename, (settings) => removeLanguageIdsFromSettings(settings, languageIds));
}

async function readSettingsFileAndApplyUpdateWithResult(cspellConfigUri: Uri, action: ConfigUpdateFn): Promise<CSpellSettings> {
    await readSettingsFileAndApplyUpdate(cspellConfigUri, action);
    return readSettings(cspellConfigUri);
}

export async function readSettingsFileAndApplyUpdate(cspellConfigUri: Uri, action: ConfigUpdateFn): Promise<void> {
    try {
        await updateConfigFile(cspellConfigUri, action);
    } catch (e) {
        return Promise.reject(
            e instanceof UnhandledFileType ? new FailedToUpdateConfigFile(`Update for config file format not supported.\n${e.message}`) : e
        );
    }
}

export function normalizeWords(words: string | string[]): string[] {
    if (typeof words !== 'string') return words;
    return words
        .split(' ')
        .map((a) => a.trim())
        .filter((a) => !!a);
}

export function isUpdateSupportedForConfigFileFormat(uri: Uri): boolean {
    return isHandled(uri);
}
export class FailedToUpdateConfigFile extends Error {
    constructor(message: string) {
        super(message);
    }
}

export function dictionaryDefinitionToCustomDictDef(def: DictionaryDefinitionCustom): CustomDictDef {
    return {
        name: def.name,
        uri: Uri.file(def.path),
    };
}
