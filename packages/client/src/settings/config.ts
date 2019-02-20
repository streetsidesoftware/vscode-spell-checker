import { workspace, Uri, ConfigurationTarget as Target, TextDocument } from 'vscode';
import { CSpellUserSettings } from '../server';

export { CSpellUserSettings } from '../server';
export { ConfigurationTarget, ConfigurationTarget as Target } from 'vscode';

const sectionCSpell = 'cSpell';

export interface InspectValues<T> {
    defaultValue?: T | undefined;
    globalValue?: T | undefined;
    workspaceValue?: T | undefined;
    workspaceFolderValue?: T | undefined;
}

export const GlobalTarget = Target.Global;
export const WorkspaceTarget = Target.Workspace;

export interface ConfigTargetWithResource {
    target: Target;
    uri: Uri;
}

export type ConfigTargetResourceFree = Target.Global | Target.Workspace;
export type ConfigTarget = ConfigTargetResourceFree | ConfigTargetWithResource;

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

const folderSettings = new Map<string, CSpellUserSettings>();

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
    const target = extractTarget(configTarget);
    const uri = extractTargetUri(configTarget);
    const section = getSectionName(subSection);
    const config = getConfiguration(uri);
    updateFolderSettings(configTarget, subSection, value);
    return config.update(section, value, target);
}

export function inspectConfig(
    resource: Uri | null
): Inspect<CSpellUserSettings> {
    const config = getConfiguration(resource);
    const settings = config.inspect<CSpellUserSettings>(sectionCSpell) || { key: '' };
    const { defaultValue = {}, globalValue = {}, workspaceValue = {}, workspaceFolderValue = {}, key } = settings;

    return {
        key,
        defaultValue,
        globalValue: {...globalValue, ...getFolderSettingsForScope(Scopes.Global)},
        workspaceValue: {...workspaceValue, ...getFolderSettingsForScope(Scopes.Workspace)},
        workspaceFolderValue: { ...workspaceFolderValue, ...getFolderSettingsForScope({ scope: Scopes.Folder, resource })},
    };
}

function toAny(value: any): any {
    return value;
}

export function isFolderLevelTarget(target: ConfigTarget) {
    return isConfigTargetWithResource(target) && target.target === Target.WorkspaceFolder;
}

export function isConfigTargetWithResource(target: ConfigTarget): target is ConfigTargetWithResource {
    return typeof target === 'object';
}

const targetToScopeValues: [Target, Scope][] = [
    [Target.Global, 'globalValue'],
    [Target.Workspace, 'workspaceValue'],
    [Target.WorkspaceFolder, 'workspaceFolderValue'],
];

const targetToScope = new Map(targetToScopeValues);

const targetResourceFreeToScopeValues: [ConfigTargetResourceFree, ScopeResourceFree][] = [
    [Target.Global, 'globalValue'],
    [Target.Workspace, 'workspaceValue'],
];

const targetResourceFreeToScope = new Map(targetResourceFreeToScopeValues);

export function configTargetToScope(target: ConfigTarget): InspectScope {
    if (isConfigTargetWithResource(target)) {
        return {
            scope: toScope(target.target),
            resource: target.uri,
        };
    }
    return targetResourceFreeToScope.get(target)!;
}

export function toScope(target: Target): Scope {
    return targetToScope.get(target)!;
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

function findBestConfig<K extends keyof CSpellUserSettings>(
    config: Inspect<CSpellUserSettings[K]>,
    scope: Scope,
): CSpellUserSettings[K] | undefined {
    for (let p = scopeToOrderIndex.get(scope)!; p >= 0; p -= 1) {
        const k = scopeOrder[p];
        const v = config[k];
        if (v !== undefined) {
            return v;
        }
    }
    return undefined;
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
    return isConfigTargetWithResource(target)
        ? target.target
        : target;
}

export function extractTargetUri(target: ConfigTarget): Uri | null {
    return isConfigTargetWithResource(target)
        ? target.uri
        : null;
}

export function getConfiguration(uri?: Uri | null) {
   return fetchConfiguration(uri);
}

function fetchConfiguration(uri?: Uri | null) {
    return workspace.getConfiguration(undefined, toAny(uri));
}

function updateFolderSettings<T extends keyof CSpellUserSettings>(
    target: ConfigTarget,
    section: T,
    value: CSpellUserSettings[T]
) {
    const key = targetToFolderSettingsKey(target);
    const s: CSpellUserSettings = folderSettings.get(key) || {};
    s[section] = value;
    folderSettings.set(key, s);
}

function getFolderSettingsForScope(scope: InspectScope) {
    const key = scopeToFolderSettingsKey(scope);
    return folderSettings.get(key) || {};
}

function targetToFolderSettingsKey(target: ConfigTarget) {
    const scope = configTargetToScope(target);
    return scopeToFolderSettingsKey(scope);
}

function scopeToFolderSettingsKey(scope: InspectScope) {
    scope = normalizeScope(scope);
    const uri = normalizeResourceUri(scope.resource);
    return scope.scope + '::' + (uri && uri.path || '');
}

workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration(sectionCSpell)) {
        folderSettings.delete(scopeToFolderSettingsKey(Scopes.Global));
        folderSettings.delete(scopeToFolderSettingsKey(Scopes.Workspace));
    }
    if (workspace.workspaceFolders) {
        workspace.workspaceFolders.forEach(folder => {
            if (event.affectsConfiguration(sectionCSpell, folder.uri)) {
                const key = scopeToFolderSettingsKey({ scope: Scopes.Folder, resource: folder.uri });
                folderSettings.delete(key);
            }
        });
    }
});
