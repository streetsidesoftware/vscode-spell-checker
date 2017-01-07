import { DictionaryDefinition, DictionaryId, CSpellUserSettings } from './CSpellSettingsDef';
import { loadDictionary } from './DictionaryLoader';
import { SpellingDictionary } from './SpellingDictionary';
import * as path from 'path';


const extensionPath = path.join(__dirname, '..', '..');
const dictionaryPath = path.join(extensionPath, 'dictionaries');

const defaultDictionaryDefs: DictionaryDefinition[] = [
    { name: 'wordsEn',        file: 'wordsEn.txt',          type: 'S' },
    { name: 'typescript',     file: 'typescript.txt',       type: 'C' },
    { name: 'node',           file: 'node.txt',             type: 'C' },
    { name: 'softwareTerms',  file: 'softwareTerms.txt',    type: 'W' },
    { name: 'html',           file: 'html.txt',             type: 'S' },
    { name: 'php',            file: 'php.txt',              type: 'C' },
    { name: 'go',             file: 'go.txt',               type: 'C' },
    { name: 'companies',      file: 'companies.txt',        type: 'C' },
    { name: 'python',         file: 'python.txt',           type: 'C' },
    { name: 'fonts',          file: 'fonts.txt',            type: 'C' },
    { name: 'css',            file: 'css.txt',              type: 'S' },
    { name: 'powershell',     file: 'powershell.txt',       type: 'C' },
];

export const defaultSettings: CSpellUserSettings = {
    dictionaryDefinitions: defaultDictionaryDefs,
};

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
    const { path: filePath = dictionaryPath, file } = def;
    return path.join(filePath, file);
}
