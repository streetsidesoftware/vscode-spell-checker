import * as fs from 'fs';
import {merge} from 'tsmerge';
import * as json from 'comment-json';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cSpell.json';

const defaultSettings: CSpellUserSettingsWithComments = {
    '//^': [
        '// cSpell Settings'
    ],
    '//version': ['// Version of the setting file.'],
    version: currentSettingsFileVersion,

    '//language': ['// current active spelling language'],
    language: 'en',

    '//words': ['// list of words to be always considered correct'],
    words: ['wasn'],

    '//flagWords': ['// list of words to be always considered correct'],
    flagWords: ['hte'],

    '//ignorePaths': ['// matching file paths will to be ignored'],
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

