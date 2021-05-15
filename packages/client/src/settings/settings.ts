import { performance } from '../util/perf';
performance.mark('settings.ts');
import { CSpellUserSettings, normalizeLocale as normalizeLocale } from '../server';
import {
    normalizeWord,
    configFileLocations,
    defaultFileName as baseConfigName,
    readSettings,
    filterOutWords,
    readSettingsFileAndApplyUpdate,
} from './CSpellSettings';
import { workspace, ConfigurationTarget } from 'vscode';
performance.mark('settings.ts imports 1');
import * as path from 'path';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
performance.mark('settings.ts imports 2');
import { unique } from '../util';
import * as watcher from '../util/watcher';
import * as config from './config';
performance.mark('settings.ts imports 3');
import * as fs from 'fs-extra';
import { InspectScope } from './config';
performance.mark('settings.ts imports 4');
performance.mark('settings.ts imports done');

export { ConfigTarget, InspectScope, Scope } from './config';
export interface SettingsInfo {
    path: string;
    settings: CSpellUserSettings;
}

export function watchSettingsFiles(callback: () => void): vscode.Disposable {
    // Every 10 seconds see if we have new files to watch.
    let busy = false;
    const intervalObj = setInterval(async () => {
        if (busy) {
            return;
        }
        busy = true;
        const settingsFiles = await findSettingsFiles();
        settingsFiles
            .map((uri) => uri.fsPath)
            .filter((file) => !watcher.isWatching(file))
            .forEach((file) => watcher.add(file, callback));
        busy = false;
    }, 10000);

    return vscode.Disposable.from({
        dispose: () => {
            watcher.dispose();
            clearInterval(intervalObj);
        },
    });
}

export function getDefaultWorkspaceConfigLocation(): string | undefined {
    const { workspaceFolders } = workspace;
    const root = workspaceFolders && workspaceFolders[0] && workspaceFolders[0].uri.fsPath;
    return root ? path.join(root, baseConfigName) : undefined;
}

export function hasWorkspaceLocation(): boolean {
    const { workspaceFolders } = workspace;
    return !!(workspaceFolders && workspaceFolders[0]);
}

/**
 * Returns a list of files in the order of Best to Worst Match.
 * @param uri
 */
export function findSettingsFiles(uri?: Uri): Promise<Uri[]> {
    const { workspaceFolders } = workspace;
    if (!workspaceFolders || !hasWorkspaceLocation()) {
        return Promise.resolve([]);
    }

    const folders = uri ? [workspace.getWorkspaceFolder(uri)!].filter((a) => !!a).concat(workspaceFolders) : workspaceFolders;

    const possibleLocations = folders
        .map((folder) => folder.uri.fsPath)
        .map((root) => configFileLocations.map((rel) => path.join(root, rel)))
        .reduce((a, b) => a.concat(b), []);

    const found = possibleLocations.map(async (filename) => ({ filename, exists: await fs.pathExists(filename) }));

    return Promise.all(found).then((found) =>
        found
            .filter((found) => found.exists)
            .map((found) => found.filename)
            .map((filename) => Uri.file(filename))
    );
}

export function findExistingSettingsFileLocationUri(uri?: Uri): Promise<Uri | undefined> {
    return findSettingsFiles(uri).then((paths) => paths[0]);
}

export async function findExistingSettingsFileLocation(uri?: Uri): Promise<string | undefined> {
    return (await findExistingSettingsFileLocationUri(uri))?.fsPath;
}

export function findSettingsFileLocation(): Promise<string | undefined> {
    return findExistingSettingsFileLocation().then((path) => path || getDefaultWorkspaceConfigLocation());
}

export function loadTheSettingsFile(): Promise<SettingsInfo | undefined> {
    return findSettingsFileLocation().then(loadSettingsFile);
}

export function loadSettingsFile(path: string | undefined): Promise<SettingsInfo | undefined> {
    return path ? readSettings(path).then((settings) => (path ? { path, settings } : undefined)) : Promise.resolve(undefined);
}

