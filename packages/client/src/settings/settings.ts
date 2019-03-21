import { performance } from '../util/perf';
performance.mark('settings.ts');
import { CSpellUserSettings, normalizeLocal } from '../server';
import * as CSpellSettings from './CSpellSettings';
import { workspace, ConfigurationTarget } from 'vscode';
performance.mark('settings.ts imports 1');
import * as path from 'path';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
performance.mark('settings.ts imports 2');
import { unique, uniqueFilter } from '../util';
import * as watcher from '../util/watcher';
import * as config from './config';
performance.mark('settings.ts imports 3');
import * as fs from 'fs-extra';
import { InspectScope } from './config';
performance.mark('settings.ts imports 4');
performance.mark('settings.ts imports done');

export { ConfigTarget, InspectScope, Scope } from './config';


export const baseConfigName        = CSpellSettings.defaultFileName;
export const configFileLocations = [
    baseConfigName,
    baseConfigName.toLowerCase(),
    `.vscode/${baseConfigName}`,
    `.vscode/${baseConfigName.toLowerCase()}`,
];

export const findConfig = `.vscode/{${baseConfigName},${baseConfigName.toLowerCase()}}`;

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
            .map(uri => uri.fsPath)
            .filter(file => !watcher.isWatching(file))
            .forEach(file => watcher.add(file, callback));
        busy = false;
    }, 10000);

    return vscode.Disposable.from({ dispose: () => {
        watcher.dispose();
        clearInterval(intervalObj);
    } });
}

export function getDefaultWorkspaceConfigLocation() {
    const { workspaceFolders } = workspace;
    const root = workspaceFolders
        && workspaceFolders[0]
        && workspaceFolders[0].uri.fsPath;
    return root
        ? path.join(root, '.vscode', baseConfigName)
        : undefined;
}

export function hasWorkspaceLocation() {
    const { workspaceFolders } = workspace;
    return !!(workspaceFolders && workspaceFolders[0]);
}

export function findSettingsFiles(uri?: Uri): Thenable<Uri[]> {
    const { workspaceFolders } = workspace;
    if (!workspaceFolders || !hasWorkspaceLocation()) {
        return Promise.resolve([]);
    }

    const folders = uri
        ? [workspace.getWorkspaceFolder(uri)!].filter(a => !!a)
        : workspaceFolders;

    const possibleLocations = folders
        .map(folder => folder.uri.fsPath)
        .map(root => configFileLocations.map(rel => path.join(root, rel)))
        .reduce((a, b) => a.concat(b));

    const found = possibleLocations
        .map(filename => fs.pathExists(filename)
        .then(exists => ({ filename, exists })));

    return Promise.all(found).then(found => found
        .filter(found => found.exists)
        .map(found => found.filename)
        .map(filename => Uri.file(filename))
    );
}

export function findExistingSettingsFileLocation(uri?: Uri): Thenable<string | undefined> {
    return findSettingsFiles(uri)
    .then(uris => uris.map(uri => uri.fsPath))
    .then(paths => paths[0]);
}

export function findSettingsFileLocation(): Thenable<string | undefined> {
    return findExistingSettingsFileLocation()
        .then(path => path || getDefaultWorkspaceConfigLocation());
}

export function loadTheSettingsFile(): Thenable<SettingsInfo | undefined> {
    return findSettingsFileLocation()
        .then(loadSettingsFile);
}

export function loadSettingsFile(path: string): Thenable<SettingsInfo | undefined> {
    return path
        ? CSpellSettings.readSettings(path).then(settings => (path ? { path, settings } : undefined))
        : Promise.resolve(undefined);
}

export function setEnableSpellChecking(target: config.ConfigTarget, enabled: boolean): Thenable<void> {
    return config.setSettingInVSConfig('enabled', enabled, target);
}

export function getEnabledLanguagesFromConfig(scope: InspectScope) {
    return config.getScopedSettingFromVSConfig('enabledLanguageIds', scope) || [];
}

export function enableLanguageIdInConfig(target: config.ConfigTarget, languageId: string): Thenable<string[]> {
    const scope = config.configTargetToScope(target);
    const langs = unique([languageId, ...getEnabledLanguagesFromConfig(scope)]).sort();
    return config.setSettingInVSConfig('enabledLanguageIds', langs, target).then(() => langs);
}

export function disableLanguageIdInConfig(target: config.ConfigTarget, languageId: string): Thenable<string[]> {
    const scope = config.configTargetToScope(target);
    const langs = getEnabledLanguagesFromConfig(scope).filter(a => a !== languageId).sort();
    return config.setSettingInVSConfig('enabledLanguageIds', langs, target).then(() => langs);
}

/**
 * @description Enable a programming language
 * @param target - which level of setting to set
 * @param languageId - the language id, e.g. 'typescript'
 */
