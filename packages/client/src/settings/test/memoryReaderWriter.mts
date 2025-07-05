import type { ConfigurationTarget, Uri } from 'vscode';

import type { CSpellUserSettings } from '../../client/index.mjs';
import type { ConfigFileReaderWriter } from '../configFileReadWrite.mjs';
import type { ConfigReaderWriter, ConfigUpdateFn } from '../configReaderWriter.mjs';
import { extractKeys } from '../configReaderWriter.mjs';
import { configurationTargetToDictionaryScope } from '../targetAndScope.mjs';
import type { GetConfigurationScope } from '../vsConfig.mjs';
import type { VSConfigReaderWriter } from '../vsConfigReaderWriter.mjs';

class MemoryReaderWriter implements ConfigReaderWriter {
    private _data: CSpellUserSettings;

    constructor(data: CSpellUserSettings) {
        this._data = data;
    }

    get data() {
        return this._data;
    }

    async read<K extends keyof CSpellUserSettings>(keys: K[]) {
        await Promise.resolve(); // Ensure the function is async.
        return extractKeys(this.data, keys);
    }

    async _read() {
        await Promise.resolve(); // Ensure the function is async.
        return this.data;
    }

    async write(data: CSpellUserSettings) {
        this._data = data;
        await Promise.resolve(); // Ensure the function is async.
    }

    update<K extends keyof CSpellUserSettings>(fn: ConfigUpdateFn, keys: K[]): Promise<void> {
        return this._update((cfg) => fn(extractKeys(cfg, keys)));
    }

    async _update(fn: ConfigUpdateFn) {
        Object.assign(this._data, fn(this._data));
        await Promise.resolve(); // Ensure the function is async.
    }
}

export class MemoryConfigFileReaderWriter extends MemoryReaderWriter implements ConfigFileReaderWriter {
    constructor(
        readonly uri: Uri,
        data: CSpellUserSettings,
    ) {
        super(data);
    }
}

export class MemoryConfigVSReaderWriter extends MemoryReaderWriter implements VSConfigReaderWriter {
    readonly name: string;

    constructor(
        readonly target: ConfigurationTarget,
        readonly scope: GetConfigurationScope,
        data: CSpellUserSettings,
    ) {
        super(data);
        this.name = configurationTargetToDictionaryScope(this.target);
    }
}
