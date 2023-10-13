import type { Config, Configs, ConfigTarget, SettingByConfigTarget } from 'webview-api';

export interface ExtractConfigResult<T> {
    target: ConfigTarget;
    config: T;
}

export function extractConfig<K extends keyof Config>(configs: Configs, key: K): ExtractConfigResult<Config[K]> {
    for (let i = configTargets.length - 1; i >= 0; i--) {
        const target = configTargets[i];
        if (configs[target]?.[key]) {
            return {
                target,
                config: configs[target][key],
            };
        }
    }

    return {
        target: 'user',
        config: configs.user[key],
    };
}

export const ConfigTargets = Object.freeze<SettingByConfigTarget<ConfigTarget>>({
    user: 'user',
    workspace: 'workspace',
    folder: 'folder',
});

export const configTargets = Object.freeze(Object.keys(ConfigTargets) as ConfigTarget[]);

const setOfConfigTargets = new Set<string>(configTargets);

export function isConfigTarget(target: string | undefined): target is ConfigTarget {
    return target !== undefined && setOfConfigTargets.has(target);
}

// Define the order in which configuration is applied.
export const configTargetToIndex = Object.freeze<SettingByConfigTarget<number>>({
    user: 0,
    workspace: 1,
    folder: 2,
});

export const configTargetOrder = Object.freeze(
    Object.entries(configTargetToIndex)
        .sort((a, b) => a[1] - b[1])
        .map((a) => a[0]) as ConfigTarget[],
);
