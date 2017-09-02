
import * as server from './server';

export function extractLanguage(config?: server.CSpellUserSettings): string[] | undefined {
    return (
        config &&
        config.language &&
        normalizeLang(config.language)
    ) || undefined;
}

export function extractLocals(config?: server.CSpellUserSettings): string[] {
    if (!config) return [];
    return extractLocalsFromLanguageSettings(config.languageSettings);
}

export function extractLocalsFromLanguageSettings(langSettings?: server.LanguageSetting[]): string[] {
    if (!langSettings) return [];

    const langs = langSettings
        .map(s => s.local || '')
        .filter(s => !!s)
        .map(s => Array.isArray(s) ? s.join(',') : s)
        .join(',');
    return normalizeLang(langs);
}

function normalizeLang(lang: string) {
    return lang
        .replace(/[|]/g, ',')
        .replace(/[\s*]/g, '')
        .replace(/[_]/g, '-')
        .split(',');
}
