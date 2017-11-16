import { workspace, Uri } from 'vscode';
import { CSpellUserSettings } from '../server';
export { CSpellUserSettings } from '../server';


const sectionCSpell = 'cSpell';

export interface InspectValues<T> {
    defaultValue?: T;
    globalValue?: T;
    workspaceValue?: T;
    workspaceFolderValue?: T;
}

export interface Inspect<T> extends InspectValues<T> {
    key: string;
}

export type SettingScope = keyof InspectValues<CSpellUserSettings> | 'value';

let config: Inspect<CSpellUserSettings> = inspectConfig();

workspace.onDidChangeConfiguration(() => {
    config = inspectConfig();
});

export type InspectResult<T> = Inspect<T> | undefined;

export function getSectionName(subSection?: keyof CSpellUserSettings): string {
    return [sectionCSpell, subSection].filter(a => !!a).join('.');
}

export function getSettingsFromVSConfig(resource?: Uri): CSpellUserSettings {
    const config = workspace.getConfiguration(undefined, resource);
    return config.get<CSpellUserSettings>(sectionCSpell, {});
}

export function getSettingFromVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K, source?: SettingScope
): CSpellUserSettings[K] {
    if (!source || source === 'value') {
        const section = getSectionName(subSection);
        const config = workspace.getConfiguration();
        return config.get<CSpellUserSettings[K]>(section);
    }
    const ins = inspectSettingFromVSConfig(subSection);
    return ins && ins[source];
}

export function inspectSettingFromVSConfig<K extends keyof CSpellUserSettings>(subSection: K): Inspect<CSpellUserSettings[K]> {
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
    subSection: K, value: CSpellUserSettings[K], isGlobal: boolean
): Thenable<void> {
    shadowSetSetting(subSection, value, isGlobal);
    const section = getSectionName(subSection);
    const config = workspace.getConfiguration();
    return config.update(section, value, isGlobal);
}

function shadowSetSetting<K extends keyof CSpellUserSettings>(
    subSection: K, value: CSpellUserSettings[K], isGlobal: boolean
) {
    const scope: SettingScope = isGlobal ? 'globalValue' : 'workspaceValue';
    const curr = config[scope] || {};
    config[scope] = { ...curr, [subSection]: value };
    return config[scope];
}

export function inspectConfig(resource?: Uri): Inspect<CSpellUserSettings> {
    const config = workspace.getConfiguration(undefined, resource);
    return config.inspect<CSpellUserSettings>(sectionCSpell) || { key: '' };
}
