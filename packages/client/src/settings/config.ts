import { workspace, Uri, ConfigurationTarget as Target, TextDocument } from 'vscode';
import { CSpellUserSettings } from '../server';

export { CSpellUserSettings } from '../server';
export { ConfigurationTarget, ConfigurationTarget as Target } from 'vscode';

export const sectionCSpell = 'cSpell';

export interface InspectValues<T> {
    defaultValue?: T | undefined;
    globalValue?: T | undefined;
    workspaceValue?: T | undefined;
    workspaceFolderValue?: T | undefined;
}

export const GlobalTarget = Target.Global;
export const WorkspaceTarget = Target.Workspace;

export interface ConfigTargetWithOptionalResource {
    target: Target;
    uri?: Uri;
}

export interface ConfigTargetWithResource extends ConfigTargetWithOptionalResource {
    uri: Uri;
}

export type ConfigTargetResourceFree = Target.Global | Target.Workspace;
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
const scopeOrder: Scope[] = [
    'defaultValue',
    'globalValue',
    'workspaceValue',
    'workspaceFolderValue',
];

const scopeToOrderIndex = new Map<string, number>(
    scopeOrder.map((s, i) => [s, i] as [string, number])
);

export type InspectResult<T> = Inspect<T> | undefined;

export function getSectionName(
    subSection?: keyof CSpellUserSettings
): string {
    return [sectionCSpell, subSection].filter(a => !!a).join('.');
}

export function getSettingsFromVSConfig(
    resource: Uri | null
): CSpellUserSettings {
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
    scope: InspectScope,
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
    scope: InspectScope,
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
    scope: InspectScope,
): FindBestConfigResult<K> {
    scope = normalizeScope(scope);
    const ins = inspectSettingFromVSConfig(subSection, scope.resource);
    return findBestConfig(ins, scope.scope);
}

export function inspectSettingFromVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K,
    resource: Uri | null,
): Inspect<CSpellUserSettings[K]> {
    const config = inspectConfig(resource);
    const { defaultValue = {}, globalValue = {}, workspaceValue = {}, workspaceFolderValue = {} } = config;
    return {
        key: config.key + '.' + subSection,
        defaultValue: defaultValue[subSection],
        globalValue: globalValue[subSection],
        workspaceValue: workspaceValue[subSection],
        workspaceFolderValue: workspaceFolderValue[subSection],
    };
}

export function setSettingInVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K,
    value: CSpellUserSettings[K],
    configTarget: ConfigTarget,
): Thenable<void> {
    const nTarget = normalizeTarget(configTarget);
    const target = extractTarget(nTarget);
    const uri = extractTargetUri(nTarget);
    const section = getSectionName(subSection);
    const config = getConfiguration(uri);
    return config.update(section, value, target);
}

export function inspectConfig(
    resource: Uri | null
): Inspect<CSpellUserSettings> {
    const config = getConfiguration(resource);
    const settings = config.inspect<CSpellUserSettings>(sectionCSpell) || { key: sectionCSpell };
    return settings;
}

function toAny(value: any): any {
    return value;
}

export function isGlobalLevelTarget(target: ConfigTarget) {
    return isConfigTargetWithOptionalResource(target) && target.target === Target.Global || target === Target.Global;
}

export function isWorkspaceLevelTarget(target: ConfigTarget) {
    return isConfigTargetWithOptionalResource(target) && target.target === Target.Workspace || target === Target.Workspace;
}

export function isFolderLevelTarget(target: ConfigTarget) {
    return isConfigTargetWithResource(target) && target.target === Target.WorkspaceFolder;
}

export function isConfigTargetWithResource(target: ConfigTarget): target is ConfigTargetWithResource {
    return isConfigTargetWithOptionalResource(target) && target.uri !== undefined;
}

export function isConfigTargetWithOptionalResource(target: ConfigTarget): target is ConfigTargetWithOptionalResource {
    return typeof target === 'object' && target.target !== undefined;
}

type TargetToScope = {
    [Target.Global]: 'globalValue';
    [Target.Workspace]: 'workspaceValue';
    [Target.WorkspaceFolder]: 'workspaceFolderValue';
}

const targetToScope: TargetToScope = {
    1: 'globalValue',
    2: 'workspaceValue',
    3: 'workspaceFolderValue',
};

export function configTargetToScope(target: ConfigTarget): InspectScope {
    if (isConfigTargetWithOptionalResource(target)) {
        return {
            scope: toScope(target.target),
            resource: target.uri || null,
        };
    }
    return targetToScope[target];
}

export function toScope(target: Target): Scope {
    return targetToScope[target];
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
        return folder && folder.uri || null;
    }
    return null;
}

export interface FindBestConfigResult<K extends keyof CSpellUserSettings> {
    scope: Scope;
    value: CSpellUserSettings[K];
}

function findBestConfig<K extends keyof CSpellUserSettings>(
    config: Inspect<CSpellUserSettings[K]>,
    scope: Scope,
): FindBestConfigResult<K>{
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
    return extractTarget(target) === Target.Global;
}

export function createTargetForUri(target: Target, uri: Uri): ConfigTargetWithResource {
    return {
        target, uri
    };
}

export function createTargetForDocument(target: Target, doc: TextDocument): ConfigTargetWithResource {
    return createTargetForUri(target, doc.uri);
}

export function extractTarget(target: ConfigTarget): Target {
    return isConfigTargetWithOptionalResource(target)
        ? target.target
        : target;
}

export function extractTargetUri(target: ConfigTarget): Uri | null {
    return isConfigTargetWithResource(target)
        ? (target.uri || null)
        : null;
}

export function getConfiguration(uri?: Uri | null) {
    return workspace.getConfiguration(undefined, toAny(uri));
}

export function normalizeTarget(target: ConfigTarget): ConfigTarget {
    if (!isConfigTargetWithOptionalResource(target)) {
        return target;
    }
    if (target.target !== Target.WorkspaceFolder) {
        return target.target;
    }
    const uri = normalizeResourceUri(target.uri);
    if (!uri) {
        return Target.Workspace;
    }
    return { target: target.target, uri };
}
