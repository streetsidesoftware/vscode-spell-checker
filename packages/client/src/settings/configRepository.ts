import { uriToName } from 'common-utils/uriHelper.js';
import { pick } from 'common-utils/util.js';
import { ConfigurationTarget, Uri, workspace, WorkspaceFolder } from 'vscode';
import { CSpellUserSettings, CustomDictionaryScope } from '../client';
import { ConfigFields } from './configFields';
import { ConfigFileReaderWriter, createConfigFileReaderWriter } from './configFileReadWrite';
import { ConfigUpdater, configUpdaterForKey } from './configUpdater';
import { configurationTargetToDictionaryScope } from './targetAndScope';
import { GetConfigurationScope } from './vsConfig';
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
    readonly getValue: <K extends ConfigKeys>(key: K) => Promise<Partial<CSpellUserSettings>>;
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
    abstract getValue<K extends ConfigKeys>(key: K): Promise<Partial<CSpellUserSettings>>;

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

export function createVSCodeConfigRepository(
    target: ConfigurationTarget,
    scope: GetConfigurationScope,
    useMerge: boolean
): VSCodeRepository;
export function createVSCodeConfigRepository(src: VSConfigReaderWriter): VSCodeRepository;
export function createVSCodeConfigRepository(
    src: ConfigurationTarget | VSConfigReaderWriter,
    scope?: GetConfigurationScope,
    useMerge?: boolean
): VSCodeRepository {
    const rw = isVSReaderWriter(src) ? src : createVSConfigReaderWriter(src, scope, !!useMerge);
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

    getValue<K extends ConfigKeys>(key: K): Promise<Partial<CSpellUserSettings>> {
        return this.configRW.read([key]);
    }

    update<K extends ConfigKeys>(updater: ConfigUpdater<K>): Promise<void> {
        return this.configRW.update(fnUpdateFilterKeys(updater), updater.keys);
    }

    static isCSpellConfigRepository(rep: ConfigRepository): rep is CSpellConfigRepository {
        return rep instanceof CSpellConfigRepository;
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

    getWorkspaceFolder(): WorkspaceFolder | undefined {
        if (this.defaultDictionaryScope === 'user') return undefined;
        if (this.defaultDictionaryScope === 'workspace') return workspace.workspaceFolders?.[0];
        const scope = this.scope;
        if (!scope) return undefined;
        if (isWorkspaceFolder(scope)) return scope;
        if (isUri(scope)) return workspace.getWorkspaceFolder(scope);
        if (hasUri(scope)) return workspace.getWorkspaceFolder(scope.uri);
        return workspace.workspaceFolders?.[0];
    }

    update<K extends ConfigKeys>(updater: ConfigUpdater<K>): Promise<void> {
        const { fn, keys } = this.mappers(updater.keys, updater.updateFn);
        return this.rw.update(fn, keys);
    }

    getValue<K extends ConfigKeys>(key: K): Promise<Partial<CSpellUserSettings>> {
        return this.rw.read([key]);
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
        if (keys.has(ConfigFields.words)) {
            keys.add(ConfigFields.userWords);
        }

        function userWordsToWords(cfg: CSpellUserSettings): CSpellUserSettings {
            const { userWords, words, ...rest } = cfg;
            const c: CSpellUserSettings = { ...rest };
            if (keys.has(ConfigFields.userWords) || userWords || words) {
                c.words = userWords?.concat(words ?? []) ?? words;
            }
            return c;
        }

        function wordsToUserWords(cfg: CSpellUserSettings): CSpellUserSettings {
            const { words, userWords, ...cfgResult } = cfg;
            const r: CSpellUserSettings = { ...cfgResult };
            if (Object.keys(cfg).includes(ConfigFields.words)) {
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

    static isVSCodeRepository(rep: ConfigRepository): rep is VSCodeRepository {
        return rep instanceof VSCodeRepository;
    }
}

function isWorkspaceFolder(f: GetConfigurationScope): f is WorkspaceFolder {
    if (!f) return false;
    const wf = <Partial<WorkspaceFolder>>f;

    return isUri(wf.uri) && typeof wf.name === 'string' && typeof wf.index === 'number';
}

function fnUpdateFilterKeys<K extends ConfigKeys>(updater: ConfigUpdater<K>): ConfigUpdateFn {
    return (cfg) => updater.updateFn(pick(cfg, updater.keys));
}

interface HasUri {
    uri: Uri;
}

function hasUri(u: HasUri | any | undefined): u is HasUri {
    if (typeof u !== 'object') return false;
    const p = <Partial<HasUri>>u;
    return isUri(p.uri);
}

function isUri(u: Uri | any | undefined): u is Uri {
    if (typeof u !== 'object') return false;
    if (u instanceof Uri) return true;
    const pUri = <Partial<Uri>>u;
    return pUri.scheme !== undefined && pUri.authority !== undefined && pUri.path !== undefined;
}

export const __testing__ = {
    fnUpdateFilterKeys,
    hasUri,
    isUri,
    isWorkspaceFolder,
};
