import type { CSpellUserSettings } from '../client';

/**
 * An update function returns the fields to be updated. To remove a field, make it undefined: `{ description: undefined }`
 * Note it is only a top level merge. The update function uses `Object.assign`.
 */
export type ConfigUpdateFn = (cfg: Partial<CSpellUserSettings>) => Partial<CSpellUserSettings>;

type ConfigKeys = keyof CSpellUserSettings;

export interface ConfigReaderWriter {
    read<K extends ConfigKeys>(keys: readonly K[]): Promise<Pick<CSpellUserSettings, K>>;
    write(settings: CSpellUserSettings): Promise<void>;
    update<K extends ConfigKeys>(fn: ConfigUpdateFn, keys: readonly K[]): Promise<void>;
}

export function extractKeys<K extends ConfigKeys>(s: CSpellUserSettings, keys: K[]): Pick<CSpellUserSettings, K> {
    const r: Partial<CSpellUserSettings> = {};

    for (const k of keys) {
        r[k] = s[k];
    }

    return r;
}
