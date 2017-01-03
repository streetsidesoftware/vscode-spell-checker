import * as fs from 'fs';
import * as json from 'comment-json';
import {CSpellUserSettingsWithComments, CSpellUserSettings} from './CSpellSettingsDef';

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
        enabledLanguageIds: mergeList(left.enabledLanguageIds, right.enabledLanguageIds),
        ignoreRegExpList: mergeList(left.ignoreRegExpList, right.ignoreRegExpList),
    }), left);
}
