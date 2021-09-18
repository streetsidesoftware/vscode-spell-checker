import { CSpellUserSettings, LanguageSetting } from './server';
import { normalizeCode } from '../../iso639-1';
import * as util from '../../util';
import { CustomDictionaryScope, DictionaryDefinition, DictionaryDefinitionCustom } from '@cspell/cspell-types';
import { isDefined } from '../../util';

export function extractLanguage(config?: CSpellUserSettings): string[] | undefined {
    return (config && config.language && normalizeToLocales(config.language)) || undefined;
}

export function extractLocales(config: CSpellUserSettings = {}): string[] {
    return extractLocalesFromLanguageSettings(config.languageSettings);
}

export function extractLocalesFromLanguageSettings(langSettings: LanguageSetting[] = []): string[] {
    const locales = langSettings
        .map((s) => s.locale || s.local || '')
        .map(normalizeLocale)
        .join(',');
    return normalizeToLocales(locales);
}

export function extractDictionariesByLocale(config: CSpellUserSettings = {}): Map<string, string[]> {
    return extractDictionariesByLocaleLanguageSettings(config.languageSettings);
}

export function extractDictionariesByLocaleLanguageSettings(langSettings: LanguageSetting[] = []): Map<string, string[]> {
    const mapOfDict = new Map<string, string[]>();
    langSettings
        .map(({ local, locale, dictionaries = [] }) => ({ locale: normalizeLocale(locale || local), dictionaries }))
        .filter((s) => !!s.locale)
        .filter((s) => s.dictionaries.length > 0)
        .forEach((s) => {
            s.locale.split(',').forEach((locale) => {
                mapOfDict.set(locale, (mapOfDict.get(locale) || []).concat(s.dictionaries).filter(util.uniqueFilter()));
            });
        });
    return mapOfDict;
}

export function extractDictionariesGroupByName(config: CSpellUserSettings): Map<string, DictionaryDefinition> {
    return new Map(config.dictionaryDefinitions?.map((def) => [def.name, def]) || []);
}

export function extractActiveDictionaries(config: CSpellUserSettings): DictionaryDefinition[] {
    const dictMap = extractDictionariesGroupByName(config);
    return (config.dictionaries || []).map((name) => dictMap.get(name)).filter(isDefined);
}

export function extractCustomDictionaries(config: CSpellUserSettings): DictionaryDefinitionCustom[] {
    return extractActiveDictionaries(config)
        .filter(isDictionaryDefinitionCustom)
        .filter((d) => d.addWords);
}

function isDictionaryDefinitionCustom(d: DictionaryDefinition): d is DictionaryDefinitionCustom {
    return (<DictionaryDefinitionCustom>d).addWords ?? false;
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

export function normalizeToLocales(locale: string = ''): string[] {
    return locale
        .replace(/[|;\s]/g, ',')
        .replace(/[*]/g, '')
        .split(',')
        .map(normalizeCode)
        .map((s) => s.trim())
        .filter((a) => !!a)
        .filter(util.uniqueFilter());
}
