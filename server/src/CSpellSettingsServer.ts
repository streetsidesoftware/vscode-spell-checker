import * as fs from 'fs';
import * as json from 'comment-json';
import {CSpellUserSettingsWithComments, CSpellUserSettings, RegExpPatternDefinition} from './CSpellSettingsDef';
import * as path from 'path';
import { normalizePathForDictDefs } from './Dictionaries';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cSpell.json';

const defaultSettings: CSpellUserSettingsWithComments = {
    version: currentSettingsFileVersion,
};

export function readSettings(filename: string, defaultValues: CSpellUserSettingsWithComments = defaultSettings): CSpellUserSettings {
    const settings: CSpellUserSettings = readJsonFile(filename);
    const pathToSettings = path.dirname(filename);

    function readJsonFile(file): any {
        try {
            return json.parse(fs.readFileSync(file).toString());
        }
        catch (err) {
        }
        return defaultValues;
    }

    // Fix up dictionaryDefinitions
    const dictionaryDefinitions = normalizePathForDictDefs(settings.dictionaryDefinitions || [], pathToSettings);
    const languageSettings = (settings.languageSettings || [])
        .map(langSetting => ({
            ...langSetting,
            dictionaryDefinitions: normalizePathForDictDefs(langSetting.dictionaryDefinitions || [], pathToSettings)
        }));

    return {...defaultValues, ...settings, dictionaryDefinitions, languageSettings};
}

export function readSettingsFiles(filenames: string[]): CSpellUserSettings {
    return filenames.map(filename => readSettings(filename)).reduce((a, b) => mergeSettings(a, b), defaultSettings);
}

/**
 * Merges two lists of strings and removes duplicates.  Order is NOT preserved.
 */
function mergeList<T>(left: T[] = [], right: T[] = []) {
    const setOfWords = new Set([...left, ...right]);
    return [...setOfWords.keys()];
}

function replaceIfNotEmpty<T>(left: Array<T> = [], right: Array<T> = []) {
    const filtered = right.filter(a => !!a);
    if (filtered.length) {
        return filtered;
    }
    return left;
}

export function mergeSettings(left: CSpellUserSettings, ...settings: CSpellUserSettings[]): CSpellUserSettings {
    return settings.reduce((left, right) => ({
        ...left,
        ...right,
        words:     mergeList(left.words,     right.words),
        userWords: mergeList(left.userWords, right.userWords),
        flagWords: mergeList(left.flagWords, right.flagWords),
        ignoreWords: mergeList(left.ignoreWords, right.ignoreWords),
        enabledLanguageIds: replaceIfNotEmpty(left.enabledLanguageIds, right.enabledLanguageIds),
        ignoreRegExpList: mergeList(left.ignoreRegExpList, right.ignoreRegExpList),
        patterns: mergeList(left.patterns, right.patterns),
        dictionaryDefinitions: mergeList(left.dictionaryDefinitions, right.dictionaryDefinitions),
        dictionaries: mergeList(left.dictionaries, right.dictionaries),
        languageSettings: mergeList(left.languageSettings, right.languageSettings),
    }), left);
}

export function mergeInDocSettings(left: CSpellUserSettings, right: CSpellUserSettings): CSpellUserSettings {
    const merged = {
        ...mergeSettings(left, right),
        includeRegExpList: mergeList(left.includeRegExpList, right.includeRegExpList),
    };
    return merged;
}


export function finalizeSettings(settings: CSpellUserSettings): CSpellUserSettings {
    // apply patterns to any RegExpLists.

    return {
        ...settings,
        ignoreRegExpList: applyPatterns(settings.ignoreRegExpList, settings.patterns),
        includeRegExpList: applyPatterns(settings.includeRegExpList, settings.patterns),
    };
}

function applyPatterns(regExpList: (string | RegExp)[] = [], patterns: RegExpPatternDefinition[] = []): (string|RegExp)[] {
    const patternMap = new Map(patterns
        .map(def => [def.name.toLowerCase(), def.pattern] as [string, string|RegExp])
    );

    return regExpList.map(p => patternMap.get(p.toString().toLowerCase()) || p);
}
