import { workspace, Uri, ConfigurationTarget, TextDocument, WorkspaceConfiguration, ConfigurationScope } from 'vscode';
import { extensionId } from '../constants';
import { CSpellUserSettings } from '../client';
import { findConicalDocumentScope } from '../util/documentUri';

export { CSpellUserSettings } from '../client';
export { ConfigurationTarget } from 'vscode';

export const sectionCSpell = extensionId;

export interface InspectValues<T> {
    defaultValue?: T;
    globalValue?: T;
    workspaceValue?: T;
    workspaceFolderValue?: T;
}

export interface FullInspectValues<T> extends InspectValues<T> {
    key: string;

    defaultLanguageValue?: T;
    globalLanguageValue?: T;
    workspaceLanguageValue?: T;
    workspaceFolderLanguageValue?: T;

    languageIds?: string[];
}

export const GlobalTarget = ConfigurationTarget.Global;

export interface ConfigTargetWithOptionalResource {
    target: ConfigurationTarget;
    uri?: Uri;
    configScope?: ConfigurationScope;
}

export interface ConfigTargetWithResource extends ConfigTargetWithOptionalResource {
    uri: Uri;
}

export type ConfigTargetResourceFree = ConfigurationTarget.Global | ConfigurationTarget.Workspace;
export type ConfigTargetLegacy = ConfigTargetResourceFree | ConfigTargetWithResource | ConfigTargetWithOptionalResource;

export interface Inspect<T> extends FullInspectValues<T> {
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
    resource: Uri | undefined;
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

export function getSettingsFromVSConfig(scope: GetConfigurationScope): CSpellUserSettings {
    const config = getConfiguration(scope);
    return config.get<CSpellUserSettings>(sectionCSpell, {});
}

export function getSettingFromVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K,
    resource: GetConfigurationScope
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
    return ins?.[scope.scope];
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
    scope: GetConfigurationScope
): Inspect<CSpellUserSettings[K]> {
    return inspectConfigByScopeAndKey(scope, subSection);
}

export function setSettingInVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K,
    value: CSpellUserSettings[K],
    configTarget: ConfigTargetLegacy
): Promise<void> {
    const nTarget = normalizeTarget(configTarget);
    const target = extractTarget(nTarget);
    const uri = extractTargetUri(nTarget);
    const section = getSectionName(subSection);
    const config = getConfiguration(uri);
    return Promise.resolve(config.update(section, value, target));
}

/**
 * @deprecationMessage Use inspectConfigKey -- this is not guaranteed to work in the future.
 * @deprecated true
 */
export function inspectConfig(scope: GetConfigurationScope): Inspect<CSpellUserSettings> {
    const config = getConfiguration(scope);
    const settings = config.inspect<CSpellUserSettings>(sectionCSpell) || { key: sectionCSpell };
    return settings;
}

export function inspectConfigByScopeAndKey<K extends keyof CSpellUserSettings>(
    scope: GetConfigurationScope,
    key: K
): Inspect<CSpellUserSettings[K]> {
    const config = getConfiguration(scope);
    const sectionKey = [sectionCSpell, key].join('.');
    const settings = config.inspect<CSpellUserSettings[K]>(sectionKey) || { key: sectionKey };
    return settings;
}

function inspectConfigByKey<K extends keyof CSpellUserSettings>(config: WorkspaceConfiguration, key: K): Inspect<CSpellUserSettings[K]> {
    const sectionKey = [sectionCSpell, key].join('.');
    const settings = config.inspect<CSpellUserSettings[K]>(sectionKey) || { key: sectionKey };
    return settings;
}

type InspectByKeys<T> = {
    [K in keyof T]?: Inspect<T[K]>;
};

type InspectCSpellSettings = InspectByKeys<CSpellUserSettings>;

export function inspectConfigKeys(scope: GetConfigurationScope, keys: readonly (keyof InspectCSpellSettings)[]): InspectCSpellSettings {
    const config = getConfiguration(scope);
    const r: InspectCSpellSettings = {};
    for (const k of keys) {
        const x: InspectCSpellSettings = { [k]: inspectConfigByKey(config, k) };
        Object.assign(r, x);
    }
    return r;
}

export function isGlobalLevelTarget(target: ConfigTargetLegacy): boolean {
    return (
        (isConfigTargetWithOptionalResource(target) && target.target === ConfigurationTarget.Global) ||
        target === ConfigurationTarget.Global
    );
}

