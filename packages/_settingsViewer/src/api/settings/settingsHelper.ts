import { Config, Configs, configTargets, ConfigTarget } from './settings';

export interface ExtractConfigResult<T> {
    target: ConfigTarget;
    config: T;
}

export function extractConfig<K extends keyof Config>(configs: Configs, key: K): ExtractConfigResult<Config[K]> {

    for (let i = configTargets.length - 1; i >= 0; i--) {
        const target = configTargets[i];
        if (configs[target] && configs[target]![key]) {
            return {
                target,
                config: configs[target]![key],
            };
        }
    }

    return {
        target: 'user',
        config: undefined,
    };
}
