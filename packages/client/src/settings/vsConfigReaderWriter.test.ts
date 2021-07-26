import { CSpellUserSettings } from '@cspell/cspell-types';
import { mocked } from 'ts-jest/utils';
import { ConfigurationTarget, Uri } from 'vscode';
import { calculateConfigForTarget, updateConfig } from './vsConfig';
import { createVSConfigReaderWriter } from './vsConfigReaderWriter';

jest.mock('./vsConfig');

const mockedUpdateConfig = mocked(updateConfig);
const mockedCalculateConfigForTarget = mocked(calculateConfigForTarget);

describe('vsConfigReaderWriter', () => {
    test('createVSConfigReaderWriter', () => {
        const rw = createVSConfigReaderWriter(ConfigurationTarget.Workspace, Uri.file(__filename));
        expect(rw.name).toBe('workspace');
    });

    test('createVSConfigReaderWriter.read', async () => {
        mockedCalculateConfigForTarget.mockImplementation(() => ({ words: ['one'] }));

        const rw = createVSConfigReaderWriter(ConfigurationTarget.Workspace, Uri.file(__filename));

        const keys = ['words', 'dictionaries'] as const;
        const r = await rw.read(keys);
        expect(r).toEqual({ words: ['one'] });
        expect(mockedCalculateConfigForTarget).lastCalledWith(rw.target, rw.scope, keys);
    });

    test('createVSConfigReaderWriter.update', async () => {
        const cfgData = {};
        mockedUpdateConfig.mockImplementation(async (_t, _s, keys, fn) => {
            Object.assign(cfgData, fn(cfgData));
        });
        const rw = createVSConfigReaderWriter(ConfigurationTarget.Workspace, Uri.file(__filename));

        const fn = (cfg: CSpellUserSettings) => ({ words: ['two'].concat(cfg.words || []) });
        const keys = ['words', 'dictionaries'] as const;
        await rw.update(fn, keys);
        expect(mockedUpdateConfig).lastCalledWith(rw.target, rw.scope, keys, fn);
        expect(cfgData).toEqual({ words: ['two'] });
    });

    test('createVSConfigReaderWriter.write', async () => {
        const cfgData = {};
        mockedUpdateConfig.mockImplementation(async (_t, _s, keys, fn) => {
            Object.assign(cfgData, fn(cfgData));
        });

        const rw = createVSConfigReaderWriter(ConfigurationTarget.Workspace, Uri.file(__filename));

        const data = { words: ['word'] };
        await rw.write(data);
        expect(cfgData).toEqual(data);
    });
});
