import { workspace } from 'vscode';
import { CSpellUserSettings } from '../server';

const sectionCSpell = 'cSpell';

export function getSectionName(subSection?: keyof CSpellUserSettings): string {
    return [sectionCSpell, subSection].filter(a => !!a).join('.');
}

export function getSettingsFromVSConfig(): CSpellUserSettings {
    const config = workspace.getConfiguration();
    return config.get<CSpellUserSettings>(sectionCSpell) || {};
}

export function getSettingFromVSConfig<K extends keyof CSpellUserSettings>(subSection: K): CSpellUserSettings[K] {
    const section = getSectionName(subSection);
    const config = workspace.getConfiguration();
    return config.get<CSpellUserSettings[K]>(section);
}

export function inspectSettingFromVSConfig<K extends keyof CSpellUserSettings>(subSection: K) {
    const section = getSectionName(subSection);
    const config = workspace.getConfiguration();
    return config.inspect<CSpellUserSettings[K]>(section);
}

export function setSettingInVSConfig<K extends keyof CSpellUserSettings>(
    subSection: K, value: CSpellUserSettings[K], isGlobal: boolean
): Thenable<void> {
    const section = getSectionName(subSection);
    const config = workspace.getConfiguration();
    return config.update(section, value, isGlobal);
}

