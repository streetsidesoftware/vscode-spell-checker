import { Config, Configs, configTargets } from './settings';


export function extractConfig<K extends keyof Config>(configs: Configs, key: K): Config[K] {

    for (let i = configTargets.length - 1; i >= 0; i--) {
        const target = configTargets[i];
        if (configs[target] && configs[target]![key]) {
            return configs[target]![key];
        }
    }

    return undefined;
}

