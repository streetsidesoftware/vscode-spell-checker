
import * as server from './server';
import { normalizeCode } from '../iso639-1';
import * as util from '../util';

export function extractLanguage(config?: server.CSpellUserSettings): string[] | undefined {
    return (
        config &&
        config.language &&
        normalizeToLocals(config.language)
    ) || undefined;
}

export function extractLocals(config: server.CSpellUserSettings = {}): string[] {
    return extractLocalsFromLanguageSettings(config.languageSettings);
}

export function extractLocalsFromLanguageSettings(langSettings: server.LanguageSetting[] = []): string[] {
    const locals = langSettings
        .map(s => s.local || '')
        .map(normalizeLocal)
        .join(',');
    return normalizeToLocals(locals);
}

export function extractDictionariesByLocal(config: server.CSpellUserSettings = {}): Map<string, string[]> {
    return extractDictionariesByLocalLanguageSettings(config.languageSettings);
}

export function extractDictionariesByLocalLanguageSettings(langSettings: server.LanguageSetting[] = []): Map<string, string[]> {
    const mapOfDict = new Map<string, string[]>();
    langSettings
        .map(({local, dictionaries = []}) => ({ local: normalizeLocal(local), dictionaries }))
        .filter(s => !!s.local)
        .filter(s => s.dictionaries.length > 0)
        .forEach(s => {
            s.local.split(',')
                .forEach(local => {
                    mapOfDict.set(
                        local,
                        (mapOfDict.get(local) || []).concat(s.dictionaries).filter(util.uniqueFilter())
                    );
                });
        });
    return mapOfDict;
}

export function normalizeLocal(local: string | string[] = ''): string {
    if(Array.isArray(local)) {
        local = local.join(',');
    }
    return normalizeToLocals(local).join(',');
}

export function normalizeToLocals(local: string = '') {
    return local
        .replace(/[|]/g, ',')
        .replace(/[*]/g, '')
        .split(',')
        .map(normalizeCode)
        .map(s => s.trim())
        .filter(a => !!a)
        .filter(util.uniqueFilter());
}
