import { uriToName } from '@internal/common-utils/uriHelper';
import { pick } from '@internal/common-utils/util';
import { posix } from 'path';
import type { TextEdit, WorkspaceFolder } from 'vscode';
import { commands, ConfigurationTarget, Uri, window, workspace, WorkspaceEdit } from 'vscode';

import type { CSpellUserSettings, CustomDictionaryScope } from '../client/index.mjs';
import { findOpenDocument } from '../vscode/fs.mjs';
import { ConfigFields } from './configFields.mjs';
import type { ConfigFileReaderWriter } from './configFileReadWrite.mjs';
import { createConfigFileReaderWriter } from './configFileReadWrite.mjs';
import type { ConfigUpdater } from './configUpdater.mjs';
import { configUpdaterForKey } from './configUpdater.mjs';
import { configurationTargetToDictionaryScope } from './targetAndScope.mjs';
import type { GetConfigurationScope } from './vsConfig.mjs';
import { getSettingFromVSConfig } from './vsConfig.mjs';
import type { VSConfigReaderWriter } from './vsConfigReaderWriter.mjs';
import { createVSConfigReaderWriter } from './vsConfigReaderWriter.mjs';

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
    const autoFormat = !!getSettingFromVSConfig(ConfigFields.autoFormatConfigFile, rw.uri);
    return new CSpellConfigRepository(rw, name, autoFormat);
}

export function createVSCodeConfigRepository(
    target: ConfigurationTarget,
    scope: GetConfigurationScope,
    useMerge: boolean,
): VSCodeRepository;
export function createVSCodeConfigRepository(src: VSConfigReaderWriter): VSCodeRepository;
export function createVSCodeConfigRepository(
    src: ConfigurationTarget | VSConfigReaderWriter,
    scope?: GetConfigurationScope,
    useMerge?: boolean,
): VSCodeRepository {
    const rw = isVSReaderWriter(src) ? src : createVSConfigReaderWriter(src, scope, !!useMerge);
    return new VSCodeRepository(rw);
}

function isVSReaderWriter(src: ConfigurationTarget | VSConfigReaderWriter): src is VSConfigReaderWriter {
    return typeof src === 'object' && !!src.read && !!src.write;
}

function isReaderWriter(src: Uri | ConfigFileReaderWriter): src is ConfigFileReaderWriter {
    const rw = src as ConfigFileReaderWriter;
    return !!rw.update && !!rw.uri;
}

export class CSpellConfigRepository extends ConfigRepositoryBase {
    readonly name: string;
    readonly kind: ConfigRepositoryKind;
    readonly defaultDictionaryScope: undefined;
    readonly configFileUri: Uri;

    constructor(
        readonly configRW: ConfigFileReaderWriter,
        name: string | undefined,
        readonly formatConfig: boolean,
    ) {
        super();
        this.name = name || uriToName(configRW.uri);
        this.kind = 'cspell';
        this.configFileUri = configRW.uri;
    }

    getValue<K extends ConfigKeys>(key: K): Promise<Partial<CSpellUserSettings>> {
        return this.configRW.read([key]);
    }

    async update<K extends ConfigKeys>(updater: ConfigUpdater<K>): Promise<void> {
        const formatConfig = this.formatConfig;
        const uri = this.configFileUri;
        const doc = findOpenDocument(uri);
        if (doc && doc.isDirty) {
            const name = posix.basename(uri.path);
            const answer = await window.showInformationMessage(`Save "${name}"?`, 'Yes', 'No', 'Open');
            if (answer === 'Open') {
                await window.showTextDocument(doc);
                return;
            }
            if (answer !== 'Yes') return;
            await doc.save();
            await workspace.save(doc.uri);
        }
        await this.configRW.update(fnUpdateFilterKeys(updater), updater.keys);
        formatConfig && (await formatDocument(uri));
    }

    static isCSpellConfigRepository(rep: ConfigRepository): rep is CSpellConfigRepository {
        return rep instanceof CSpellConfigRepository;
    }
}

async function formatDocument(uri: Uri) {
    const doc = await workspace.openTextDocument(uri);
    const edits = await commands.executeCommand<TextEdit[] | undefined>('vscode.executeFormatDocumentProvider', uri);
    if (!edits || !edits.length) return;
    const wsEdit = new WorkspaceEdit();
    wsEdit.set(uri, edits);
    await workspace.applyEdit(wsEdit);
    await workspace.save(doc.uri);
    // Sometimes it gets updated after save by the formatter.
    // Wait a bit and try to save again.
    await wait(1000);
    doc.isDirty && (await workspace.save(doc.uri));
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
        fn: ConfigUpdateFn,
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
    const wf = f as Partial<WorkspaceFolder>;

    return isUri(wf.uri) && typeof wf.name === 'string' && typeof wf.index === 'number';
}

function fnUpdateFilterKeys<K extends ConfigKeys>(updater: ConfigUpdater<K>): ConfigUpdateFn {
    return (cfg) => updater.updateFn(pick(cfg, updater.keys));
}

interface HasUri {
    uri: Uri;
}

function hasUri(u: HasUri | unknown | undefined): u is HasUri {
    if (typeof u !== 'object') return false;
    const p = u as Partial<HasUri>;
    return isUri(p.uri);
}

function isUri(u: Uri | unknown | undefined): u is Uri {
    if (typeof u !== 'object') return false;
    if (u instanceof Uri) return true;
    const pUri = u as Partial<Uri>;
    return pUri.scheme !== undefined && pUri.authority !== undefined && pUri.path !== undefined;
}

export const __testing__ = {
    fnUpdateFilterKeys,
    hasUri,
    isUri,
    isWorkspaceFolder,
};

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
