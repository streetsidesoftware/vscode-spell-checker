import type { CSpellUserSettings } from '@cspell/cspell-types';
import { describe, expect, test, vi } from 'vitest';
import { ConfigurationTarget, Uri } from 'vscode';

import { calculateConfigForTarget, updateConfig } from './vsConfig.mjs';
import { createVSConfigReaderWriter } from './vsConfigReaderWriter.mjs';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');
vi.mock('./vsConfig.mjs');

const mockedUpdateConfig = vi.mocked(updateConfig);
const mockedCalculateConfigForTarget = vi.mocked(calculateConfigForTarget);

describe('vsConfigReaderWriter', () => {
    test('createVSConfigReaderWriter', () => {
        const rw = createVSConfigReaderWriter(ConfigurationTarget.Workspace, Uri.parse(import.meta.url), false);
        expect(rw.name).toBe('workspace');
    });

    test.each`
        useMerge
        ${true}
        ${false}
    `('createVSConfigReaderWriter.read $useMerge', async ({ useMerge }) => {
        mockedCalculateConfigForTarget.mockImplementation(() => ({ words: ['one'] }));

        const rw = createVSConfigReaderWriter(ConfigurationTarget.Workspace, Uri.parse(import.meta.url), useMerge);

        const keys = ['words', 'dictionaries'] as const;
        const r = await rw.read(keys);
        expect(r).toEqual({ words: ['one'] });
        expect(mockedCalculateConfigForTarget).toHaveBeenLastCalledWith(rw.target, rw.scope, keys, useMerge);
    });

    test('createVSConfigReaderWriter.update', async () => {
        const cfgData = {};
        mockedUpdateConfig.mockImplementation(async (_t, _s, _keys, fn) => {
            Object.assign(cfgData, fn(cfgData));
        });
        const rw = createVSConfigReaderWriter(ConfigurationTarget.Workspace, Uri.parse(import.meta.url), false);

        const fn = (cfg: CSpellUserSettings) => ({ words: ['two'].concat(cfg.words || []) });
        const keys = ['words', 'dictionaries'] as const;
        await rw.update(fn, keys);
        expect(mockedUpdateConfig).toHaveBeenLastCalledWith(rw.target, rw.scope, keys, fn, false);
        expect(cfgData).toEqual({ words: ['two'] });
    });

    test('createVSConfigReaderWriter.write', async () => {
        const cfgData = {};
        mockedUpdateConfig.mockImplementation(async (_t, _s, _keys, fn) => {
            Object.assign(cfgData, fn(cfgData));
        });

        const rw = createVSConfigReaderWriter(ConfigurationTarget.Workspace, Uri.parse(import.meta.url), false);

        const data = { words: ['word'] };
        await rw.write(data);
        expect(cfgData).toEqual(data);
    });
});
