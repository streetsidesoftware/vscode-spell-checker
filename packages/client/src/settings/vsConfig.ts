import { workspace, Uri, ConfigurationTarget, TextDocument, WorkspaceConfiguration } from 'vscode';
import { extensionId } from '../constants';
import { CSpellUserSettings } from '../server';
import { DictionaryTargetTypes, isDictionaryTargetTypes, TargetType } from './DictionaryTargets';

export { CSpellUserSettings } from '../server';
export { ConfigurationTarget } from 'vscode';

export const sectionCSpell = extensionId;

export type AllTargetTypes = ConfigurationTarget | DictionaryTargetTypes;

export interface InspectValues<T> {
    defaultValue?: T;
    globalValue?: T;
    workspaceValue?: T;
    workspaceFolderValue?: T;

    // defaultLanguageValue?: T;
    // globalLanguageValue?: T;
    // workspaceLanguageValue?: T;
    // workspaceFolderLanguageValue?: T;

    // languageIds?: string[];
}

export const GlobalTarget = ConfigurationTarget.Global;
export const WorkspaceTarget = ConfigurationTarget.Workspace;

export interface ConfigTargetWithOptionalResource {
    target: ConfigurationTarget;
    uri?: Uri;
}

export interface ConfigTargetWithResource extends ConfigTargetWithOptionalResource {
    uri: Uri;
}

export type ConfigTargetResourceFree = ConfigurationTarget.Global | ConfigurationTarget.Workspace;
export type ConfigTarget = ConfigTargetResourceFree | ConfigTargetWithResource | ConfigTargetWithOptionalResource;

export interface Inspect<T> extends InspectValues<T> {
    key: string;
}

export type Scope = keyof InspectValues<CSpellUserSettings>;
export type ScopeResourceFree = 'defaultValue' | 'globalValue' | 'workspaceValue';

export interface ScopeValues {
    Default: 'defaultValue';
    Global: 'globalValue';
    Workspace: 'workspaceValue';
    Folder: 'workspaceFolderValue';
}

export const Scopes: ScopeValues = {
    Default: 'defaultValue',
    Global: 'globalValue',
    Workspace: 'workspaceValue',
    Folder: 'workspaceFolderValue',
};

export interface FullInspectScope {
    scope: Scope;
    resource: Uri | null;
}

export type InspectScope = FullInspectScope | ScopeResourceFree;

/**
 * ScopeOrder from general to specific.
 */
const scopeOrder: Scope[] = ['defaultValue', 'globalValue', 'workspaceValue', 'workspaceFolderValue'];

const scopeToOrderIndex = new Map<string, number>(scopeOrder.map((s, i) => [s, i] as [string, number]));

export type InspectResult<T> = Inspect<T> | undefined;

export function getSectionName(subSection?: keyof CSpellUserSettings): string {
    return [sectionCSpell, subSection].filter((a) => !!a).join('.');
}

export function getSettingsFromVSConfig(resource: Uri | null): CSpellUserSettings {
    const config = getConfiguration(resource);
    return config.get<CSpellUserSettings>(sectionCSpell, {});
}

export function getSettingFromVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K,
    resource: Uri | null
): CSpellUserSettings[K] | undefined {
    const config = getConfiguration(resource);
    const settings = config.get<CSpellUserSettings>(sectionCSpell, {});
    return settings[subSection];
}

/**
 * Inspect a scoped setting. It will not merge values.
 * @param subSection the cspell section
 * @param scope the scope of the value. A resource is needed to get folder level settings.
 */
export function inspectScopedSettingFromVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K,
    scope: InspectScope
): CSpellUserSettings[K] | undefined {
    scope = normalizeScope(scope);
    const ins = inspectSettingFromVSConfig(subSection, scope.resource);
    return ins && ins[scope.scope];
}

/**
 * Inspect a scoped setting. It will not merge values.
 * @param subSection the cspell section
 * @param scope the scope of the value. A resource is needed to get folder level settings.
 */
export function getScopedSettingFromVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K,
    scope: InspectScope
): CSpellUserSettings[K] | undefined {
    return findScopedSettingFromVSConfig(subSection, scope).value;
}

/**
 * Inspect a scoped setting. It will not merge values.
 * @param subSection the cspell section
 * @param scope the scope of the value. A resource is needed to get folder level settings.
 */
