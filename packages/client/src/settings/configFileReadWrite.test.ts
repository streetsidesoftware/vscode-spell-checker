import { fsRemove, getPathToTemp, getUriToSample } from '../test/helpers';
import { readConfigFile, updateConfigFile, __testing__ } from './configFileReadWrite';

const samplePackageJson = {
    name: 'Sample Package',
    scripts: {},
    dependencies: {},
};

const samplePackageJsonWithCSpell = {
    ...samplePackageJson,
    cspell: {},
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
});
