import { isDefined } from '@internal/common-utils';
import type { DictionaryDefinition, DictionaryDefinitionCustom } from 'cspell-lib';

import type { CSpellUserAndExtensionSettings } from './cspellConfig/index.mjs';
import { ConfigFields } from './cspellConfig/index.mjs';

type ConfigFieldKeys = keyof CSpellUserAndExtensionSettings;
type ConfigFieldFilter = Record<ConfigFieldKeys, boolean | undefined>;

export function sanitizeSettings(settings: CSpellUserAndExtensionSettings, fields: ConfigFieldFilter): CSpellUserAndExtensionSettings;
export function sanitizeSettings(
    settings: CSpellUserAndExtensionSettings | undefined,
    fields: ConfigFieldFilter,
): CSpellUserAndExtensionSettings | undefined;
export function sanitizeSettings(
    settings: CSpellUserAndExtensionSettings | undefined,
    fields: ConfigFieldFilter,
): CSpellUserAndExtensionSettings | undefined {
    if (!settings) return settings;
    const includeKeys = new Set<string>(
        Object.entries(fields)
            .filter(([, value]) => value)
            .map(([key]) => key),
    );
    const excludeKeys = new Set<string>((['words', 'ignoreWords', 'userWords'] as const).filter((key) => !includeKeys.has(key)));
    const s = Object.fromEntries(
        Object.entries(settings).filter(([key]) => key in ConfigFields && !excludeKeys.has(key) && includeKeys.has(key)),
    );
    if ('dictionaryDefinitions' in s) {
        s.dictionaryDefinitions = sanitizeDictionaryDefinitions(s.dictionaryDefinitions);
    }
    return s;
}

function sanitizeDictionaryDefinitions(
    defs: CSpellUserAndExtensionSettings['dictionaryDefinitions'],
): CSpellUserAndExtensionSettings['dictionaryDefinitions'] {
    if (!defs) return defs;
    return defs.map((def) => sanitizeDictionaryDefinition(def)).filter(isDefined);
}

function sanitizeDictionaryDefinition(def: DictionaryDefinition | undefined): DictionaryDefinitionCustom | undefined {
    if (!def) return def;
    // if (!def.path) return undefined;
    const { name, path, description, addWords } = def as DictionaryDefinitionCustom;
    return {
        name,
        path,
        description,
        addWords: addWords || false,
    };
}

export function objectKeysNested(obj: unknown): string[] {
    const visited = new Set<unknown>();

    function _objectKeysNested(obj: unknown, depthRemaining: number): string[] {
        if (!depthRemaining || visited.has(obj) || !obj || typeof obj !== 'object') return [];
        visited.add(obj);
        const keys = new Set<string>();
        if (Array.isArray(obj)) {
            const nested = obj.flatMap((o) => _objectKeysNested(o, depthRemaining - 1));
            nested.map((k) => keys.add('[*].' + k));
        } else {
            for (const [key, entry] of Object.entries(obj)) {
                keys.add(key);
                _objectKeysNested(entry, depthRemaining - 1).map((k) => keys.add(key + '.' + k));
            }
        }
        return [...keys];
    }

    return _objectKeysNested(obj, 4);
}

export function objectFieldSizes(obj: object): object {
    if (!obj) return obj;
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, JSON.stringify(value)?.length || 0]));
}
