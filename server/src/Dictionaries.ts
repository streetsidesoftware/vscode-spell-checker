import { DictionaryDefinition, DictionaryId } from './CSpellSettingsDef';
import { loadDictionary } from './DictionaryLoader';
import { SpellingDictionary } from './SpellingDictionary';
import * as path from 'path';


const extensionPath = path.join(__dirname, '..', '..');
const dictionaryPath = path.join(extensionPath, 'dictionaries');

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
        .map(def => [ def.name, def] as DefMapArrayItem);
    return [...(new Map(activeDefs))];
}

function getFullPathName(def: DictionaryDefinition) {
    const { path: filePath = dictionaryPath, file = '' } = def;
    return path.join(filePath, file);
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