export function setEnableSpellChecking(target: config.ConfigTarget, enabled: boolean): Thenable<void> {
    return config.setSettingInVSConfig('enabled', enabled, target);
}

export function getEnabledLanguagesFromConfig(scope: InspectScope): string[] {
    return config.getScopedSettingFromVSConfig('enabledLanguageIds', scope) || [];
}

/**
 * @description Enable a programming language
 * @param target - which level of setting to set
 * @param languageId - the language id, e.g. 'typescript'
 */
export async function enableLanguage(target: config.ConfigTarget, languageId: string): Promise<void> {
    await enableLanguageIdForTarget(languageId, true, target, true, true);
}

export async function disableLanguage(target: config.ConfigTarget, languageId: string): Promise<void> {
    await enableLanguageIdForTarget(languageId, false, target, true, true);
}

export function addWordToSettings(target: config.ConfigTarget, word: string): Promise<boolean> {
    const useGlobal = config.isGlobalTarget(target) || !hasWorkspaceLocation();
    const addWords = normalizeWord(word);
    const section: 'userWords' | 'words' = useGlobal ? 'userWords' : 'words';
    return updateSettingInConfig(section, target, (words) => unique(addWords.concat(words || []).sort()), true);
}

export function addIgnoreWordToSettings(target: config.ConfigTarget, word: string): Promise<boolean> {
    const addWords = normalizeWord(word);
    return updateSettingInConfig('ignoreWords', target, (words) => unique(addWords.concat(words || []).sort()), true);
}

export async function removeWordFromSettings(target: config.ConfigTarget, word: string): Promise<boolean> {
    const useGlobal = config.isGlobalTarget(target);
    const section: 'userWords' | 'words' = useGlobal ? 'userWords' : 'words';
    const toRemove = normalizeWord(word);
    return updateSettingInConfig(section, target, (words) => filterOutWords(words || [], toRemove), true);
}

export function toggleEnableSpellChecker(target: config.ConfigTarget): Thenable<void> {
    const resource = config.isConfigTargetWithResource(target) ? target.uri : null;
    const curr = config.getSettingFromVSConfig('enabled', resource);
    return config.setSettingInVSConfig('enabled', !curr, target);
}

/**
 * Enables the current programming language of the active file in the editor.
 */
export async function enableCurrentLanguage(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document?.languageId) {
        const target = selectBestTargetForDocument(ConfigurationTarget.WorkspaceFolder, editor.document);
        return enableLanguage(target, editor.document.languageId);
    }
    return;
}

/**
 * Disables the current programming language of the active file in the editor.
 */
export function disableCurrentLanguage(): Thenable<void> {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document?.languageId) {
        const target = selectBestTargetForDocument(ConfigurationTarget.WorkspaceFolder, editor.document);
        return disableLanguage(target, editor.document.languageId);
    }
    return Promise.resolve();
}

function selectBestTargetForDocument(desiredTarget: vscode.ConfigurationTarget, doc: vscode.TextDocument | undefined): config.ConfigTarget {
    if (desiredTarget === ConfigurationTarget.Global || !vscode.workspace.workspaceFolders) {
        return ConfigurationTarget.Global;
    }
    if (desiredTarget === ConfigurationTarget.Workspace || !doc?.uri) {
        return ConfigurationTarget.Workspace;
    }

    const folder = workspace.getWorkspaceFolder(doc.uri);
    return folder ? config.createTargetForDocument(ConfigurationTarget.WorkspaceFolder, doc) : ConfigurationTarget.Workspace;
}

export async function enableLocale(target: config.ConfigTarget, locale: string): Promise<void> {
    await enableLocaleForTarget(locale, true, target, true);
}

export async function disableLocale(target: config.ConfigTarget, locale: string): Promise<void> {
    await enableLocaleForTarget(locale, false, target, true);
}

