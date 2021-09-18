import { CSpellUserSettings } from '../client';

export type ConfigKeys = keyof CSpellUserSettings;

/**
 * Configuration Update function that returns only the fields that need to be updated.
 */
export type ConfigUpdateFn<K extends ConfigKeys> = (cfg: Pick<CSpellUserSettings, K>) => Partial<CSpellUserSettings>;

export type UpdateConfigFieldFn<K extends keyof CSpellUserSettings> = (value: CSpellUserSettings[K]) => CSpellUserSettings[K];

export interface ConfigUpdater<K extends ConfigKeys> {
    updateFn: ConfigUpdateFn<K>;
    keys: K[];
}

export function configUpdaterForKey<K extends ConfigKeys>(key: K, value: CSpellUserSettings[K]): ConfigUpdater<K>;
export function configUpdaterForKey<K extends ConfigKeys>(key: K, updateFieldFn: UpdateConfigFieldFn<K>): ConfigUpdater<K>;
export function configUpdaterForKey<K extends ConfigKeys>(key: K, updateFnOrValue: CSpellUserSettings[K] | UpdateConfigFieldFn<K>): ConfigUpdater<K>;
export function configUpdaterForKey<K extends ConfigKeys>(key: K, updateFnOrValue: CSpellUserSettings[K] | UpdateConfigFieldFn<K>): ConfigUpdater<K> {
    const fn = updateConfigByKeyFn(key, updateFnOrValue);
    const keys: [K] = [key];
    return {
        updateFn: (cfg) => ({ [key]: fn(cfg[key]) }),
        keys,
    };
}

export function configUpdaterForKeys<K extends ConfigKeys>(keys: K[], value: Pick<CSpellUserSettings, K>): ConfigUpdater<K>;
export function configUpdaterForKeys<K extends ConfigKeys>(keys: K[], updateFn: ConfigUpdateFn<K>): ConfigUpdater<K>;
export function configUpdaterForKeys<K extends ConfigKeys>(keys: K[], updateFn: Pick<CSpellUserSettings, K> | ConfigUpdateFn<K>): ConfigUpdater<K>;
export function configUpdaterForKeys<K extends ConfigKeys>(keys: K[], updateFn: Pick<CSpellUserSettings, K> | ConfigUpdateFn<K>): ConfigUpdater<K> {
    const fn: ConfigUpdateFn<K> = typeof updateFn === 'function' ? updateFn : () => updateFn;
    return {
        updateFn: fn,
        keys,
    };
}

function updateConfigByKeyFn<K extends keyof CSpellUserSettings>(_key: K, updateFnOrValue: CSpellUserSettings[K] | UpdateConfigFieldFn<K>): UpdateConfigFieldFn<K> {
    if (typeof updateFnOrValue === 'function') {
        return updateFnOrValue;
    }

    return () => updateFnOrValue;
}
