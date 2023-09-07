import type { ConfigurationTarget, Uri } from 'vscode';

import type { CSpellUserSettings } from '../../client';
import type { ConfigFileReaderWriter } from '../configFileReadWrite';
import type { ConfigReaderWriter, ConfigUpdateFn } from '../configReaderWriter';
import { extractKeys } from '../configReaderWriter';
import { configurationTargetToDictionaryScope } from '../targetAndScope';
import type { GetConfigurationScope } from '../vsConfig';
import type { VSConfigReaderWriter } from '../vsConfigReaderWriter';

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
