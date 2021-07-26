import { ConfigurationTarget, Uri } from 'vscode';
import { CSpellUserSettings } from '../server';
import { getPathToTemp } from '../test/helpers';
import { ConfigFileReaderWriter } from './configFileReadWrite';
import { ConfigReaderWriter, ConfigUpdateFn, extractKeys } from './configReaderWriter';
import { createCSpellConfigRepository, createVSCodeConfigRepository } from './configRepository';
import { addWordsFn } from './configUpdaters';
import { configurationTargetToDictionaryScope } from './targetAndScope';
import { GetConfigurationScope } from './vsConfig';
import { VSConfigReaderWriter } from './vsConfigReaderWriter';

describe('configRepository', () => {
    test('CSpellConfigRepository', async () => {
        const uri = getPathToTemp('cspell.json');
        const rep = createCSpellConfigRepository(uri);
        const rw = rep.configRW;

        await rep.setValue('words', ['one', 'two', 'three']);
        const data1 = await rw.read(['words']);
        expect(data1.words).toEqual(['one', 'two', 'three']);
        await rep.updateValue('words', addWordsFn(['four']));
        const data2 = await rw.read(['words']);
        expect(data2.words).toEqual(['one', 'two', 'three', 'four'].sort());
    });

    test('CSpellConfigRepository Memory', async () => {
        const uri = getPathToTemp('cspell.json');
        const rw = new MemoryConfigFileReaderWriter(uri, {});
        const rep = createCSpellConfigRepository(rw);

        await rep.setValue('words', ['one', 'two', 'three']);
        const data1 = await rw.read(['words']);
        expect(data1.words).toEqual(['one', 'two', 'three']);
        await rep.updateValue('words', addWordsFn(['four']));
        const data2 = await rw.read(['words']);
        expect(data2.words).toEqual(['one', 'two', 'three', 'four'].sort());
    });

    test('VSCodeConfigRepository Memory', async () => {
        const rw = new MemoryConfigVSReaderWriter(ConfigurationTarget.Workspace, Uri.file(__filename), {});
        const rep = createVSCodeConfigRepository(rw);

        expect(rep.name).toBe('workspace');

        await rep.setValue('words', ['one', 'two', 'three']);
        const data1 = await rw.read(['words']);
        expect(data1.words).toEqual(['one', 'two', 'three']);
        await rep.updateValue('words', addWordsFn(['four']));
        const data2 = await rw.read(['words']);
        expect(data2.words).toEqual(['one', 'two', 'three', 'four'].sort());
    });

    test('VSCodeConfigRepository Memory Global userWords', async () => {
        const rw = new MemoryConfigVSReaderWriter(ConfigurationTarget.Global, Uri.file(__filename), {
            words: ['hmmm'],
            userWords: ['user'],
        });
        const rep = createVSCodeConfigRepository(rw);

        expect(rep.name).toBe('user');

        await rep.updateValue('words', addWordsFn(['four']));
        const data0 = await rw.read(['words', 'userWords']);
        expect(data0.userWords).toEqual(['four', 'hmmm', 'user']);
        expect(data0.words).toBeUndefined();

        await rep.setValue('words', ['one', 'two', 'three']);
        const data1 = await rw.read(['words', 'userWords']);
        expect(data1.userWords).toEqual(['one', 'two', 'three']);
        expect(data1.words).toBeUndefined();
        await rep.updateValue('words', addWordsFn(['four']));
        const data2 = await rw.read(['words', 'userWords']);
        expect(data2.userWords).toEqual(['one', 'two', 'three', 'four'].sort());
        expect(data2.words).toBeUndefined();
    });
});

class MemoryReaderWriter implements ConfigReaderWriter {
    private _data: CSpellUserSettings;

    constructor(data: CSpellUserSettings) {
        this._data = data;
    }

    get data() {
        return this._data;
    }

    async read<K extends keyof CSpellUserSettings>(keys: K[]) {
        return extractKeys(this.data, keys);
    }

    async _read() {
        return this.data;
    }

    async write(data: CSpellUserSettings) {
        this._data = data;
    }

    update<K extends keyof CSpellUserSettings>(fn: ConfigUpdateFn, keys: K[]): Promise<void> {
        return this._update((cfg) => fn(extractKeys(cfg, keys)));
    }

    async _update(fn: ConfigUpdateFn) {
        Object.assign(this._data, fn(this._data));
    }
}

class MemoryConfigFileReaderWriter extends MemoryReaderWriter implements ConfigFileReaderWriter {
    constructor(readonly uri: Uri, data: CSpellUserSettings) {
        super(data);
    }
}

class MemoryConfigVSReaderWriter extends MemoryReaderWriter implements VSConfigReaderWriter {
    readonly name: string;

    constructor(readonly target: ConfigurationTarget, readonly scope: GetConfigurationScope, data: CSpellUserSettings) {
        super(data);
        this.name = configurationTargetToDictionaryScope(this.target);
    }
}
