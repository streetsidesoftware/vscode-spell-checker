import type { ClientConfigTarget } from './clientConfigTarget.js';
import { configTargetToConfigRepo } from './configRepositoryHelper.mjs';
import type { DictionaryTarget } from './DictionaryTarget.mjs';
import { createDictionaryTargetForConfigRep, createDictionaryTargetForFile } from './DictionaryTarget.mjs';

export function configTargetsToDictionaryTargets(configTargets: ClientConfigTarget[]): DictionaryTarget[] {
    return configTargets.map(configTargetToDictionaryTarget);
}

export function configTargetToDictionaryTarget(configTarget: ClientConfigTarget): DictionaryTarget {
    const cfg = configTargetToConfigRepo(configTarget);
    if (cfg) {
        return createDictionaryTargetForConfigRep(cfg);
    }
    if (configTarget.kind !== 'dictionary') throw new Error(`Unknown config target ${configTarget.kind}`);
    return createDictionaryTargetForFile(configTarget.dictionaryUri, configTarget.name);
}
