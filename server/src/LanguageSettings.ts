import { LanguageSetting, CSpellUserSettings, LocalId, LanguageId } from './CSpellSettingsDef';
import * as SpellSettings from './CSpellSettingsServer';

// LanguageSettings are a collection of LanguageSetting.  They are applied in order, matching against the languageId.
// Dictionaries are concatenated together.
export type LanguageSettings = LanguageSetting[];

const defaultLocal: LocalId = 'en';

export const defaultLanguageSettings: LanguageSettings = [
    { languageId: '*',      local: 'en',                 dictionaries: ['wordsEn'], },
    { languageId: '*',      local: 'en-US',              dictionaries: ['wordsEn'], },
    { languageId: '*',      local: 'en-GB',              dictionaries: ['wordsEnGb'], },
    { languageId: '*',                                   dictionaries: ['companies', 'softwareTerms', 'misc'], },
    { languageId: 'python', allowCompoundWords: true,    dictionaries: ['python']},
    { languageId: 'go',     allowCompoundWords: true,    dictionaries: ['go'], },
    { languageId: 'c',      allowCompoundWords: true,    dictionaries: ['cpp'], },
    { languageId: 'cpp',    allowCompoundWords: true,    dictionaries: ['cpp'], },
    { languageId: 'csharp', allowCompoundWords: true,    dictionaries: ['csharp', 'dotnet', 'npm'] },
    { languageId: 'javascript',                          dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'javascriptreact',                     dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'typescript',                          dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'typescriptreact',                     dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'html',                                dictionaries: ['html', 'fonts', 'typescript', 'css', 'npm'] },
    { languageId: 'jade',                                dictionaries: ['html', 'fonts', 'typescript', 'css', 'npm'] },
    { languageId: 'pug',                                 dictionaries: ['html', 'fonts', 'typescript', 'css', 'npm'] },
    { languageId: 'php',                                 dictionaries: ['php', 'html', 'fonts', 'css', 'typescript', 'npm'] },
    { languageId: 'css',                                 dictionaries: ['fonts', 'css'] },
    { languageId: 'less',                                dictionaries: ['fonts', 'css'] },
    { languageId: 'scss',                                dictionaries: ['fonts', 'css'] },
];

export function getDefaultLanguageSettings(): CSpellUserSettings {
    return { languageSettings: defaultLanguageSettings };
}

function NormalizeLocal(local: LocalId): LocalId {
    return local.toLowerCase().replace(/[^a-z]/g, '');
}

export function calcSettingsForLanguage(languageSettings: LanguageSettings, languageId: LanguageId, local: LocalId): LanguageSetting {
    local = NormalizeLocal(local);
    return defaultLanguageSettings.concat(languageSettings)
        .filter(s => s.languageId === '*' || s.languageId === languageId)
        .filter(s => !s.local || NormalizeLocal(s.local) === local || s.local === '*')
        .reduce((langSetting, setting) => {
            const { allowCompoundWords = langSetting.allowCompoundWords } = setting;
            const dictionaries = mergeUnique(langSetting.dictionaries, setting.dictionaries);
            return { languageId, local, allowCompoundWords, dictionaries };
        });
}

export function calcUserSettingsForLanguage(settings: CSpellUserSettings, languageId: string): CSpellUserSettings {
    const { languageSettings = [], language: local = defaultLocal } = settings;
    const {
        allowCompoundWords = settings.allowCompoundWords,
        dictionaries,
        dictionaryDefinitions
    } = calcSettingsForLanguage(languageSettings, languageId, local);
    return  SpellSettings.mergeSettings(settings, { allowCompoundWords, dictionaries, dictionaryDefinitions });
}

function mergeUnique(a: string[] = [], b: string[] = []) {
    // Merge and Make unique
    return [...(new Set(a.concat(b)))];
}
