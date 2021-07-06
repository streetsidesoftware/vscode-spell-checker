import { fsRemove, getPathToTemp, writeJson } from '../test/helpers';
import { readConfigFile, updateConfigFile, __testing__ } from './configFileReadWrite';

const samplePackageJson = {
    name: 'sample-package',
    scripts: {},
    dependencies: {},
};

const sampleCSpell = {
    words: ['sample', 'one', 'two'],
};

describe('Validate configFileReadWrite', () => {
    beforeAll(() => fsRemove(getPathToTemp('.')));

    test('json', async () => {
        await fsRemove(getPathToTemp('json'));
        const uri = getPathToTemp('json/cspell.json');
        await expect(readConfigFile(uri)).resolves.toBe(undefined);
        await expect(readConfigFile(uri, sampleCSpell)).resolves.toBe(sampleCSpell);
        await expect(readConfigFile(uri)).resolves.toBe(undefined);

        await updateConfigFile(uri, (c) => Object.assign(c, sampleCSpell));
        const r = await readConfigFile(uri);
        expect(r).not.toEqual(sampleCSpell);
        expect(r?.words).toEqual(sampleCSpell.words);
        expect(r?.version).toEqual(__testing__.settingsFileTemplate.version);
    });

    test('jsonc', async () => {
        await fsRemove(getPathToTemp('jsonc'));
        const uri = getPathToTemp('jsonc/cspell.jsonc');
        await expect(readConfigFile(uri)).resolves.toBe(undefined);
        await expect(readConfigFile(uri, sampleCSpell)).resolves.toBe(sampleCSpell);
        await expect(readConfigFile(uri)).resolves.toBe(undefined);

        await updateConfigFile(uri, (c) => Object.assign(c, sampleCSpell));
        const r = await readConfigFile(uri);
        expect(r).not.toEqual(sampleCSpell);
        expect(r?.words).toEqual(sampleCSpell.words);
        expect(r?.version).toEqual(__testing__.settingsFileTemplate.version);
    });

    test('yaml', async () => {
        await fsRemove(getPathToTemp('yaml'));
        const uri = getPathToTemp('yaml/cspell.yaml');
        await expect(readConfigFile(uri)).resolves.toBe(undefined);
        await expect(readConfigFile(uri, sampleCSpell)).resolves.toBe(sampleCSpell);
        await expect(readConfigFile(uri)).resolves.toBe(undefined);

        await updateConfigFile(uri, (c) => Object.assign(c, sampleCSpell));
        const r = await readConfigFile(uri);
        expect(r).not.toEqual(sampleCSpell);
        expect(r?.words).toEqual(sampleCSpell.words);
        expect(r?.version).toEqual(__testing__.settingsFileTemplate.version);
    });

    test('package', async () => {
        await fsRemove(getPathToTemp('package'));
        const uri = getPathToTemp('package/package.json');
        await writeJson(uri, samplePackageJson);
        await expect(readConfigFile(uri)).resolves.toBe(undefined);
        await expect(readConfigFile(uri, sampleCSpell)).resolves.toBe(sampleCSpell);
        await expect(readConfigFile(uri)).resolves.toBe(undefined);

        await updateConfigFile(uri, (c) => Object.assign(c, sampleCSpell));
        const r = await readConfigFile(uri);
        expect(r).not.toEqual(sampleCSpell);
        expect(r?.words).toEqual(sampleCSpell.words);
        expect(r?.version).toEqual(__testing__.settingsFileTemplate.version);
    });
});
