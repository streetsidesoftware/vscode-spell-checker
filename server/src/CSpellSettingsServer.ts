import * as fs from 'fs';
import * as json from 'comment-json';
import {CSpellUserSettingsWithComments, CSpellUserSettings, RegExpPatternDefinition} from './CSpellSettingsDef';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cSpell.json';

const defaultSettings: CSpellUserSettingsWithComments = {
    version: currentSettingsFileVersion,
};

export function readSettings(filename: string, defaultValues: CSpellUserSettingsWithComments = defaultSettings): CSpellUserSettings {
    const settings: CSpellUserSettings = readJsonFile(filename);

    function readJsonFile(file): any {
        try {
            return json.parse(fs.readFileSync(file).toString());
        }
        catch (err) {
        }
        return defaultValues;
    }

    return {...defaultValues, ...settings};
}

/**
 * Merges two lists of strings and removes duplicates.  Order is NOT preserved.
 */
function mergeList<T>(left: T[] = [], right: T[] = []) {
    const setOfWords = new Set([...left, ...right]);
    return [...setOfWords.keys()];
}

export function mergeSettings(left: CSpellUserSettings, ...settings: CSpellUserSettings[]): CSpellUserSettings {
    return settings.reduce((left, right) => ({
        ...left,
        ...right,
        words:     mergeList(left.words,     right.words),
        userWords: mergeList(left.userWords, right.userWords),
        flagWords: mergeList(left.flagWords, right.flagWords),
        ignoreWords: mergeList(left.ignoreWords, right.ignoreWords),
        enabledLanguageIds: mergeList(left.enabledLanguageIds, right.enabledLanguageIds),
        ignoreRegExpList: mergeList(left.ignoreRegExpList, right.ignoreRegExpList),
        patterns: mergeList(left.patterns, right.patterns),
    }), left);
}

export function finalizeSettings(settings: CSpellUserSettings): CSpellUserSettings {
    // apply patterns to any RegExpLists.

    return {
        ...settings,
        ignoreRegExpList: applyPatterns(settings.ignoreRegExpList, settings.patterns),
    };
}

function applyPatterns(regExpList: (string | RegExp)[] = [], patterns: RegExpPatternDefinition[] = []): (string|RegExp)[] {
    const patternMap = new Map(patterns
        .map(def => [def.name, def.pattern] as [string, string|RegExp])
    );

    return regExpList.map(p => patternMap.get(p.toString()) || p);
}