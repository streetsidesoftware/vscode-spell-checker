import * as fs from 'fs';
import {merge} from 'tsmerge';
import * as json from 'comment-json';
import mkdirp = require('mkdirp');
import path = require('path');
import {asPromise} from './asPromise';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cSpell.json';

const mkDirP = asPromise(mkdirp);
const writeFile = asPromise<void, string, any>(fs.writeFile);
const readFile = asPromise(fs.readFile);

const defaultSettings: CSpellUserSettingsWithComments = {
    '//^': [
        '// cSpell Settings'
    ],
    '// version': ['\n    // Version of the setting file.  Always 0.1'],
    version: currentSettingsFileVersion,

    '// language': ['\n    // language - current active spelling language'],
    language: 'en',

    '// words': [`
    // words - list of words to be always considered correct`
    ],
    words: [],

    '// flagWords': [`
    // flagWords - list of words to be always considered incorrect
    // This is useful for offensive words and common spelling errors.
    // For example "hte" should be "the"`
    ],
    flagWords: ['hte'],
};

export function getDefaultSettings(): CSpellUserSettings {
    return defaultSettings;
}

export function readSettings(filename: string): Promise<CSpellUserSettings> {
    return readFile(filename)
        .then(
            buffer => buffer.toString(),
            () => json.stringify(defaultSettings, null, 4)
        )
        .then(json.parse)
        // covert parse errors into the defaultSettings
        .then(a => a, error => defaultSettings)
        .then(settings => merge(defaultSettings, settings));
}

export function updateSettings(filename: string, settings: CSpellUserSettings) {
    return mkDirP(path.dirname(filename)).then(() =>
            writeFile(filename, json.stringify(settings, null, 4))
        )
        .then(() => settings);
}
