import type { CustomDictionaryScope, DictionaryDefinition, DictionaryDefinitionCustom } from '@cspell/cspell-types';
import { normalizeCode } from '@internal/locale-resolver';
import type { PartialCSpellUserSettings } from 'code-spell-checker-server/api';

import { isDefined, uniqueFilter } from '../../util/index.mjs';
import type { LanguageSetting } from './server.mjs';

export function extractLanguage(config?: PartialCSpellUserSettings<'language'>): string[] | undefined {
    return (config?.language && normalizeToLocales(config.language)) || undefined;
}

export function extractLocales(config: PartialCSpellUserSettings<'languageSettings'>): string[] {
    return extractLocalesFromLanguageSettings(config.languageSettings);
}

export function extractLocalesFromLanguageSettings(langSettings: LanguageSetting[] = []): string[] {
    const locales = langSettings
        .map((s) => s.locale || s.local || '')
        .map(normalizeLocale)
        .join(',');
    return normalizeToLocales(locales);
}

export function extractDictionariesByLocale(config: PartialCSpellUserSettings<'languageSettings'>): Map<string, string[]> {
    return extractDictionariesByLocaleLanguageSettings(config.languageSettings);
}

export function extractDictionariesByLocaleLanguageSettings(langSettings: LanguageSetting[] = []): Map<string, string[]> {
    const mapOfDict: Map<string, string[]> = new Map();
    langSettings
        .map(({ local, locale, dictionaries = [] }) => ({ locale: normalizeLocale(locale || local), dictionaries }))
        .filter((s) => !!s.locale)
        .filter((s) => s.dictionaries.length > 0)
        .forEach((s) => {
            s.locale.split(',').forEach((locale) => {
                mapOfDict.set(locale, (mapOfDict.get(locale) || []).concat(s.dictionaries).filter(uniqueFilter()));
            });
        });
    return mapOfDict;
}

/**
 * Groups the dictionaries by name. If two dictionaries have the same name, the last one wins.
 * @param config - cspell configuration
 * @returns dictionary definitions grouped by name.
 */
export function extractDictionariesGroupByName(
    config: PartialCSpellUserSettings<'dictionaryDefinitions'>,
): Map<string, DictionaryDefinition> {
    return new Map(config.dictionaryDefinitions?.map((def) => [def.name, def]) || []);
}

export function extractActiveDictionaries(
    config: PartialCSpellUserSettings<'dictionaryDefinitions' | 'dictionaries'>,
): DictionaryDefinition[] {
    const dictMap = extractDictionariesGroupByName(config);
    return (config.dictionaries || []).map((name) => dictMap.get(name)).filter(isDefined);
}

export function extractCustomDictionaries(
    config: PartialCSpellUserSettings<'dictionaryDefinitions' | 'dictionaries'>,
): DictionaryDefinitionCustom[] {
    return extractActiveDictionaries(config)
        .filter(isDictionaryDefinitionCustom)
        .filter((d) => d.addWords);
}

function isDictionaryDefinitionCustom(d: DictionaryDefinition): d is DictionaryDefinitionCustom {
    return (d as DictionaryDefinitionCustom).addWords ?? false;
}

export function extractScope(d: DictionaryDefinitionCustom): Set<CustomDictionaryScope> {
    return new Set<CustomDictionaryScope>(typeof d.scope === 'string' ? [d.scope] : d.scope || []);
}

export function normalizeLocale(locale: string | string[] = ''): string {
    if (Array.isArray(locale)) {
        locale = locale.join(',');
    }
    return normalizeToLocales(locale).join(',');
}

export function normalizeToLocales(locale = ''): string[] {
    return locale
        .replace(/[|;\s]/g, ',')
        .replace(/[*]/g, '')
        .split(',')
        .map((s) => normalizeCode(s))
        .map((s) => s.trim())
        .filter((a) => !!a)
        .filter(uniqueFilter());
}
