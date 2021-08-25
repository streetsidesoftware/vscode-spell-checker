import { ConfigReaderWriter, ConfigUpdateFn } from './configReaderWriter';
import { ConfigurationTarget } from 'vscode';
import { calculateConfigForTarget, GetConfigurationScope, updateConfig } from './vsConfig';
import { CSpellUserSettings } from '../client';
import { configurationTargetToDictionaryScope } from './targetAndScope';

export interface VSConfigReaderWriter extends ConfigReaderWriter {
    readonly name: string;
    readonly target: ConfigurationTarget;
    readonly scope: GetConfigurationScope;
}

export function createVSConfigReaderWriter(
    target: ConfigurationTarget,
    scope: GetConfigurationScope,
    useMerge: boolean
): VSConfigReaderWriter {
    return new _VSConfigReaderWriter(target, scope, useMerge);
}

class _VSConfigReaderWriter implements VSConfigReaderWriter {
    readonly name: string;
    constructor(readonly target: ConfigurationTarget, readonly scope: GetConfigurationScope, readonly useMerge: boolean) {
        this.name = configurationTargetToDictionaryScope(target);
    }

    async read<K extends keyof CSpellUserSettings>(keys: K[]) {
        return calculateConfigForTarget(this.target, this.scope, keys, this.useMerge);
    }

    async write(data: CSpellUserSettings) {
        await updateConfig(this.target, this.scope, [], () => data, false);
    }

    async update<K extends keyof CSpellUserSettings>(fn: ConfigUpdateFn, keys: K[]): Promise<void> {
        await updateConfig(this.target, this.scope, keys, fn, this.useMerge);
    }
}
