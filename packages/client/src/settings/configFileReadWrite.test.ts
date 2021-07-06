import { fsRemove, getPathToTemp, writeFile, readFile } from '../test/helpers';
import { readConfigFile, updateConfigFile, writeConfigFile, __testing__ } from './configFileReadWrite';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { parse as parseJsonc, stringify as stringifyJsonc, assign } from 'comment-json';

const samplePackageJson = {
    name: 'sample-package',
    scripts: {},
    dependencies: {},
};

const sampleCSpell = {
    words: ['sample', 'one', 'two'],
};

describe('Validate configFileReadWrite', () => {
    test.each`
        filename                | testType   | initialContent
        ${'cspell.json'}        | ${'basic'} | ${undefined}
        ${'cspell.jsonc'}       | ${'basic'} | ${undefined}
        ${'cspell.config.yaml'} | ${'basic'} | ${undefined}
        ${'package.json'}       | ${'basic'} | ${toJson(samplePackageJson)}
    `('update $filename $testType', async ({ filename, initialContent }) => {
        await fsRemove(getPathToTemp());
        const uri = getPathToTemp(filename);
        if (initialContent) {
            await writeFile(uri, initialContent);
        }
        await expect(readConfigFile(uri)).resolves.toBe(undefined);
        await expect(readConfigFile(uri, sampleCSpell)).resolves.toBe(sampleCSpell);
        await expect(readConfigFile(uri)).resolves.toBe(undefined);

        await updateConfigFile(uri, () => sampleCSpell);
        const r = await readConfigFile(uri);
        expect(r).not.toEqual(sampleCSpell);
        expect(r?.words).toEqual(sampleCSpell.words);
        expect(r?.version).toEqual(__testing__.settingsFileTemplate.version);
    });

    test.each`
        filename                | testType   | initialContent
        ${'cspell.json'}        | ${'basic'} | ${undefined}
        ${'cspell.jsonc'}       | ${'basic'} | ${undefined}
        ${'cspell.config.yaml'} | ${'basic'} | ${undefined}
        ${'package.json'}       | ${'basic'} | ${toJson(samplePackageJson)}
    `('write $filename $testType', async ({ filename, initialContent }) => {
        await fsRemove(getPathToTemp());
        const uri = getPathToTemp(filename);
        if (initialContent) {
            await writeFile(uri, initialContent);
        }

        const sample = sampleJsoncObj();
        await writeConfigFile(uri, sample);
        const r = await readConfigFile(uri);
        expect(r).toEqual(sample);
    });

    test('jsonc with comments', async () => {
        await fsRemove(getPathToTemp());
        const uri = getPathToTemp('cspell.jsonc');
        await writeFile(uri, sampleJsonc());
        const sample = parseJsonc(sampleJsonc());
        await expect(readConfigFile(uri)).resolves.toEqual(sample);

        await updateConfigFile(uri, () => sampleCSpell);
        const r = await readConfigFile(uri);
        expect(r).not.toEqual(sampleCSpell);
        expect(r?.words).toEqual(sampleCSpell.words);
        expect(r?.version).toEqual(__testing__.settingsFileTemplate.version);

        const configFileContext = await readFile(uri);
        expect(configFileContext).toBe(toJson(assign(sampleJsoncObj(), sampleCSpell)));
    });

    test('yaml with comments', async () => {
        await fsRemove(getPathToTemp());
        const uri = getPathToTemp('cspell.yaml');
        await writeFile(uri, sampleYaml());
        const sample = parseYaml(sampleYaml());
        await expect(readConfigFile(uri)).resolves.toEqual(sample);

        await updateConfigFile(uri, () => ({}));
        const r = await readConfigFile(uri);
        expect(r).not.toEqual(sampleCSpell);
        expect(r?.words).toEqual(sampleCSpell.words);
        expect(r?.version).toEqual(__testing__.settingsFileTemplate.version);

        const configFileContext = await readFile(uri);
        // Note: comments are lost.
        expect(configFileContext).toBe(stringifyYaml(parseYaml(sampleYaml())));
    });
});

function toJson(obj: any): string {
    return stringifyJsonc(obj, null, 4) + '\n';
}

function sampleJsoncObj(): any {
    return parseJsonc(sampleJsonc());
}

function sampleJsonc(): string {
    return `
// This is a Json file with comments.
{
    // Version should be 0.2
    "version": "0.2",
    // Custom terms should be here.
    "words": [],
    // Words to be ignored
    "ignoreWords": []
}
`;
}

function sampleYaml(): string {
    return `
# First comment
version: "0.2" # Version should always be 0.2
ignorePaths: []
dictionaryDefinitions: []
dictionaries: []
words:
    - sample
    - one
    - two
ignoreWords: []
import: []
`;
}
