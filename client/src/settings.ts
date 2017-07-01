import { CSpellUserSettings } from './CSpellSettings';
import * as CSpellSettings from './CSpellSettings';
import { workspace } from 'vscode';
import * as path from 'path';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import { unique } from './util';

export const baseConfigName        = CSpellSettings.defaultFileName;
export const configFileWatcherGlob = `**/{${baseConfigName},${baseConfigName.toLowerCase()}}`;
// This are in preferred order.
const possibleConfigPaths   = [
    baseConfigName,
    baseConfigName.toLowerCase(),
    path.join('.vscode', baseConfigName),
    path.join('.vscode', baseConfigName.toLowerCase()),
].join(',');

const sectionCSpell                   = 'cSpell';

export const findConfig            = `{${possibleConfigPaths}}`;

export interface SettingsInfo {
    path: string;
    settings: CSpellUserSettings;
}

export function getDefaultWorkspaceConfigLocation() {
    const { rootPath } = workspace;
    return rootPath
        ? path.join(rootPath, '.vscode', baseConfigName)
        : undefined;
}

export function hasWorkspaceLocation() {
    return !!workspace.rootPath;
}

export function getSectionName(subSection?: keyof CSpellUserSettings): string {
    return [sectionCSpell, subSection].filter(a => !!a).join('.');
}

export function getSettingsFromConfig(): CSpellUserSettings {
    const config = workspace.getConfiguration();
    return config.get<CSpellUserSettings>(sectionCSpell) || {};
}

export function getSettingFromConfig<K extends keyof CSpellUserSettings>(subSection: K): CSpellUserSettings[K] {
    const section = getSectionName(subSection);
    const config = workspace.getConfiguration();
    return config.get<CSpellUserSettings[K]>(section);
}

export function inspectSettingFromConfig<K extends keyof CSpellUserSettings>(subSection: K) {
    const section = getSectionName(subSection);
    const config = workspace.getConfiguration();
    return config.inspect<CSpellUserSettings[K]>(section);
}

export function setCSpellConfigSetting<K extends keyof CSpellUserSettings>(
    subSection: K, value: CSpellUserSettings[K], isGlobal: boolean
): Thenable<void> {
    const section = getSectionName(subSection);
    const config = workspace.getConfiguration();
    return config.update(section, value, isGlobal);
}

export function findSettingsFiles(): Thenable<Uri[]> {
    return workspace.findFiles(findConfig, '{**/node_modules,**/.git}');
}

export function findSettingsFileLocation(): Thenable<string> {
    return findSettingsFiles()
        .then(uris => uris.map(uri => uri.fsPath))
        .then(paths => paths.sort((a, b) => a.length - b.length))
        .then(paths => paths[0] || getDefaultWorkspaceConfigLocation());
}

export function loadTheSettingsFile(): Thenable<SettingsInfo | undefined> {
    return findSettingsFileLocation()
        .then(path => {
            return path ? CSpellSettings.readSettings(path).then(settings => (path ? { path, settings } : undefined)) : undefined;
        });
}

export function getSettings(): Thenable<SettingsInfo> {
    return loadTheSettingsFile()
        .then(info => {
            if (!info) {
                const defaultSettings = CSpellSettings.getDefaultSettings();
                const { language = defaultSettings.language } = getSettingsFromConfig();
                const settings = { ...defaultSettings, language };
                const path = getDefaultWorkspaceConfigLocation();
                return { path, settings};
            }
            return info;
        });
}

export function setEnableSpellChecking(enabled: boolean, isGlobal: boolean): Thenable<void> {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    return setCSpellConfigSetting('enabled', enabled, useGlobal);
}

export function getEnabledLanguagesFromAllConfigs() {
    const inspect = inspectSettingFromConfig('enabledLanguageIds');
    return inspect;
}

export function getEnabledLanguagesFromConfig(isGlobal: boolean) {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    const inspect = getEnabledLanguagesFromAllConfigs() || {key: ''};
    return (useGlobal ? undefined : inspect.workspaceValue) || inspect.globalValue || inspect.defaultValue || [];
}

function enableLanguageIdInConfig(isGlobal: boolean, languageId: string): Thenable<string[]> {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    const langs = unique([languageId, ...getEnabledLanguagesFromConfig(useGlobal)]).sort();
    return setCSpellConfigSetting('enabledLanguageIds', langs, useGlobal).then(() => langs);
}

function disableLanguageIdInConfig(isGlobal: boolean, languageId: string): Thenable<string[]> {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    const langs = getEnabledLanguagesFromConfig(useGlobal).filter(a => a !== languageId).sort();
    return setCSpellConfigSetting('enabledLanguageIds', langs, useGlobal).then(() => langs);
}

export function enableLanguage(isGlobal: boolean, languageId: string): Thenable<void> {
    const useGlobal = isGlobal || !hasWorkspaceLocation();
    return enableLanguageIdInConfig(useGlobal, languageId).then(() => {
        if (!useGlobal) {
            findSettingsFileLocation()
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
            return findSettingsFileLocation()
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
    const words = getSettingFromConfig(section) || [];
    return setCSpellConfigSetting(section, unique(words.concat([word]).sort()), useGlobal);
}

export function toggleEnableSpellChecker(): Thenable<void> {
    const curr = getSettingFromConfig('enabled');
    return setCSpellConfigSetting('enabled', !curr, false);
}

export function enableCurrentLanguage(): Thenable<void> {
    const editor = vscode.window && vscode.window.activeTextEditor;
    if (editor && editor.document && editor.document.languageId) {
        return enableLanguage(false, editor.document.languageId);
    }
    return Promise.resolve();
}

export function disableCurrentLanguage(): Thenable<void> {
    const editor = vscode.window && vscode.window.activeTextEditor;
    if (editor && editor.document && editor.document.languageId) {
        return disableLanguage(false, editor.document.languageId);
    }
    return Promise.resolve();
}
