import { Uri } from 'vscode';
import { CSpellUserSettings } from '../client';
import { fsRemove, getPathToTemp, getUriToSample, mkdirp, oc, readFile, writeFile } from '../test/helpers';
import { unique } from '../util';
import * as CSS from './CSpellSettings';
import { readSettings, writeSettings } from './CSpellSettings';
import { createDictionaryTargetForFile } from './DictionaryTarget';

describe('Validate CSpellSettings functions', () => {
    const filenameSampleCSpellFile = getUriToSample('cSpell.json');

    beforeAll(() => {
        return fsRemove(getPathToTemp('.'));
    });

    test('tests reading a settings file', async () => {
        const settings = await readSettings(filenameSampleCSpellFile);
        expect(Object.keys(settings)).not.toHaveLength(0);
        expect(settings.enabled).toBeUndefined();
        expect(settings.enabledLanguageIds).toBeUndefined();
    });

    test('reading a settings file that does not exist results in default', async () => {
        const pSettings = CSS.readSettings(getUriToSample('not_found/cspell.json'));
        await expect(pSettings).resolves.toBe(CSS.getDefaultSettings());
    });

    test('tests writing a file', async () => {
        const filename = getPathToTemp('dir1/tempCSpell.json');
        const settings = await readSettings(filenameSampleCSpellFile);
        settings.enabled = false;
        await writeSettings(filename, settings);
        const writtenSettings = await readSettings(filename);
        expect(writtenSettings).toEqual(settings);
    });

    test('tests writing an unsupported file format', async () => {
        const filename = getPathToTemp('tempCSpell.js');
        await writeFile(filename, sampleJSConfig);
        const r = CSS.readSettingsFileAndApplyUpdate(filename, (s) => s);
        await expect(r).rejects.toBeInstanceOf(CSS.FailedToUpdateConfigFile);
    });

    test('addIgnoreWordsToSettingsAndUpdate', async () => {
        const word = 'word';
        const filename = getPathToTemp('addIgnoreWordsToSettingsAndUpdate/cspell.json');
        await writeFile(filename, sampleJsonConfig);
        await CSS.addIgnoreWordsToSettingsAndUpdate(filename, word);
        const r = await CSS.readSettings(filename);
        expect(r.ignoreWords).toEqual(expect.arrayContaining([word]));
        expect(await readSettings(filename)).toEqual(r);
    });

    test('Validate default settings', () => {
        const defaultSetting = CSS.getDefaultSettings();
        expect(defaultSetting.words).toBeUndefined();
        expect(defaultSetting.version).toBe('0.2');
    });

    test('tests adding languageIds', () => {
        const ids = ['cpp', 'cs', 'php', 'json', 'cs'];
        const defaultSettings = CSS.getDefaultSettings();
        Object.freeze(defaultSettings);
        expect(defaultSettings.enabledLanguageIds).toBeUndefined();
        const s1 = CSS.addLanguageIdsToSettings(defaultSettings, ids, true);
        expect(s1.enabledLanguageIds).toBeUndefined();
        const s2 = CSS.addLanguageIdsToSettings(defaultSettings, ids, false);
        expect(s2.enabledLanguageIds).not.toHaveLength(0);
        expect(s2.enabledLanguageIds!.sort()).toEqual(unique(ids).sort());
    });

    test('tests removing languageIds', () => {
        const ids = ['cpp', 'cs', 'php', 'json', 'cs'];
        const toRemove = ['cs', 'php', 'php'];
        const expected = ['cpp', 'json'];
        const defaultSettings = CSS.getDefaultSettings();
        expect(defaultSettings.enabledLanguageIds).toBeUndefined();
        const s2 = CSS.addLanguageIdsToSettings(defaultSettings, ids, false);
        Object.freeze(s2);
        expect(s2.enabledLanguageIds).not.toHaveLength(0);
        expect(s2.enabledLanguageIds!.sort()).toEqual(unique(ids).sort());
        const s3 = CSS.removeLanguageIdsFromSettings(s2, toRemove);
        expect(s3.enabledLanguageIds).not.toHaveLength(0);
        expect(s3.enabledLanguageIds!.sort()).toEqual(expected);
        const s4 = CSS.removeLanguageIdsFromSettings(defaultSettings, toRemove);
        expect(s4.enabledLanguageIds).toBeUndefined();
        const s5 = CSS.removeLanguageIdsFromSettings(s2, ids);
        expect(s5.enabledLanguageIds).toBeUndefined();
    });

    test('tests removing words from the settings', () => {
        const defaultSettings = CSS.getDefaultSettings();
        const settings: CSpellUserSettings = { ...defaultSettings, words: ['apple', 'banana', 'orange', 'blue', 'green', 'red', 'Yellow'] };
        Object.freeze(settings);
        const result = CSS.removeWordsFromSettings(settings, ['BLUE', 'pink', 'yellow']);
        expect(result.words).toEqual(['apple', 'banana', 'orange', 'green', 'red']);
    });

    test.each`
        uri                               | expected
        ${''}                             | ${false}
        ${'file:///x/cspell.yml'}         | ${true}
        ${'file:///x/cspell.config.js'}   | ${false}
        ${'file:///x/cspell.config.cjs'}  | ${false}
        ${'file:///x/cspell.json'}        | ${true}
        ${'file:///x/package.json'}       | ${true}
        ${'file:///x/cspell.json?q=a'}    | ${true}
        ${'file:///x/cspell.jsonc?q=a#f'} | ${true}
        ${'file:///x/cspell.jsonc#f'}     | ${true}
    `('isSupportedConfigFileFormat $uri', ({ uri, expected }: { uri: string; expected: boolean }) => {
        const uriCfg = Uri.parse(uri);
        expect(CSS.isUpdateSupportedForConfigFileFormat(uriCfg)).toBe(expected);
    });

    test('addWordsToCustomDictionary', async () => {
        const dict = {
            name: 'custom dictionary',
            uri: getPathToTemp('addWordsToCustomDictionary/dict.txt'),
        };
        await fsRemove(dict.uri);
        const words1 = ['one', 'two', 'three'];
        const words2 = ['alpha', 'beta', 'delta', 'zeta', 'one'];
        const expected = [...['alpha', 'beta', 'delta', 'zeta', 'one', 'two', 'three'].sort(), ''].join('\n');
        const dictTarget = createDictionaryTargetForFile(dict.uri, dict.name);
        await expect(dictTarget.addWords(words1)).resolves.toBeUndefined();
        expect(readFile(dict.uri)).resolves.toBe([...words1].sort().join('\n') + '\n');
        await expect(dictTarget.addWords(words2)).resolves.toBeUndefined();
        expect(readFile(dict.uri)).resolves.toBe(expected);
    });

    test.each`
        file              | name       | error
        ${''}             | ${'dict'}  | ${e(sm(/Failed to add words to dictionary "dict".*, unsupported format./))}
        ${'words.txt.gz'} | ${'words'} | ${e(sm(/"words".*unsupported format:.*words.txt.gz/))}
        ${'cspell.json'}  | ${'json'}  | ${e(sm(/"json".*unsupported format:.*cspell.json/))}
    `('addWordsToCustomDictionary_failures "$name" $file', async ({ file, name, error }) => {
        const pathUri = getPathToTemp('addWordsToCustomDictionary_failures');
        await mkdirp(pathUri);
        const dict = { name, uri: Uri.joinPath(pathUri, file) };
        const words = ['one', 'two', 'three'];
        const dictTarget = createDictionaryTargetForFile(dict.uri, dict.name);
        await expect(dictTarget.addWords(words)).rejects.toEqual(error);
    });

    test.each`
        file           | name              | error
        ${'words.txt'} | ${'custom-words'} | ${e(sm(/Failed to add words to dictionary "custom-words".*EISDIR/))}
    `('addWordsToCustomDictionary_cannot_write "$name" $file', async ({ file, name, error }) => {
        const pathUri = getPathToTemp('addWordsToCustomDictionary_cannot_write');
        const dict = { name, uri: Uri.joinPath(pathUri, file) };
        // Make the file into a directory to force the error.
        await mkdirp(dict.uri);
        const words = ['one', 'two', 'three'];
        const dictTarget = createDictionaryTargetForFile(dict.uri, dict.name);
        await expect(dictTarget.addWords(words)).rejects.toEqual(error);
    });
});

function sm(...args: Parameters<typeof expect.stringMatching>) {
    return expect.stringMatching(...args);
}

function e(message: string) {
    return oc({
        message,
    });
}

const sampleJSConfig = `
module.exports = {
    version: "0.2",
    words: [],
}
`;

const sampleConfig: CSpellUserSettings = {
    version: '0.2',
    description: 'Sample Test Config',
    import: [],
};

const sampleJsonConfig = JSON.stringify(sampleConfig, undefined, 2);
