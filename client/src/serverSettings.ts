
import * as server from './server';

export function extractLanguage(config?: server.CSpellUserSettings): string[] | undefined {
    return (
        config &&
        config.language &&
        config.language
            .replace(/[|]/g, ',')
            .replace(/\s/g, '')
            .split(',')
    ) || undefined;
}

export function extractLocals(config?: server.CSpellUserSettings): string[] {
    if (!config) return [];
    return extractLocalsFromLanguageSettings(config.languageSettings);
}

export function extractLocalsFromLanguageSettings(langSettings?: server.LanguageSetting[]): string[] {
    if (!langSettings) return [];

    const values = langSettings
        .map(s => s.local || '')
        .filter(s => !!s)
        .map(s => Array.isArray(s) ? s.join(',') : s)
        .join(',')
        .replace(/[|]/g, ',')
        .replace(/[\s*]/g, '');
    return values.split(',');
}
