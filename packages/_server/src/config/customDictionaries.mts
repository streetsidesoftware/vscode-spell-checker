import { isDefined } from '@internal/common-utils/util';
import type { DictionaryDefinitionCustom, DictionaryDefinitionInline, DictionaryDefinitionPreferred } from 'cspell-lib';

import type {
    CSpellUserAndExtensionSettings,
    CustomDictionaries,
    CustomDictionaryEntry,
    DictionaryDefinition,
} from './cspellConfig/index.mjs';

export function mapCustomDictionaryEntryToCustomDictionaries(
    entries: CustomDictionaryEntry[] | undefined,
    scope: 'user' | 'workspace' | 'folder',
): CustomDictionaries {
    if (!entries) return {};

    const customDict: CustomDictionaries = entries
        .map((entry) => (typeof entry === 'string' ? { [entry]: true } : { [entry.name]: { ...entry, scope: entry.scope || scope } }))
        .reduce<CustomDictionaries>((agg, cur) => Object.assign(agg, cur), {});

    return customDict;
}

export function extractCustomDictionaries(settings: CSpellUserAndExtensionSettings): CustomDictionaries {
    const dicts = Object.assign(
        {} as CustomDictionaries,
        mapCustomDictionaryEntryToCustomDictionaries(settings.customUserDictionaries, 'user'),
        mapCustomDictionaryEntryToCustomDictionaries(settings.customWorkspaceDictionaries, 'workspace'),
        mapCustomDictionaryEntryToCustomDictionaries(settings.customFolderDictionaries, 'folder'),
        settings.customDictionaries || {},
    );
    return dicts;
}

export function extractDictionaryDefinitions(settings: CSpellUserAndExtensionSettings): NormalizedDictionaryDefinition[] {
    const customDicts = extractCustomDictionaries(settings);

    const dicts = new Map(
        (settings.dictionaryDefinitions || [])
            .map(normalizeDictionaryDefinition)
            .filter(isDefined)
            .map((d) => [d.name, d]),
    );

    for (const [name, dict] of Object.entries(customDicts)) {
        if (typeof dict === 'boolean') {
            const entry = dicts.get(name);
            const addWords = dict;
            if (entry?.path && entry.addWords !== addWords) {
                dicts.set(name, { ...entry, addWords });
            }
            continue;
        }
        const dName = dict.name || name;
        const entry = dicts.get(dName);
        if (entry) {
            dicts.set(dName, { ...entry, ...dict });
            continue;
        }
        const path = dict.path;
        if (path) {
            dicts.set(dName, { ...dict, path, name: dName });
        }
    }

    return [...dicts.values()];
}

export function extractDictionaryList(settings: CSpellUserAndExtensionSettings): string[] {
    const customDicts = extractCustomDictionaries(settings);
    const dicts = (settings.dictionaries || []).concat(extractNamesFromCustomDictionaries(customDicts));
    return dicts;
}

function extractNamesFromCustomDictionaries(d: CustomDictionaries): string[] {
    return Object.entries(d).map(([name, dict]) => {
        if (typeof dict === 'boolean') {
            return dict ? name : '!' + name;
        }
        return dict.name || name;
    });
}

interface NormalizedDictionaryDefinition extends Partial<DictionaryDefinitionPreferred>, Partial<DictionaryDefinitionCustom> {
    name: string;
    path: string;
}

function normalizeDictionaryDefinition(def: DictionaryDefinition): NormalizedDictionaryDefinition | undefined {
    if (def.file === undefined) {
        return isDictPreferred(def) ? def : undefined;
    }
    const { file, path, ...rest } = def;
    const usePath = [path || '', file || ''].filter((a) => !!a).join('/');
    const nDef: NormalizedDictionaryDefinition = { ...rest, path: usePath, file: undefined };
    nDef.addWords = canAddWordsToDictionary(nDef);
    return nDef;
}

const regExpBlockCustomAdd = /(^https?:|(\.gz|\.trie)$)/;

export function canAddWordsToDictionary(def: NormalizedDictionaryDefinition): boolean {
    return def.addWords ?? !regExpBlockCustomAdd.test(def.path);
}

export function isInlineDict(def: DictionaryDefinition): def is DictionaryDefinitionInline {
    const d = def as DictionaryDefinitionInline;
    return !!(d.flagWords || d.words || d.ignoreWords || d.suggestWords);
}

export function isDictPreferred(def: DictionaryDefinition): def is DictionaryDefinitionPreferred {
    return !!def.path;
}