export function isWorkspaceLevelTarget(target: ConfigTargetLegacy): boolean {
    return isConfigTargetWithOptionalResource(target) && target.target === ConfigurationTarget.Workspace;
}

export function isFolderLevelTarget(target: ConfigTargetLegacy): boolean {
    return isConfigTargetWithResource(target) && target.target === ConfigurationTarget.WorkspaceFolder;
}

export function isConfigTargetWithResource(target: ConfigTargetLegacy): target is ConfigTargetWithResource {
    return isConfigTargetWithOptionalResource(target) && target.uri !== undefined;
}

export function isConfigTargetWithOptionalResource(target: ConfigTargetLegacy): target is ConfigTargetWithOptionalResource {
    return typeof target === 'object' && target.target !== undefined;
}

export function getConfigurationTargetFromLegacy(target: ConfigTargetLegacy): ConfigurationTarget {
    return typeof target === 'object' ? target.target : target;
}

type TargetToScopeMap = {
    [ConfigurationTarget.Global]: 'globalValue';
    [ConfigurationTarget.Workspace]: 'workspaceValue';
    [ConfigurationTarget.WorkspaceFolder]: 'workspaceFolderValue';
};

const targetToScopeMap: TargetToScopeMap = {
    [ConfigurationTarget.Global]: 'globalValue',
    [ConfigurationTarget.Workspace]: 'workspaceValue',
    [ConfigurationTarget.WorkspaceFolder]: 'workspaceFolderValue',
};

type ConfigTargetToName = {
    [key in ConfigurationTarget]: string;
};

const configTargetToName: ConfigTargetToName = {
    [ConfigurationTarget.Global]: 'user',
    [ConfigurationTarget.Workspace]: 'workspace',
    [ConfigurationTarget.WorkspaceFolder]: 'folder',
};

export function configurationTargetToName(target: ConfigurationTarget): string {
    return configTargetToName[target];
}

export function configTargetToScope(target: ConfigTargetLegacy): InspectScope {
    if (isConfigTargetWithOptionalResource(target)) {
        return {
            scope: toScope(target.target),
            resource: target.uri || undefined,
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
            resource: scope.scope === Scopes.Folder ? normalizeResourceUri(scope.resource) : undefined,
        };
    }
    return { scope, resource: undefined };
}