export function findScopedSettingFromVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K,
    scope: InspectScope
): FindBestConfigResult<K> {
    scope = normalizeScope(scope);
    const ins = inspectSettingFromVSConfig(subSection, scope.resource);
    return findBestConfig(ins, scope.scope);
}

export function inspectSettingFromVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K,
    resource: Uri | null
): Inspect<CSpellUserSettings[K]> {
    return inspectConfigKey(resource, subSection);
}

export function setSettingInVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K,
    value: CSpellUserSettings[K],
    configTarget: ConfigTarget
): Promise<void> {
    const nTarget = normalizeTarget(configTarget);
    const target = extractTarget(nTarget);
    const uri = extractTargetUri(nTarget);
    const section = getSectionName(subSection);
    const config = getConfiguration(uri);
    return Promise.resolve(config.update(section, value, target));
}

/**
 * @deprecated Use inspectConfigKey -- this is not guaranteed to work in the future.
 */
export function inspectConfig(resource: Uri | null): Inspect<CSpellUserSettings> {
    const config = getConfiguration(resource);
    const settings = config.inspect<CSpellUserSettings>(sectionCSpell) || { key: sectionCSpell };
    return settings;
}

export function inspectConfigKey<K extends keyof CSpellUserSettings>(resource: Uri | null, key: K): Inspect<CSpellUserSettings[K]> {
    const config = getConfiguration(resource);
    const sectionKey = [sectionCSpell, key].join('.');
    const settings = config.inspect<CSpellUserSettings[K]>(sectionKey) || { key: sectionKey };
    return settings;
}

type InspectByKeys<T> = {
    [K in keyof T]?: Inspect<T[K]>;
};

type InspectCSpellSettings = InspectByKeys<CSpellUserSettings>;

export function inspectConfigKeys(resource: Uri | null, keys: (keyof InspectCSpellSettings)[]): InspectCSpellSettings {
    const r: InspectCSpellSettings = {};
    for (const k of keys) {
        const x: InspectCSpellSettings = { [k]: inspectConfigKey(resource, k) };
        Object.assign(r, x);
    }
    return r;
}

export function isGlobalLevelTarget(target: ConfigTarget): boolean {
    return (
        (isConfigTargetWithOptionalResource(target) && target.target === ConfigurationTarget.Global) ||
        target === ConfigurationTarget.Global
    );
}

export function isWorkspaceLevelTarget(target: ConfigTarget | DictionaryTargetTypes): boolean {
    if (isDictionaryTargetTypes(target)) {
        return target === TargetType.Workspace;
    }
    return (
        (isConfigTargetWithOptionalResource(target) && target.target === ConfigurationTarget.Workspace) ||
        target === ConfigurationTarget.Workspace
    );
}

export function isFolderLevelTarget(target: ConfigTarget): boolean {
    return isConfigTargetWithResource(target) && target.target === ConfigurationTarget.WorkspaceFolder;
}

export function isConfigTargetWithResource(target: ConfigTarget): target is ConfigTargetWithResource {
    return isConfigTargetWithOptionalResource(target) && target.uri !== undefined;
}

export function isConfigTargetWithOptionalResource(target: ConfigTarget): target is ConfigTargetWithOptionalResource {
    return typeof target === 'object' && target.target !== undefined;
}

type TargetToConfigurationTargetMap = {
    [ConfigurationTarget.Global]: ConfigurationTarget.Global;
    [ConfigurationTarget.Workspace]: ConfigurationTarget.Workspace;
    [ConfigurationTarget.WorkspaceFolder]: ConfigurationTarget.WorkspaceFolder;
    [TargetType.User]: ConfigurationTarget.Global;
    [TargetType.Workspace]: ConfigurationTarget.Workspace;
    [TargetType.Folder]: ConfigurationTarget.WorkspaceFolder;
    [TargetType.CSpell]: undefined;
    [TargetType.Dictionary]: undefined;
};

const targetToConfigurationTargetMap: TargetToConfigurationTargetMap = {
    [ConfigurationTarget.Global]: ConfigurationTarget.Global,
    [ConfigurationTarget.Workspace]: ConfigurationTarget.Workspace,
    [ConfigurationTarget.WorkspaceFolder]: ConfigurationTarget.WorkspaceFolder,
    [TargetType.User]: ConfigurationTarget.Global,
    [TargetType.Workspace]: ConfigurationTarget.Workspace,
    [TargetType.Folder]: ConfigurationTarget.WorkspaceFolder,
    [TargetType.CSpell]: undefined,
    [TargetType.Dictionary]: undefined,
};

