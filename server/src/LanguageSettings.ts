import { LanguageSetting, CSpellUserSettings } from './CSpellSettingsDef';
import * as SpellSettings from './CSpellSettingsServer';

// LanguageSettings are a collection of LanguageSetting.  They are applied in order, matching against the languageId.
// Dictionaries are concatenated together.
export type LanguageSettings = LanguageSetting[];

export const defaultLanguageSettings: LanguageSettings = [
    { languageId: '*',                                   dictionaries: ['wordsEn', 'companies', 'softwareTerms', 'node'], },
    { languageId: 'python', allowCompoundWords: true,    dictionaries: ['python']},
    { languageId: 'go',     allowCompoundWords: true,    dictionaries: ['go'], },
    { languageId: 'c',      allowCompoundWords: true,    dictionaries: ['cpp'], },
    { languageId: 'cpp',    allowCompoundWords: true,    dictionaries: ['cpp'], },
    { languageId: 'javascript',                          dictionaries: ['typescript'] },
    { languageId: 'javascriptreact',                     dictionaries: ['typescript'] },
    { languageId: 'typescript',                          dictionaries: ['typescript'] },
    { languageId: 'typescriptreact',                     dictionaries: ['typescript'] },
    { languageId: 'html',                                dictionaries: ['html', 'fonts', 'typescript', 'css'] },
    { languageId: 'php',                                 dictionaries: ['php', 'html', 'fonts', 'css', 'typescript'] },
    { languageId: 'css',                                 dictionaries: ['fonts', 'css'] },
    { languageId: 'less',                                dictionaries: ['fonts', 'css'] },
    { languageId: 'scss',                                dictionaries: ['fonts', 'css'] },
];

export function getDefaultLanguageSettings(): CSpellUserSettings {
    return { languageSettings: defaultLanguageSettings };
}

export function calcSettingsForLanguage(languageSettings: LanguageSettings, languageId: string): LanguageSetting {
    return defaultLanguageSettings.concat(languageSettings)
        .filter(s => s.languageId === '*' || s.languageId === languageId)
        .reduce((langSetting, setting) => {
            const { allowCompoundWords = langSetting.allowCompoundWords } = setting;
            const dictionaries = mergeUnique(langSetting.dictionaries, setting.dictionaries);
            return { languageId, allowCompoundWords, dictionaries };
        });
}

export function calcUserSettingsForLanguage(settings: CSpellUserSettings, languageId: string): CSpellUserSettings {
    const { languageSettings = [] } = settings;
    const { allowCompoundWords = settings.allowCompoundWords, dictionaries, dictionaryDefinitions } = calcSettingsForLanguage(languageSettings, languageId);
    return  SpellSettings.mergeSettings(settings, { allowCompoundWords, dictionaries, dictionaryDefinitions });
}

function mergeUnique(a: string[] = [], b: string[] = []) {
    // Merge and Make unique
    return [...(new Set(a.concat(b)))];
}
