import type { URI as Uri } from 'vscode-uri';
import { Utils as UriUtils } from 'vscode-uri';

import { getPathToTemp, mustBeDefined, readFile, writeFile } from '../test/helpers';
import type { ClientConfigTargetCSpell, ClientConfigTargetDictionary } from './clientConfigTarget';
import { readConfigFile } from './configFileReadWrite';
import { __testing__ as DictionaryHelperTesting } from './DictionaryHelper';
import type { DictionaryTarget } from './DictionaryTarget';
import { configTargetToDictionaryTarget } from './DictionaryTargetHelper';
import { vscodeFs } from './fs';
import { replaceDocText } from './replaceDocText';
import { createConfigFile } from './settings';

jest.mock('./replaceDocText');

const mock_replaceDocText = jest.mocked(replaceDocText);

mock_replaceDocText.mockImplementation(async (doc, text) => {
    await vscodeFs.writeFile(doc.uri, text);
    return true;
});

describe('Validate DictionaryTarget', () => {
    interface TestUpdating {
        createFn: (tempDir: Uri) => Promise<TargetAndReader>;
    }

    test.each`
        createFn                 | name
        ${makeTestConfigTarget}  | ${'cspell.json'}
        ${makeTestPackageTarget} | ${'package.json'}
        ${makeDictionaryTarget}  | ${'dictionary'}
    `('Updating target $name', async ({ createFn }: TestUpdating) => {
        const tempDir = getPathToTemp();
        const { target: dictionaryTarget, reader: fetchWords } = await createFn(tempDir);
        await dictionaryTarget.addWords(['hello', 'a', 'B']);
        expect(await fetchWords()).toEqual(['a', 'B', 'hello']);
        await dictionaryTarget.addWords(['there', 'Z']);
        expect(await fetchWords()).toEqual(['a', 'B', 'hello', 'there', 'Z']);
        await dictionaryTarget.removeWords(['hello', 'a', 'code']);
        expect(await fetchWords()).toEqual(['B', 'there', 'Z']);
    });
});

type WordsReader = () => Promise<string[] | undefined>;

interface TargetAndReader {
    target: DictionaryTarget;
    reader: WordsReader;
}

async function fetchWords(cfgUri: Uri): Promise<string[] | undefined> {
    const cfg = await readConfigFile(cfgUri);
    return cfg?.words;
}

async function makeTestConfigTarget(tempDir: Uri): Promise<TargetAndReader> {
    const uri = UriUtils.joinPath(tempDir, 'cspell.json');
    const cfgUri = mustBeDefined(await createConfigFile(uri, true));
    const target = configTargetToDictionaryTarget(configTargetCSpell(cfgUri));
    return {
        target,
        reader: () => fetchWords(cfgUri),
    };
}

async function makeTestPackageTarget(tempDir: Uri): Promise<TargetAndReader> {
    const cfgUri = mustBeDefined(await createPackageJson(tempDir));
    const target = configTargetToDictionaryTarget(configTargetCSpell(cfgUri));
    return {
        target,
        reader: () => fetchWords(cfgUri),
    };
}

async function makeDictionaryTarget(tempDir: Uri): Promise<TargetAndReader> {
    const dictUri = UriUtils.joinPath(tempDir, '.cspell/custom-dictionary.txt');
    await DictionaryHelperTesting.createCustomDictionaryFile(dictUri, true);
    const cfgTarget = configTargetDict(dictUri);
    const target = configTargetToDictionaryTarget(cfgTarget);
    return {
        target,
        reader: () => readDictionaryFile(dictUri),
    };
}

function configTargetCSpell(configUri: Uri): ClientConfigTargetCSpell {
    return {
        name: 'cspell.json',
        kind: 'cspell',
        scope: 'unknown',
        configUri: configUri,
    };
}

function configTargetDict(dirUri: Uri): ClientConfigTargetDictionary {
    return {
        name: 'custom-words',
        kind: 'dictionary',
        dictionaryUri: dirUri,
        scope: 'unknown',
    };
}

async function createPackageJson(dir: Uri): Promise<Uri> {
    const samplePackageJson = {
        name: 'sample-package',
        scripts: {},
        // cspell: {},
        dependencies: {},
    };
    const packageUri = UriUtils.joinPath(dir, 'package.json');

    await writeFile(packageUri, JSON.stringify(samplePackageJson, undefined, 2).concat('\n'));

    return packageUri;
}

async function readDictionaryFile(uri: Uri): Promise<string[]> {
    const s = await readFile(uri);
    return s
        .split(/\r?\n/g)
        .map((w) => w.replace(/#.*/, ''))
        .map((w) => w.trim())
        .filter((a) => !!a);
}
