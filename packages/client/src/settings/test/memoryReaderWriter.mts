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

    get data(): CSpellUserSettings {
        return this._data;
    }

    async read<K extends keyof CSpellUserSettings>(keys: K[]): Promise<Pick<CSpellUserSettings, K>> {
        return extractKeys(this.data, keys);
    }

    async _read(): Promise<CSpellUserSettings> {
        return this.data;
    }

    async write(data: CSpellUserSettings): Promise<void> {
        this._data = data;
    }

    update<K extends keyof CSpellUserSettings>(fn: ConfigUpdateFn, keys: K[]): Promise<void> {
        return this._update((cfg) => fn(extractKeys(cfg, keys)));
    }

    async _update(fn: ConfigUpdateFn): Promise<void> {
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
