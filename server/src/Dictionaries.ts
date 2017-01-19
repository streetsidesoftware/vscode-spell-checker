import { DictionaryDefinition, DictionaryId } from './CSpellSettingsDef';
import { loadDictionary } from './DictionaryLoader';
import { SpellingDictionary } from './SpellingDictionary';
import * as path from 'path';
import { serverEnv } from './serverEnv';

const dictionaryPath = () => serverEnv.dictionaries;

export function loadDictionaries(dictIds: DictionaryId[], defs: DictionaryDefinition[]): Promise<SpellingDictionary>[] {
    const defsToLoad = filterDictDefsToLoad(dictIds, defs);

    return defsToLoad
        .map(e => e[1])
        .map(def => loadDictionary(def.path!, { type: def.type}));
}

export type DefMapArrayItem = [string, DictionaryDefinition];

export function filterDictDefsToLoad(dictIds: DictionaryId[], defs: DictionaryDefinition[]): DefMapArrayItem[]  {
    const dictIdSet = new Set(dictIds);
    const activeDefs: DefMapArrayItem[] = defs
        .filter(({name}) => dictIdSet.has(name))
        .map(def => ({...def, path: getFullPathName(def)}))
        // Remove any empty paths.
        .filter(def => !!def.path)
        .map(def => [ def.name, def] as DefMapArrayItem);
    return [...(new Map(activeDefs))];
}

function getFullPathName(def: DictionaryDefinition) {
    const { path: filePath = '', file = '' } = def;
    if (filePath + file === '') {
        return '';
    }
    const dictPath = path.join(filePath || dictionaryPath(), file);
    return dictPath;
}

export function normalizePathForDictDefs(defs: DictionaryDefinition[], defaultPath: string): DictionaryDefinition[] {
    return defs
        .map(def => normalizePathForDictDef(def, defaultPath));
}

export function normalizePathForDictDef(def: DictionaryDefinition, defaultPath: string): DictionaryDefinition {
        const { path: relPath = '.' } = def;
        const absPath = relPath.match(/^\./) ? path.join(defaultPath, relPath) : relPath;
        return {
            ...def,
            path:  absPath
        };
}
