import { CSpellUserSettings } from '../server';

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
export function configUpdaterForKey<K extends ConfigKeys>(
    key: K,
    updateFnOrValue: CSpellUserSettings[K] | UpdateConfigFieldFn<K>
): ConfigUpdater<K>;
export function configUpdaterForKey<K extends ConfigKeys>(
    key: K,
    updateFnOrValue: CSpellUserSettings[K] | UpdateConfigFieldFn<K>
): ConfigUpdater<K> {
    const fn = updateConfigByKeyFn(key, updateFnOrValue);
    const keys: [K] = [key];
    return {
        updateFn: (cfg) => ({ [key]: fn(cfg[key]) }),
        keys,
    };
}

function updateConfigByKeyFn<K extends keyof CSpellUserSettings>(
    key: K,
    updateFnOrValue: CSpellUserSettings[K] | UpdateConfigFieldFn<K>
): UpdateConfigFieldFn<K> {
    if (typeof updateFnOrValue === 'function') {
        return updateFnOrValue;
    }

    return () => updateFnOrValue;
}
