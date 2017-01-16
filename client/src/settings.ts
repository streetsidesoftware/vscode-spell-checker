import { CSpellUserSettings } from './CSpellSettings';
import * as CSpellSettings from './CSpellSettings';
import { workspace } from 'vscode';
import * as Rx from 'rxjs/Rx';
import * as path from 'path';

export const baseConfigName        = CSpellSettings.defaultFileName;
export const configFileWatcherGlob = `**/{${baseConfigName},${baseConfigName.toLowerCase()}}`;
const possibleConfigPaths   = [
    baseConfigName,
    baseConfigName.toLowerCase(),
    '.vscode' + baseConfigName,
    '.vscode' + baseConfigName.toLowerCase()
].join(',');
export const findConfig            = `{${possibleConfigPaths}}`;


export interface SettingsInfo {
    path: string;
    settings: CSpellUserSettings;
}

export function getDefaultWorkspaceConfigLocation() {
    const { rootPath } = workspace;
    return rootPath
        ? path.join(rootPath, baseConfigName)
        : undefined;
}

export function getSettingsFromConfig(): CSpellUserSettings {
    const config = workspace.getConfiguration();
    return config.get<CSpellUserSettings>('cSpell') || {};
}

export function getSettings(): Rx.Observable<SettingsInfo> {
    return Rx.Observable.fromPromise(Promise.resolve(workspace.findFiles(findConfig, '{**/node_modules,**/.git}')))
        .flatMap(matches => {
            if (!matches || !matches.length) {
                const defaultSettings = CSpellSettings.getDefaultSettings();
                const { language = defaultSettings.language } = getSettingsFromConfig();
                const settings = { ...defaultSettings, language };
                return Rx.Observable.of(getDefaultWorkspaceConfigLocation())
                    .map(path => (<SettingsInfo>{ path, settings}));
            } else {
                const path = matches[0].fsPath;
                return Rx.Observable.fromPromise(CSpellSettings.readSettings(path))
                    .map(settings => (<SettingsInfo>{ path, settings }));
            }
        });
}

export function setEnableSpellChecking(enabled: boolean) {
    workspace.getConfiguration().update('cSpell.enabled', enabled);
}

