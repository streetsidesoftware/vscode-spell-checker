import { Uri } from 'vscode';
import { ConfigTarget } from '../server';
import { configTargetToConfigRepo } from './configRepositoryHelper';
import { createDictionaryTargetForConfig, createDictionaryTargetForFile, DictionaryTarget } from './DictionaryTarget';

// type ConfigTarget

export function configTargetToDictionaryTarget(configTarget: ConfigTarget): DictionaryTarget {
    const cfg = configTargetToConfigRepo(configTarget);
    if (cfg) {
        return createDictionaryTargetForConfig(cfg);
    }
    if (configTarget.kind !== 'dictionary') throw new Error(`Unknown config target ${configTarget.kind}`);

    const uri = Uri.parse(configTarget.dictionaryUri);

    return createDictionaryTargetForFile(uri, configTarget.name);
}
