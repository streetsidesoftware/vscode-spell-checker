import { URI as Uri, Utils as UriUtils } from 'vscode-uri';
import { ConfigTargetCSpell, ConfigTargetDictionary } from '../server';
import { getPathToTemp, mustBeDefined, readFile, writeFile } from '../test/helpers';
import { readConfigFile } from './configFileReadWrite';
import { addWordsFn, removeWordsFn, DictionaryTarget } from './DictionaryTarget';
import { configTargetToDictionaryTarget } from './DictionaryTargetHelper';
import { createConfigFileInFolder } from './settings';
import { __testing__ as DictionaryHelperTesting } from './DictionaryHelper';

describe('Validate DictionaryTarget', () => {
    test.each`
        current       | toAdd              | expected
        ${[]}         | ${[]}              | ${[]}
        ${[]}         | ${['a']}           | ${['a']}
        ${['b', 'a']} | ${['a']}           | ${['a', 'b']}
        ${['c', 'b']} | ${['a', 'd', 'c']} | ${['a', 'b', 'c', 'd']}
    `('addWordsFn $toAdd', ({ toAdd, current, expected }) => {
        const fn = addWordsFn(toAdd);
        expect(fn(current)).toEqual(expected);
    });

    test.each`
        current            | toAdd         | expected
        ${[]}              | ${[]}         | ${[]}
        ${[]}              | ${['a']}      | ${[]}
        ${['b', 'a']}      | ${['a']}      | ${['b']}
        ${['c', 'b']}      | ${['a']}      | ${['b', 'c']}
        ${['c', 'd', 'b']} | ${['d', 'a']} | ${['b', 'c']}
    `('removeWordsFn $toAdd', ({ toAdd, current, expected }) => {
        const fn = removeWordsFn(toAdd);
        expect(fn(current)).toEqual(expected);
    });

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
    const cfgUri = mustBeDefined(await createConfigFileInFolder(tempDir, true));
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
    const dictUri = await DictionaryHelperTesting.createCustomDictionaryFile(tempDir, undefined, true);
    const cfgTarget = configTargetDict(dictUri);
    const target = configTargetToDictionaryTarget(cfgTarget);
    return {
        target,
        reader: () => readDictionaryFile(dictUri),
    };
}

function configTargetCSpell(configUri: Uri): ConfigTargetCSpell {
    return {
        name: 'cspell.json',
        kind: 'cspell',
        scope: 'unknown',
        sortKey: 0,
        configUri: configUri.toString(),
        has: { words: true, ignoreWords: undefined },
    };
}

function configTargetDict(dirUri: Uri): ConfigTargetDictionary {
    return {
        name: 'custom-words',
        kind: 'dictionary',
        dictionaryUri: dirUri.toString(),
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
