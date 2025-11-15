import { Uri } from 'vscode';

import type { CSpellUserSettings, DictionaryDefinitionCustom } from '../client/index.mjs';
import { unique, uniqueFilter } from '../util/index.mjs';
import type { ConfigUpdateFn } from './configFileReadWrite.mjs';
import { isHandled, readConfigFile, UnhandledFileType, updateConfigFile, writeConfigFile } from './configFileReadWrite.mjs';
import type { CustomDictDef } from './DictionaryTarget.mjs';
import { compareWords } from './wordList.mjs';

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
    'cspell.config.mjs',
    'cspell.config.ts',
    'cspell.config.mts',
    // .config
    '.config/.cspell.json',
    '.config/cspell.json',
    '.config/.cSpell.json',
    '.config/cSpell.json',
    '.config/.cspell.jsonc',
    '.config/cspell.jsonc',
    '.config/cspell.config.json',
    '.config/cspell.config.jsonc',
    '.config/cspell.config.yaml',
    '.config/cspell.config.yml',
    '.config/cspell.yaml',
    '.config/cspell.yml',
    '.config/cspell.config.js',
    '.config/cspell.config.cjs',
    '.config/cspell.config.mjs',
    '.config/cspell.config.ts',
    '.config/cspell.config.mts',
] as const;

const setOfConfigFilesNames = new Set(configFileLocations.map((filename) => filename.split('/').slice(-1)[0]));

/**
 * A set of files that if changed, could indicate that the cspell configuration changed.
 *
 * An alias of possibleConfigFiles
 */
export const configFilesToWatch: Set<string> = Object.freeze(setOfConfigFilesNames);

export const configFileLocationGlob = `**/{${[...setOfConfigFilesNames].join(',')}}`;

type ConfigFileNames = (typeof configFileLocations)[number];

export const nestedConfigLocations = ['package.json'];

export const cspellConfigDirectory = '.cspell';

export const preferredConfigFiles: ConfigFileNames[] = ['cspell.json', 'cspell.config.yaml', 'package.json'];

export type CSpellSettings = CSpellUserSettings;

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

export function addIgnoreWordsToSettingsAndUpdate(filename: Uri, word: string): Promise<void> {
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

    words.sort(compareWords);
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
            e instanceof UnhandledFileType ? new FailedToUpdateConfigFile(`Update for config file format not supported.\n${e.message}`) : e,
        );
    }
}

// const regExWordCharacters = /[\w\p{L}\p{M}_'’-]+/gu;
const regExNonWordCharacters = /[^\w\p{L}\p{M}_'’-]+/gu;
const regExpIsWordLike = /^[\w\p{L}\p{M}_'’-]+$/u;

export function isWordLike(text: string): boolean {
    return regExpIsWordLike.test(text);
}

export function normalizeWords(words: string | string[]): string[] {
    words = typeof words !== 'string' ? words.join(' ') : words;
    return words
        .replace(regExNonWordCharacters, ' ')
        .split(' ')
        .map((a) => a.trim())
        .filter((a) => !!a)
        .filter(uniqueFilter());
}

export function isUpdateSupportedForConfigFileFormat(uri: Uri): boolean {
    return isHandled(uri);
}
export class FailedToUpdateConfigFile extends Error { }

export function dictionaryDefinitionToCustomDictDef(def: DictionaryDefinitionCustom): CustomDictDef {
    return {
        name: def.name,
        uri: Uri.file(def.path),
    };
}
