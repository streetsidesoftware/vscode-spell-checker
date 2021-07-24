import { performance } from '../util/perf';

performance.mark('settings.ts');

import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { ConfigurationTarget, Uri, workspace } from 'vscode';
import { CSpellUserSettings, normalizeLocale as normalizeLocale } from '../server';
import { isDefined, unique } from '../util';
import * as watcher from '../util/watcher';
import {
    configFileLocations,
    defaultFileName as baseConfigName,
    defaultFileName,
    filterOutWords,
    isUpdateSupportedForConfigFileFormat,
    normalizeWords,
    readSettings,
    readSettingsFileAndApplyUpdate,
} from './CSpellSettings';
import * as config from './vsConfig';
import { InspectScope } from './vsConfig';
import { CSpellSettings } from '@cspell/cspell-types';
import { fileExists } from 'common-utils/file.js';
import { writeConfigFile } from './configFileReadWrite';

performance.mark('settings.ts imports done');

export { ConfigTarget, InspectScope, Scope } from './vsConfig';
export interface SettingsInfo {
    path: Uri;
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

export function getDefaultWorkspaceConfigFile(docUri?: Uri): Uri | undefined {
    const folder = getDefaultWorkspaceConfigLocation(docUri);
    return folder && Uri.joinPath(folder, baseConfigName);
}

function getDefaultWorkspaceConfigLocation(docUri?: Uri): Uri | undefined {
    const defaultFolderUri = docUri && vscode.workspace.getWorkspaceFolder(docUri)?.uri;
    return defaultFolderUri || workspace.workspaceFolders?.[0]?.uri;
}

export function hasWorkspaceLocation(): boolean {
    return !!workspace.workspaceFile || !!workspace.workspaceFolders?.[0];
}

/**
 * Returns a list of files in the order of Best to Worst Match.
 * @param docUri
 */
export function findSettingsFiles(docUri?: Uri, isUpdatable?: boolean): Promise<Uri[]> {
    const { workspaceFolders } = workspace;
    if (!workspaceFolders || !hasWorkspaceLocation()) {
        return Promise.resolve([]);
    }

    const folders = docUri ? [workspace.getWorkspaceFolder(docUri)].filter(isDefined).concat(workspaceFolders) : workspaceFolders;

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
            .filter((uri) => !isUpdatable || isUpdateSupportedForConfigFileFormat(uri))
    );
}

export function findExistingSettingsFileLocation(docUri?: Uri, isUpdatable?: boolean): Promise<Uri | undefined> {
    return findSettingsFiles(docUri, isUpdatable).then((paths) => paths[0]);
}

export function findSettingsFileLocation(isUpdatable?: boolean): Promise<Uri | undefined> {
    return findExistingSettingsFileLocation(undefined, isUpdatable).then((path) => path || getDefaultWorkspaceConfigFile());
}

export function loadTheSettingsFile(): Promise<SettingsInfo | undefined> {
    return findSettingsFileLocation().then(loadSettingsFile);
}

export function loadSettingsFile(path: Uri | undefined): Promise<SettingsInfo | undefined> {
    return path ? readSettings(path).then((settings) => (path ? { path, settings } : undefined)) : Promise.resolve(undefined);
}

