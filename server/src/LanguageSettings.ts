
export interface LanguageSetting {
    // The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages
    languageId: string;
    // True to enable compound word checking.
    allowCompoundWords?: boolean;
    // Optional list of dictionaries to use.
    dictionaries?: string[];

    // List of paths to ignore
    ignorePaths?: string[];
}

// LanguageSettings are a collection of LanguageSetting.  They are applied in order, matching against the languageId.
// Dictionaries are concatenated together.
export type LanguageSettings = LanguageSetting[];

export const defaultLanguageSettings: LanguageSettings = [
    { languageId: '*',      allowCompoundWords: false,   dictionaries: ['wordsEn', 'companies', 'softwareTerms', 'node'], },
    { languageId: 'python', allowCompoundWords: true,    dictionaries: ['python'], ignorePaths: ['__pycache__']},
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
            const dictionaries = mergeUnique(langSetting.dictionaries, setting.dictionaries);
            const ignorePaths = mergeUnique(langSetting.ignorePaths, setting.ignorePaths);
            return { languageId, allowCompoundWords, dictionaries, ignorePaths };
        });
}

function mergeUnique(a: string[] = [], b: string[] = []) {
    // Merge and Make unique
    return [...(new Set(a.concat(b)))];
}