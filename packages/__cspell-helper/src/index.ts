import type { CSpellSettings } from '@cspell/cspell-types';
import { getDefaultSettings, getGlobalSettings, mergeSettings, searchForConfig } from 'cspell-lib';

export interface CSpellExports {
    getDefaultSettings(useDefaultDicts?: boolean): CSpellSettings;
    getGlobalSettings(): CSpellSettings;
    mergeSettings(left: CSpellSettings, ...rest: CSpellSettings[]): CSpellSettings;
    searchForConfig(fromFile?: string): Promise<CSpellSettings | undefined>;
}

export async function importCSpellLib(): Promise<CSpellExports> {
    return {
        getDefaultSettings,
        getGlobalSettings,
        mergeSettings,
        searchForConfig,
    };
}
