import { Uri } from 'vscode';
import { CSpellUserSettings } from '../server';
import { getPathToTemp } from '../test/helpers';
import { ConfigFileReaderWriter } from './configFileReadWrite';
import { ConfigReaderWriter, ConfigUpdateFn, extractKeys } from './configReaderWriter';
import { createCSpellConfigRepository } from './configRepository';
import { addWordsFn } from './configUpdaters';

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
        const rw = new MemoryConfigFileReaderWrite(uri, {});
        const rep = createCSpellConfigRepository(rw);

        await rep.setValue('words', ['one', 'two', 'three']);
        const data1 = await rw.read(['words']);
        expect(data1.words).toEqual(['one', 'two', 'three']);
        await rep.updateValue('words', addWordsFn(['four']));
        const data2 = await rw.read(['words']);
        expect(data2.words).toEqual(['one', 'two', 'three', 'four'].sort());
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

    async update(fn: ConfigUpdateFn) {
        Object.assign(this._data, fn(this._data));
    }
}

class MemoryConfigFileReaderWrite extends MemoryReaderWriter implements ConfigFileReaderWriter {
    constructor(readonly uri: Uri, data: CSpellUserSettings) {
        super(data);
    }
}