function normalizeResourceUri(uri: Uri | null | undefined): Uri | undefined {
    if (uri) {
        const folder = workspace.getWorkspaceFolder(uri);
        return folder?.uri;
    }
    return undefined;
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

export function isGlobalTarget(target: ConfigTargetLegacy): boolean {
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

export function extractTarget(target: ConfigTargetLegacy): ConfigurationTarget {
    return isConfigTargetWithOptionalResource(target) ? target.target : target;
}

export function extractTargetUri(target: ConfigTargetLegacy): Uri | undefined {
    return isConfigTargetWithOptionalResource(target) ? target.uri : undefined;
}

export type GetConfigurationScope = ConfigurationScope | undefined;

export function getConfiguration(scope: GetConfigurationScope): WorkspaceConfiguration {
    return workspace.getConfiguration(undefined, normalizeConfigurationScope(scope));
}

export function normalizeTarget(target: ConfigTargetLegacy): ConfigTargetWithOptionalResource {
    if (isConfigTargetWithOptionalResource(target)) return target;
    return {
        target,
        uri: undefined,
    };
}

type ConfigKeys = keyof CSpellUserSettings;

export function calculateConfigForTarget(
    target: ConfigurationTarget,
    scope: GetConfigurationScope,
    keys: readonly ConfigKeys[],
    useMergeInspect: boolean
): CSpellUserSettings {
    const s: CSpellUserSettings = {};
    const inspectResult = inspectConfigKeys(scope, keys);
    const fn = useMergeInspect ? assignExtractAndMerge : assignExtract;
    for (const k of keys) {
        fn(s, target, k, inspectResult);
    }
    return s;
}

function assignExtractAndMerge<K extends keyof InspectCSpellSettings>(
    dest: CSpellUserSettings,
    target: ConfigurationTarget,
    k: K,
    s: InspectCSpellSettings
) {
    const v = s[k] as FullInspectValues<CSpellUserSettings[K]>;
    const m = mergeInspect<CSpellUserSettings[K]>(target, v);
    if (m !== undefined) {
        dest[k] = m;
    }
}

function assignExtract<K extends keyof InspectCSpellSettings>(
    dest: CSpellUserSettings,
    target: ConfigurationTarget,
    k: K,
    s: InspectCSpellSettings
) {
    const v = s[k] as FullInspectValues<CSpellUserSettings[K]>;
    const m = extractInspect<CSpellUserSettings[K]>(target, v);
    if (m !== undefined) {
        dest[k] = m;
    }
}

function extractInspect<T>(target: ConfigurationTarget, value: FullInspectValues<T> | undefined): T | undefined {
    if (value === undefined) return undefined;
    switch (target) {
        case ConfigurationTarget.Global:
            return value.globalLanguageValue ?? value.globalValue;
        case ConfigurationTarget.Workspace:
            return value.workspaceLanguageValue ?? value.workspaceValue;
        case ConfigurationTarget.WorkspaceFolder:
            return value.workspaceFolderLanguageValue ?? value.workspaceFolderValue;
    }
}

function mergeInspect<T>(target: ConfigurationTarget, value: FullInspectValues<T> | undefined): T | undefined {
    if (value === undefined) return undefined;
    let t: T | undefined = mergeValues(value.defaultValue, value.defaultLanguageValue, value.globalValue, value.globalLanguageValue);
    if (target === ConfigurationTarget.Global) return t;
    t = mergeValues(t, value.workspaceValue, value.workspaceLanguageValue);
    if (target === ConfigurationTarget.Workspace) return t;
    t = mergeValues(t, value.workspaceFolderValue, value.workspaceFolderLanguageValue);
    if (target !== ConfigurationTarget.WorkspaceFolder) throw new Error(`Unknown Config Target "${target}"`);
    return t;
}

function mergeValues<T>(...v: T[]): T | undefined {
    let m: T | undefined = undefined;
    for (const t of v) {
        if (t === undefined) continue;
        if (typeof m !== 'object' || typeof t !== 'object' || Array.isArray(t) || Array.isArray(m)) {
            m = t;
            continue;
        }
        m = Object.assign({}, m, t);
    }
    return m;
}

/**
 * Update VS Code Configuration for the Extension
 * @param target - configuration level
 * @param scope - the configuration scope / context
 * @param keys - keys needed for the update function.
 * @param updateFn - A function that will return the fields to be updated.
 * @returns
 */
export function updateConfig(
    target: ConfigurationTarget,
    scope: GetConfigurationScope,
    keys: readonly ConfigKeys[],
    updateFn: (c: Partial<CSpellUserSettings>) => Partial<CSpellUserSettings>,
    useMerge: boolean
): Promise<void> {
    const cfg = calculateConfigForTarget(target, scope, keys, useMerge);
    const updated = updateFn(cfg);
    const config = getConfiguration(scope);

    const p = Object.entries(updated).map(([key, value]) => config.update(`${extensionId}.${key}`, value, target));
    return Promise.all(p).then();
}

interface UriLike {
    readonly authority: string;
    readonly fragment: string;
    readonly path: string;
    readonly query: string;
    readonly scheme: string;
}

interface HasUri {
    uri: Uri | UriLike;
}

function normalizeConfigurationScope(scope: GetConfigurationScope): GetConfigurationScope {
    if (isUriLike(scope)) return findConicalDocumentScope(fixUri(scope));
    if (isHasUri(scope)) {
        if (isUri(scope.uri)) return scope;
        return {
            ...scope,
            uri: fixUri(scope.uri),
        };
    }
    return scope;
}

/**
 * Fix any Uri's that are not VS Code Specific Uri instances.
 * The Configuration is very picky and will break if it is not a VS Code instance.
 * @param scope - A ConfigurationScope
 * @returns
 */
function fixUri(scope: UriLike | Uri): Uri {
    if (isUri(scope)) return scope;
    return Uri.parse(scope.toString());
}

function isUriLike(possibleUri: unknown): possibleUri is UriLike {
    if (!possibleUri || typeof possibleUri !== 'object') return false;
    const uri = <UriLike>possibleUri;
    return (
        uri.authority !== undefined &&
        uri.fragment !== undefined &&
        uri.path != undefined &&
        uri.query != undefined &&
        uri.scheme != undefined
    );
}

function isUri(uri: unknown): uri is Uri {
    return uri instanceof Uri;
}

function isHasUri(scope: unknown): scope is HasUri {
    if (!scope || typeof scope !== 'object') return false;
    const h = <HasUri>scope;
    return h.uri !== undefined;
}

export const __testing__ = {
    mergeInspect,
};
