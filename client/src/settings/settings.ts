import { CSpellUserSettings, normalizeLocal } from '../server';
import * as CSpellSettings from './CSpellSettings';
import { workspace } from 'vscode';
import * as path from 'path';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import { unique, uniqueFilter } from '../util';
import * as watcher from '../util/watcher';
import * as config from './config';
import * as Rx from 'rxjs/Rx';
import * as fs from 'fs-extra';


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
    const d = Rx.Observable.interval(10000)
        .flatMap(findSettingsFiles)
        .flatMap(a => a)
        .map(uri => uri.fsPath)
        .filter(file => !watcher.isWatching(file))
        .subscribe(file => watcher.add(file, callback));

    return vscode.Disposable.from({ dispose: () => {
        watcher.dispose();
        d.unsubscribe();
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

export function findSettingsFiles(): Thenable<Uri[]> {
    const { workspaceFolders } = workspace;
    if (!workspaceFolders || !hasWorkspaceLocation()) {
        return Promise.resolve([]);
    }

    const possibleLocations = workspaceFolders
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

export function findExistingSettingsFileLocation(): Thenable<string | undefined> {
    return findSettingsFiles()
    .then(uris => uris.map(uri => uri.fsPath))
    .then(paths => paths.sort((a, b) => a.length - b.length))
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


export function getSettings(): Thenable<SettingsInfo> {
    return loadTheSettingsFile()
        .then(info => {
            if (!info) {
                const defaultSettings = CSpellSettings.getDefaultSettings();
                const { language = defaultSettings.language } = config.getSettingsFromVSConfig();
                const settings = { ...defaultSettings, language };
                const path = getDefaultWorkspaceConfigLocation() || '';
                return { path, settings};
            }
            return info;
        });
}

export function setEnableSpellChecking(enabled: boolean, isGlobal: boolean): Thenable<void> {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    return config.setSettingInVSConfig('enabled', enabled, useGlobal);
}

export function getEnabledLanguagesFromAllConfigs() {
    const inspect = config.inspectSettingFromVSConfig('enabledLanguageIds');
    return inspect;
}

export function getEnabledLanguagesFromConfig(isGlobal: boolean) {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    const inspect = getEnabledLanguagesFromAllConfigs() || {key: ''};
    return (useGlobal ? undefined : inspect.workspaceValue) || inspect.globalValue || inspect.defaultValue || [];
}

export function enableLanguageIdInConfig(isGlobal: boolean, languageId: string): Thenable<string[]> {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    const langs = unique([languageId, ...getEnabledLanguagesFromConfig(useGlobal)]).sort();
    return config.setSettingInVSConfig('enabledLanguageIds', langs, useGlobal).then(() => langs);
}

export function disableLanguageIdInConfig(isGlobal: boolean, languageId: string): Thenable<string[]> {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    const langs = getEnabledLanguagesFromConfig(useGlobal).filter(a => a !== languageId).sort();
    return config.setSettingInVSConfig('enabledLanguageIds', langs, useGlobal).then(() => langs);
}

/**
 * @description Enable a programming language
 * @param isGlobal - true: User settings, false: workspace settings
 * @param languageId
 */
export function enableLanguage(isGlobal: boolean, languageId: string): Thenable<void> {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    return enableLanguageIdInConfig(useGlobal, languageId).then(() => {
        if (!useGlobal) {
            findExistingSettingsFileLocation()
            .then(settingsFilename =>
                settingsFilename && CSpellSettings.writeAddLanguageIdsToSettings(settingsFilename, [languageId], true))
            .then(() => {});
        }
    });
}

export function disableLanguage(isGlobal: boolean, languageId: string): Thenable<void> {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    return disableLanguageIdInConfig(useGlobal, languageId).then(() => {
        if (!useGlobal) {
            return findExistingSettingsFileLocation()
            .then(settingsFilename =>
                settingsFilename && CSpellSettings.removeLanguageIdsFromSettingsAndUpdate(settingsFilename, [languageId])
            )
            .then(() => {});
        }
    });
}

export function addWordToSettings(isGlobal: boolean, word: string): Thenable<void> {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    const section: 'userWords' | 'words' = useGlobal ? 'userWords' : 'words';
    const words = config.getSettingFromVSConfig(section) || [];
    return config.setSettingInVSConfig(section, unique(words.concat(word.split(' ')).sort()), useGlobal);
}

export function toggleEnableSpellChecker(): Thenable<void> {
    const curr = config.getSettingFromVSConfig('enabled');
    return config.setSettingInVSConfig('enabled', !curr, false);
}

/**
 * Enables the current programming language of the active file in the editor.
 */
export function enableCurrentLanguage(): Thenable<void> {
    const editor = vscode.window && vscode.window.activeTextEditor;
    if (editor && editor.document && editor.document.languageId) {
        return enableLanguage(false, editor.document.languageId);
    }
    return Promise.resolve();
}

/**
 * Disables the current programming language of the active file in the editor.
 */
export function disableCurrentLanguage(): Thenable<void> {
    const editor = vscode.window && vscode.window.activeTextEditor;
    if (editor && editor.document && editor.document.languageId) {
        return disableLanguage(false, editor.document.languageId);
    }
    return Promise.resolve();
}


export function enableLocal(isGlobal: boolean, local: string) {
    const currentLanguage = config.getSettingFromVSConfig(
        'language',
        isGlobal ? 'globalValue' : 'workspaceValue'
    ) || '';
    const languages = currentLanguage.split(',')
        .concat(local.split(','))
        .map(a => a.trim())
        .filter(uniqueFilter())
        .join(',');
    return config.setSettingInVSConfig('language', languages, isGlobal);
}

export function disableLocal(isGlobal: boolean, local: string) {
    local = normalizeLocal(local);
    const currentLanguage = config.getSettingFromVSConfig(
        'language',
        isGlobal ? 'globalValue' : 'workspaceValue'
    ) || '';
    const languages = normalizeLocal(currentLanguage)
        .split(',')
        .filter(lang => lang !== local)
        .join(',') || undefined;
    return config.setSettingInVSConfig('language', languages, isGlobal);
}

export function overrideLocal(enable: boolean, isGlobal: boolean) {
    const inspectLang = config.inspectSettingFromVSConfig('language');

    const lang = enable && inspectLang
        ? (isGlobal ? inspectLang.defaultValue : inspectLang.globalValue || inspectLang.defaultValue )
        : undefined ;

    return config.setSettingInVSConfig('language', lang, isGlobal);
}

export function updateSettings(isGlobal: boolean, settings: CSpellUserSettings) {
    const keys = Object.keys(settings) as (keyof CSpellUserSettings)[];
    return Promise.all(keys.map(key => config.setSettingInVSConfig(key, settings[key], isGlobal)));
}