type TargetToScopeMap = {
    [ConfigurationTarget.Global]: 'globalValue';
    [ConfigurationTarget.Workspace]: 'workspaceValue';
    [ConfigurationTarget.WorkspaceFolder]: 'workspaceFolderValue';
    [TargetType.User]: 'globalValue';
    [TargetType.Workspace]: 'workspaceValue';
    [TargetType.Folder]: 'workspaceFolderValue';
};

const targetToScopeMap: TargetToScopeMap = {
    [ConfigurationTarget.Global]: 'globalValue',
    [ConfigurationTarget.Workspace]: 'workspaceValue',
    [ConfigurationTarget.WorkspaceFolder]: 'workspaceFolderValue',
    [TargetType.User]: 'globalValue',
    [TargetType.Workspace]: 'workspaceValue',
    [TargetType.Folder]: 'workspaceFolderValue',
};

export function targetToConfigurationTarget(target: AllTargetTypes): ConfigurationTarget | undefined {
    return targetToConfigurationTargetMap[target];
}

export function configTargetToScope(target: ConfigTarget): InspectScope {
    if (isConfigTargetWithOptionalResource(target)) {
        return {
            scope: toScope(target.target),
            resource: target.uri || null,
        };
    }
    return targetToScopeMap[target];
}

export function toScope(target: ConfigurationTarget): Scope {
    return targetToScopeMap[target];
}

export function extractScope(inspectScope: InspectScope): Scope {
    if (isFullInspectScope(inspectScope)) {
        return inspectScope.scope;
    }
    return inspectScope;
}

function isFullInspectScope(scope: InspectScope): scope is FullInspectScope {
    return typeof scope === 'object';
}

function normalizeScope(scope: InspectScope): FullInspectScope {
    if (isFullInspectScope(scope)) {
        return {
            scope: scope.scope,
            resource: scope.scope === Scopes.Folder ? normalizeResourceUri(scope.resource) : null,
        };
    }
    return { scope, resource: null };
}

function normalizeResourceUri(uri: Uri | null | undefined): Uri | null {
    if (uri) {
        const folder = workspace.getWorkspaceFolder(uri);
        return (folder && folder.uri) || null;
    }
    return null;
}

export interface FindBestConfigResult<K extends keyof CSpellUserSettings> {
    scope: Scope;
    value: CSpellUserSettings[K];
}

function findBestConfig<K extends keyof CSpellUserSettings>(config: Inspect<CSpellUserSettings[K]>, scope: Scope): FindBestConfigResult<K> {
    for (let p = scopeToOrderIndex.get(scope)!; p >= 0; p -= 1) {
        const k = scopeOrder[p];
        const v = config[k];
        if (v !== undefined) {
            return { scope: k, value: v };
        }
    }
    return { scope: 'defaultValue', value: undefined };
}

export function isGlobalTarget(target: ConfigTarget): boolean {
    return extractTarget(target) === ConfigurationTarget.Global;
}

export function createTargetForUri(target: ConfigurationTarget, uri: Uri): ConfigTargetWithResource {
    return {
        target,
        uri,
    };
}

export function createTargetForDocument(target: ConfigurationTarget, doc: TextDocument): ConfigTargetWithResource {
    return createTargetForUri(target, doc.uri);
}

export function extractTarget(target: ConfigTarget): ConfigurationTarget {
    return isConfigTargetWithOptionalResource(target) ? target.target : target;
}

export function extractTargetUri(target: ConfigTarget): Uri | null {
    return isConfigTargetWithResource(target) ? target.uri || null : null;
}

export function getConfiguration(uri?: Uri | null): WorkspaceConfiguration {
    return workspace.getConfiguration(undefined, uri);
}

export function normalizeTarget(target: ConfigTarget): ConfigTarget {
    if (!isConfigTargetWithOptionalResource(target)) {
        return target;
    }
    if (target.target !== ConfigurationTarget.WorkspaceFolder) {
        return target.target;
    }
    const uri = normalizeResourceUri(target.uri);
    if (!uri) {
        return ConfigurationTarget.Workspace;
    }
    return { target: target.target, uri };
}
