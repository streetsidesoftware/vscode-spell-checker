import { uriToName } from 'common-utils/uriHelper.js';
import { pick } from 'common-utils/util.js';
import type { Uri } from 'vscode';
import { ConfigurationTarget } from 'vscode';
import { CSpellUserSettings, CustomDictionaryScope } from '../server';
import { ConfigKeysByField } from './configFields';
import { ConfigFileReaderWriter, createConfigFileReaderWriter } from './configFileReadWrite';
import { ConfigUpdater, configUpdaterForKey } from './configUpdater';
import { configurationTargetToDictionaryScope } from './targetAndScope';
import { GetConfigurationScope, updateConfig } from './vsConfig';
import { createVSConfigReaderWriter, VSConfigReaderWriter } from './vsConfigReaderWriter';

export type ConfigKeys = keyof CSpellUserSettings;

export type ConfigRepositoryKind = 'cspell' | 'vscode';

/** Interface for a location where CSpell configuration is stored */
export interface ConfigRepository {
    readonly name: string;
    readonly kind: ConfigRepositoryKind;
    readonly defaultDictionaryScope: CustomDictionaryScope | undefined;
    /**
     * @param updateFn - a function that will return the updated config fields
     * @param neededKeys - a list of fields needed by `updateFn`.
     *   This is needed to retrieve config from VS Code.
     */
    readonly update: <K extends ConfigKeys>(updater: ConfigUpdater<K>) => Promise<void>;
    readonly setValue: <K extends ConfigKeys>(key: K, value: CSpellUserSettings[K]) => Promise<void>;
    readonly updateValue: <K extends ConfigKeys>(key: K, value: CSpellUserSettings[K] | UpdateConfigFieldFn<K>) => Promise<void>;
}

/**
 * Configuration Update function that returns only the fields that need to be updated.
 */
export type ConfigUpdateFn = (cfg: Partial<CSpellUserSettings>) => Partial<CSpellUserSettings>;

export type UpdateConfigFieldFn<K extends keyof CSpellUserSettings> = (value: CSpellUserSettings[K]) => CSpellUserSettings[K];

export abstract class ConfigRepositoryBase implements ConfigRepository {
    abstract readonly name: string;
    abstract readonly kind: ConfigRepositoryKind;
    abstract readonly defaultDictionaryScope: CustomDictionaryScope | undefined;

    abstract update<K extends ConfigKeys>(updater: ConfigUpdater<K>): Promise<void>;

    setValue<K extends ConfigKeys>(key: K, value: CSpellUserSettings[K]): Promise<void> {
        return this.update(configUpdaterForKey(key, value));
    }

    updateValue<K extends ConfigKeys>(key: K, value: CSpellUserSettings[K] | UpdateConfigFieldFn<K>): Promise<void> {
        return this.update(configUpdaterForKey(key, value));
    }
}

export function createCSpellConfigRepository(src: Uri | ConfigFileReaderWriter, name?: string): CSpellConfigRepository {
    const rw = isReaderWriter(src) ? src : createConfigFileReaderWriter(src);
    return new CSpellConfigRepository(rw, name);
}

export function createVSCodeConfigRepository(target: ConfigurationTarget, scope: GetConfigurationScope): VSCodeRepository;
export function createVSCodeConfigRepository(src: VSConfigReaderWriter): VSCodeRepository;
export function createVSCodeConfigRepository(
    src: ConfigurationTarget | VSConfigReaderWriter,
    scope?: GetConfigurationScope
): VSCodeRepository {
    const rw = isVSReaderWriter(src) ? src : createVSConfigReaderWriter(src, scope);
    return new VSCodeRepository(rw);
}

function isVSReaderWriter(src: ConfigurationTarget | VSConfigReaderWriter): src is VSConfigReaderWriter {
    return typeof src === 'object' && !!src.read && !!src.write;
}

function isReaderWriter(src: Uri | ConfigFileReaderWriter): src is ConfigFileReaderWriter {
    const rw = <ConfigFileReaderWriter>src;
    return !!rw.update && !!rw.uri;
}

export class CSpellConfigRepository extends ConfigRepositoryBase {
    readonly name: string;
    readonly kind: ConfigRepositoryKind;
    readonly defaultDictionaryScope: undefined;
    readonly configFileUri: Uri;

    constructor(readonly configRW: ConfigFileReaderWriter, name?: string | undefined) {
        super();
        this.name = name || uriToName(configRW.uri);
        this.kind = 'cspell';
        this.configFileUri = configRW.uri;
    }

    update<K extends ConfigKeys>(updater: ConfigUpdater<K>): Promise<void> {
        return this.configRW.update(fnUpdateFilterKeys(updater), updater.keys);
    }
}

export class VSCodeRepository extends ConfigRepositoryBase {
    readonly name: string;
    readonly kind: ConfigRepositoryKind;
    readonly defaultDictionaryScope: CustomDictionaryScope;

    constructor(readonly rw: VSConfigReaderWriter) {
        super();
        this.name = rw.name;
        this.defaultDictionaryScope = configurationTargetToDictionaryScope(rw.target);
        this.kind = 'vscode';
    }

    get target(): ConfigurationTarget {
        return this.rw.target;
    }

    get scope(): GetConfigurationScope {
        return this.rw.scope;
    }

    update<K extends ConfigKeys>(updater: ConfigUpdater<K>): Promise<void> {
        const { fn, keys } = this.mappers(updater.keys, updater.updateFn);
        return this.rw.update(fn, keys);
    }

    /**
     * Remap `words` to `userWords` if necessary
     * @param neededKeys - keys needed for update
     * @param fn - update function
     * @returns A new set of keys and update function
     */
    private mappers(
        neededKeys: readonly ConfigKeys[],
        fn: ConfigUpdateFn
    ): {
        fn: ConfigUpdateFn;
        keys: readonly ConfigKeys[];
    } {
        if (this.target !== ConfigurationTarget.Global) return { fn, keys: neededKeys };

        const keys = new Set(neededKeys);
        if (keys.has(ConfigKeysByField.words)) {
            keys.add(ConfigKeysByField.userWords);
        }

        function userWordsToWords(cfg: CSpellUserSettings): CSpellUserSettings {
            const { userWords, words, ...rest } = cfg;
            const c: CSpellUserSettings = { ...rest };
            if (keys.has(ConfigKeysByField.userWords) || userWords || words) {
                c.words = userWords?.concat(words ?? []) ?? words;
            }
            return c;
        }

        function wordsToUserWords(cfg: CSpellUserSettings): CSpellUserSettings {
            const { words, userWords, ...cfgResult } = cfg;
            const r: CSpellUserSettings = { ...cfgResult };
            if (Object.keys(cfg).includes(ConfigKeysByField.words)) {
                r.words = undefined;
                r.userWords = words?.concat(userWords || []);
            }
            return r;
        }

        // Remap userWords => words => userWords
        const updateFn: ConfigUpdateFn = (cfg) => wordsToUserWords(fn(userWordsToWords(cfg)));

        return {
            fn: updateFn,
            keys: [...keys],
        };
    }
}

function fnUpdateFilterKeys<K extends ConfigKeys>(updater: ConfigUpdater<K>): ConfigUpdateFn {
    return (cfg) => updater.updateFn(pick(cfg, updater.keys));
}

export const __testing__ = {
    fnUpdateFilterKeys,
};
