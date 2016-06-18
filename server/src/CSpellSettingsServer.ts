import * as fs from 'fs';
import {merge} from 'tsmerge';
import * as json from 'comment-json';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cSpell.json';

const defaultSettings: CSpellUserSettingsWithComments = {
    version: currentSettingsFileVersion,
    language: 'en',
    words: ['wasn'],
    flagWords: ['hte'],
    ignorePaths: ['./node_modules', './typings'],
};

export function readSettings(filename: string): CSpellUserSettings {
    const settings: CSpellUserSettings = readJsonFile(filename);

    function readJsonFile(file): any {
        try {
            return json.parse(fs.readFileSync(file).toString());
        }
        catch (err) {
        }
        return defaultSettings;
    }

    return merge(defaultSettings, settings);
}

