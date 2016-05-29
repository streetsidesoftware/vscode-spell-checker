import * as fs from 'fs';
import {merge} from 'tsmerge';

export interface SpellSettings {
    version: string;
    language: string;               // current active spell check language
    ignoreFilesRegEx: string[];     // matches the regex against the file url
    ignoreWordsList: string[];      // list of words to be ignored
    languageIDs: string[];          // list of supported programming languages
}

const defaultSettings: SpellSettings = {
    version: '0.1',
    language: 'en',
    ignoreWordsList: [],
    ignoreFilesRegEx: ['node_modules', 'typings'],
    languageIDs: [
        'typescript', 'javascript', 'typescriptreact', 'javascriptreact',
        'markdown', 'text', 'plaintext'
    ],
}

function readSettings(filename: string): SpellSettings {
    const settings: SpellSettings = readJsonFile(filename);

    function readJsonFile(file): any {
        try {
            return JSON.parse(fs.readFileSync(file).toString());
        }
        catch (err) {
        }
        return defaultSettings;
    }

    return merge(defaultSettings, settings);
}

function updateSettings(filename: string, settings: SpellSettings): void {
    fs.writeFileSync(filename, JSON.stringify(settings));
}