export function setEnableSpellChecking(target: config.ConfigTarget, enabled: boolean): Promise<void> {
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

export function addIgnoreWordToSettings(target: config.ConfigTarget, word: string): Promise<boolean> {
    const addWords = normalizeWords(word);
    return updateSettingInConfig('ignoreWords', target, (words) => unique(addWords.concat(words || []).sort()), true);
}

export async function removeWordFromSettings(target: config.ConfigTarget, word: string): Promise<boolean> {
    const useGlobal = config.isGlobalTarget(target);
    const section: 'userWords' | 'words' = useGlobal ? 'userWords' : 'words';
    const toRemove = normalizeWords(word);
    return updateSettingInConfig(section, target, (words) => filterOutWords(words || [], toRemove), true);
}

export function toggleEnableSpellChecker(target: config.ConfigTarget): Promise<void> {
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
export function disableCurrentLanguage(): Promise<void> {
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
    const values = new Set(currentValues || []);
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
            vscode.workspace.workspaceFolders?.length &&
            (await enableLanguageIdForTarget(languageId, enable, config.ConfigurationTarget.Workspace, false, forceUpdateVSCode))
        ) {
            return;
        }

        // Apply it to User settings.
        await enableLanguageIdForTarget(languageId, enable, config.ConfigurationTarget.Global, true, forceUpdateVSCode);
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
        cfgTarget !== config.ConfigurationTarget.Global &&
        workspace.workspaceFolders &&
        (cfgTarget === config.ConfigurationTarget.WorkspaceFolder || workspace.workspaceFolders.length === 1)
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
        (updateCSpell && !config.isGlobalLevelTarget(target) && (await findExistingSettingsFileLocation(uri, true))) || undefined;

    async function updateConfig(): Promise<false | Result> {
        if (create || (orig.value !== undefined && orig.scope === config.extractScope(scope))) {
            const newValue = applyFn(orig.value);
            await config.setSettingInVSConfig(section, newValue, target);
            return { value: newValue };
        }
        return false;
    }

    async function updateCSpellFile(settingsFilename: Uri | undefined, defaultValue: CSpellUserSettings[K] | undefined): Promise<boolean> {
        if (!settingsFilename) return false;
        await readSettingsFileAndApplyUpdate(settingsFilename, (settings: CSpellUserSettings) => {
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

export function resolveTarget(target: config.ConfigurationTarget, docUri?: null | Uri): config.ConfigTarget {
    if (target === config.ConfigurationTarget.Global || !hasWorkspaceLocation()) {
        return config.ConfigurationTarget.Global;
    }

    if (!docUri) {
        return config.ConfigurationTarget.Workspace;
    }
    return config.createTargetForUri(target, docUri);
}

export async function determineSettingsPaths(target: config.ConfigTarget, docUri: Uri | undefined, docConfigFiles?: Uri[]): Promise<Uri[]> {
    if (config.isWorkspaceLevelTarget(target)) {
        const files = await findSettingsFiles(undefined, true);
        const cfgFileSet = new Set(docConfigFiles?.map((u) => u.toString()) || []);
        const filtered = cfgFileSet.size ? files.filter((u) => cfgFileSet.has(u.toString())) : files;
        const found = filtered.length ? filtered : docConfigFiles?.slice(0, 1) || [];
        return found;
    }

    if (docConfigFiles?.length) {
        return [docConfigFiles[0]];
    }

    const useUri = docUri || undefined;
    const path = await findExistingSettingsFileLocation(useUri, true);
    return path ? [path] : [];
}

const settingsFileTemplate: CSpellSettings = {
    version: '0.2',
    ignorePaths: [],
    dictionaryDefinitions: [],
    dictionaries: [],
    words: [],
    ignoreWords: [],
    import: [],
};

export async function createConfigFileInFolder(folder: Uri, overwrite?: boolean): Promise<Uri | undefined> {
    const fileUri = Uri.joinPath(folder, defaultFileName);

    if (!overwrite && (await fileExists(fileUri))) {
        const overwrite = 'Overwrite';
        const choice = await vscode.window.showWarningMessage('Configuration file already exists.', { modal: true }, overwrite);
        if (choice !== overwrite) {
            return undefined;
        }
    }

    await writeConfigFile(fileUri, settingsFileTemplate);

    return fileUri;
}

export async function createConfigFileRelativeToDocumentUri(referenceDocUri?: Uri, overwrite?: boolean): Promise<Uri | undefined> {
    const folder = getDefaultWorkspaceConfigLocation(referenceDocUri);
    const refDocFolder = referenceDocUri && Uri.joinPath(referenceDocUri, '..');

    const location = folder || refDocFolder;
    if (!location || location.scheme !== 'file') throw new Error('Unable to determine location for configuration file.');

    return createConfigFileInFolder(location, overwrite);
}

performance.mark('settings.ts done');