export function enableLocaleForTarget(
    locale: string,
    enable: boolean,
    target: config.ConfigTarget,
    isCreateAllowed: boolean
): Promise<boolean> {
    const applyFn: (src: string | undefined) => string | undefined = enable
        ? (currentLanguage) => unique(normalizeLocale(currentLanguage).split(',').concat(locale.split(','))).join(',')
        : (currentLanguage) => {
              const value = unique(normalizeLocale(currentLanguage).split(','))
                  .filter((lang) => lang !== locale)
                  .join(',');
              return value || undefined;
          };
    return updateSettingInConfig('language', target, applyFn, isCreateAllowed, shouldUpdateCSpell(target));
}

/**
 * It is a two step logic to minimize a build up of values in the configuration.
 * The idea is to use defaults whenever possible.
 * @param languageId The language id / filetype to enable / disable
 * @param enable true == enable / false == disable
 * @param currentValues the value to update.
 */
function updateEnableFiletypes(languageId: string, enable: boolean, currentValues: string[] | undefined) {
    const values = new Set((currentValues || []).map((v) => v.toLowerCase()));
    languageId = languageId.toLowerCase();
    const disabledLangId = '!' + languageId;
    if (enable) {
        if (values.has(disabledLangId)) {
            values.delete(disabledLangId);
        } else {
            values.add(languageId);
        }
    } else {
        if (values.has(languageId)) {
            values.delete(languageId);
        } else {
            values.add(disabledLangId);
        }
    }
    return values.size ? [...values].sort() : undefined;
}

export function enableLanguageIdForTarget(
    languageId: string,
    enable: boolean,
    target: config.ConfigTarget,
    isCreateAllowed: boolean,
    forceUpdateVSCode: boolean
): Promise<boolean> {
    const fn = (src: string[] | undefined) => updateEnableFiletypes(languageId, enable, src);
    return updateSettingInConfig('enableFiletypes', target, fn, isCreateAllowed, shouldUpdateCSpell(target), forceUpdateVSCode);
}

/**
 * Try to enable / disable a programming language id starting at folder level going to global level, stopping when successful.
 * @param languageId
 * @param enable
 * @param uri
 */
export async function enableLanguageIdForClosestTarget(
    languageId: string,
    enable: boolean,
    uri: Uri | undefined,
    forceUpdateVSCode: boolean = false
): Promise<void> {
    if (languageId) {
        if (uri) {
            // Apply it to the workspace folder if it exists.
            const target: config.ConfigTargetWithResource = {
                target: ConfigurationTarget.WorkspaceFolder,
                uri,
            };
            if (await enableLanguageIdForTarget(languageId, enable, target, false, forceUpdateVSCode)) return;
        }

        if (
            vscode.workspace.workspaceFolders &&
            vscode.workspace.workspaceFolders.length &&
            (await enableLanguageIdForTarget(languageId, enable, config.Target.Workspace, false, forceUpdateVSCode))
        ) {
            return;
        }

        // Apply it to User settings.
        await enableLanguageIdForTarget(languageId, enable, config.Target.Global, true, forceUpdateVSCode);
    }
    return;
}

/**
 * Determine if we should update the cspell file if it exists.
 * 1. Update is allowed for WorkspaceFolders
 * 1. Update is allowed for Workspace if there is only 1 folder.
 * 1. Update is not allowed for the Global target.
 * @param target
 */
function shouldUpdateCSpell(target: config.ConfigTarget) {
    const cfgTarget = config.extractTarget(target);
    return (
        cfgTarget !== config.Target.Global &&
        workspace.workspaceFolders &&
        (cfgTarget === config.Target.WorkspaceFolder || workspace.workspaceFolders.length === 1)
    );
}

/**
 * Update Config Settings.
 * Writes to both the VS Config and the `cspell.json` if it exists.
 * If a `cspell.json` exists, it will be preferred over the VS Code config setting.
 * @param section the configuration value to set/update.
 * @param target the configuration level (Global, Workspace, WorkspaceFolder)
 * @param applyFn the function to calculate the new value.
 * @param create if the setting does not exist, then create it.
 * @param updateCSpell update the cspell.json file if it exists.
 */
