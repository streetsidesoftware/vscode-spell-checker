
export const defaultLanguageSettings: LanguageSettings = [
    { languageId: '*',      allowCompoundWords: false,   dictionaries: ['wordsEn', 'companies', 'softwareTerms', 'node'], },
    { languageId: 'python', allowCompoundWords: true,    dictionaries: ['python'], },
    { languageId: 'go',     allowCompoundWords: true,    dictionaries: ['go'], },
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

export function calcSettingsForLanguage(languageSettings: LanguageSettings, languageId: string): LanguageSetting {
    return languageSettings
        .filter(s => s.languageId === '*' || s.languageId === languageId)
        .reduce((langSetting, setting) => {
            const { allowCompoundWords = langSetting.allowCompoundWords } = setting;
            const mergedDicts = (langSetting.dictionaries || []).concat(setting.dictionaries || []);
            // Make unique
            const dictionaries = [...(new Set(mergedDicts))];
            return { languageId, allowCompoundWords, dictionaries };
        });
}