import { workspace } from 'vscode';
import { CSpellUserSettings } from '../server';

const sectionCSpell = 'cSpell';

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