export async function updateSettingInConfig<K extends keyof CSpellUserSettings>(
    section: K,
    configTarget: config.ConfigTarget,
    applyFn: (origValue: CSpellUserSettings[K]) => CSpellUserSettings[K],
    create: boolean,
    updateCSpell: boolean = true,
    forceUpdateVSCode: boolean = false
): Promise<boolean> {
    interface Result {
        value: CSpellUserSettings[K] | undefined;
    }
    const target = config.normalizeTarget(configTarget);
    const scope = config.configTargetToScope(target);
    const orig = config.findScopedSettingFromVSConfig(section, scope);
    const uri = (config.isConfigTargetWithOptionalResource(target) && target.uri) || undefined;
    const settingsFilename =
        (updateCSpell && !config.isGlobalLevelTarget(target) && (await findExistingSettingsFileLocation(uri))) || undefined;

    async function updateConfig(): Promise<false | Result> {
        if (create || (orig.value !== undefined && orig.scope === config.extractScope(scope))) {
            const newValue = applyFn(orig.value);
            await config.setSettingInVSConfig(section, newValue, target);
            return { value: newValue };
        }
        return false;
    }

    async function updateCSpellFile(
        settingsFilename: string | undefined,
        defaultValue: CSpellUserSettings[K] | undefined
    ): Promise<boolean> {
        if (!settingsFilename) return false;
        await readSettingsFileAndApplyUpdate(settingsFilename, (settings) => {
            const v = settings[section];
            const newValue = v !== undefined ? applyFn(v) : applyFn(defaultValue);
            const newSettings = { ...settings };
            if (newValue === undefined) {
                delete newSettings[section];
            } else {
                newSettings[section] = newValue;
            }
            return newSettings;
        });
        return true;
    }

    const cspellResult = await updateCSpellFile(settingsFilename, orig.value);
    // Only update VS Code config if we do not have `cspell.json` file or is it a forceUpdate.
    const configResult = (!cspellResult || forceUpdateVSCode) && (await updateConfig());
    return !!configResult;
}

export function resolveTarget(target: config.Target, uri?: string | null | Uri): config.ConfigTarget {
    if (target === config.Target.Global || !hasWorkspaceLocation()) {
        return config.Target.Global;
    }

    if (!uri) {
        return config.Target.Workspace;
    }

    const resolvedUri = parseToUri(uri);
    return config.createTargetForUri(target, resolvedUri);
}

export function parseToUri(uri: string | Uri): Uri {
    if (uri instanceof Uri) {
        return uri;
    }
    return Uri.parse(uri);
}

export async function determineSettingsPathWithConfig(
    target: config.ConfigTarget,
    uri: string | null | Uri | undefined,
    docConfigFiles: Uri[] | undefined
): Promise<string[]> {
    if (config.isGlobalLevelTarget(target)) {
        return [];
    }

    if (config.isWorkspaceLevelTarget(target)) {
        const files = await findSettingsFiles();
        const cfgFileSet = new Set(docConfigFiles?.map((u) => u.toString()) || []);
        const filtered = cfgFileSet.size ? files.filter((u) => cfgFileSet.has(u.toString())) : files;
        const found = filtered.length ? filtered : docConfigFiles?.slice(0, 1) || [];
        return found.map((uri) => uri.fsPath);
    }

    if (docConfigFiles?.length) {
        return [docConfigFiles[0].fsPath];
    }

    const useUri = uri ? parseToUri(uri) : undefined;
    const path = await findExistingSettingsFileLocation(useUri);
    return path ? [path] : [];
}

export async function determineSettingsPath(target: config.ConfigTarget, uri: string | null | Uri | undefined): Promise<string[]> {
    return determineSettingsPathWithConfig(target, uri, undefined);
}

performance.mark('settings.ts done');