export async function enableLanguage(target: config.ConfigTarget, languageId: string): Promise<void> {
    const updateFile = config.isFolderLevelTarget(target);
    await enableLanguageIdInConfig(target, languageId);
    if (config.isConfigTargetWithResource(target) && updateFile) {
        const settingsFilename = await findExistingSettingsFileLocation(target.uri);
        settingsFilename && await CSpellSettings.writeAddLanguageIdsToSettings(settingsFilename, [languageId], true);
    }
}

export async function disableLanguage(target: config.ConfigTarget, languageId: string): Promise<void> {
    const updateFile = config.isFolderLevelTarget(target);
    await disableLanguageIdInConfig(target, languageId);
    if (config.isConfigTargetWithResource(target) && updateFile) {
        const settingsFilename = await findExistingSettingsFileLocation(target.uri);
        settingsFilename && await CSpellSettings.removeLanguageIdsFromSettingsAndUpdate(settingsFilename, [languageId]);
    }
}

export function addWordToSettings(target: config.ConfigTarget, word: string): Thenable<void> {
    const useGlobal = config.isGlobalTarget(target) || !hasWorkspaceLocation();
    target = useGlobal ? config.ConfigurationTarget.Global : target;
    const section: 'userWords' | 'words' = useGlobal ? 'userWords' : 'words';
    const words = config.inspectScopedSettingFromVSConfig(section, config.configTargetToScope(target)) || [];
    return config.setSettingInVSConfig(section, unique(words.concat(word.split(' ')).sort()), target);
}

export function removeWordFromSettings(target: config.ConfigTarget, word: string): Thenable<void> {
    const useGlobal = config.isGlobalTarget(target);
    if (!useGlobal && !hasWorkspaceLocation()) {
        return Promise.resolve();
    }
    target = useGlobal ? config.ConfigurationTarget.Global : target;
    const section: 'userWords' | 'words' = useGlobal ? 'userWords' : 'words';
    const toRemove = word.split(' ');
    const words = config.inspectScopedSettingFromVSConfig(section, config.configTargetToScope(target)) || [];
    const wordsFiltered = CSpellSettings.filterOutWords(words, toRemove);
    return config.setSettingInVSConfig(section, wordsFiltered, target);
}

export function toggleEnableSpellChecker(target: config.ConfigTarget): Thenable<void> {
    const resource = config.isConfigTargetWithResource(target) ? target.uri : null;
    const curr = config.getSettingFromVSConfig('enabled', resource);
    return config.setSettingInVSConfig('enabled', !curr, target);
}

/**
 * Enables the current programming language of the active file in the editor.
 */
export function enableCurrentLanguage(): Thenable<void> {
    const editor = vscode.window && vscode.window.activeTextEditor;
    if (editor && editor.document && editor.document.languageId) {
        const target = config.createTargetForDocument(ConfigurationTarget.WorkspaceFolder, editor.document);
        return enableLanguage(target, editor.document.languageId);
    }
    return Promise.resolve();
}

/**
 * Disables the current programming language of the active file in the editor.
 */
export function disableCurrentLanguage(): Thenable<void> {
    const editor = vscode.window && vscode.window.activeTextEditor;
    if (editor && editor.document && editor.document.languageId) {
        const target = config.createTargetForDocument(ConfigurationTarget.WorkspaceFolder, editor.document);
        return disableLanguage(target, editor.document.languageId);
    }
    return Promise.resolve();
}


export function enableLocal(target: config.ConfigTarget, local: string) {
    const scope = config.configTargetToScope(target);
    const currentLanguage = config.getScopedSettingFromVSConfig(
        'language',
        scope,
    ) || '';
    const languages = currentLanguage.split(',')
        .concat(local.split(','))
        .map(a => a.trim())
        .filter(uniqueFilter())
        .join(',');
    return config.setSettingInVSConfig('language', languages, target);
}

export function disableLocal(target: config.ConfigTarget, local: string) {
    const scope = config.configTargetToScope(target);
    local = normalizeLocal(local);
    const currentLanguage = config.inspectScopedSettingFromVSConfig(
        'language',
        scope,
    ) || '';
    const languages = normalizeLocal(currentLanguage)
        .split(',')
        .filter(lang => lang !== local)
        .join(',') || undefined;
    return config.setSettingInVSConfig('language', languages, target);
}

export function overrideLocal(enable: boolean, target: config.ConfigTarget) {
    const inspectLang = config.getScopedSettingFromVSConfig(
        'language',
        config.configTargetToScope(target)
    );

    const lang = (enable && inspectLang) || undefined;

    return config.setSettingInVSConfig('language', lang, target);
}

performance.mark('settings.ts done');
