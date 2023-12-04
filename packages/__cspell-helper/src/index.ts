import type { CSpellSettings } from '@cspell/cspell-types';
import { getDefaultSettings, getGlobalSettingsAsync, mergeSettings, searchForConfig } from 'cspell-lib';

export interface CSpellExports {
    getDefaultSettings(useDefaultDicts?: boolean): Promise<CSpellSettings>;
    getGlobalSettings(): Promise<CSpellSettings>;
    mergeSettings(left: CSpellSettings, ...rest: CSpellSettings[]): CSpellSettings;
    searchForConfig(fromFile?: string): Promise<CSpellSettings | undefined>;
}

export async function importCSpellLib(): Promise<CSpellExports> {
    return {
        getDefaultSettings,
        getGlobalSettings: getGlobalSettingsAsync,
        mergeSettings,
        searchForConfig,
    };
}
