import type { CSpellUserSettings } from './cspellConfig.mjs';
import type { CSpellMergeFields } from './CSpellSettingsPackageProperties.mjs';

export const cspellMergeFields: Record<CSpellMergeFields, true> = {
    allowCompoundWords: true,
    caseSensitive: true,
    dictionaries: true,
    dictionaryDefinitions: true,
    enableGlobDot: true,
    features: true,
    files: true,
    flagWords: true,
    gitignoreRoot: true,
    globRoot: true,
    ignorePaths: true,
    ignoreRegExpList: true,
    ignoreWords: true,
    import: true,
    includeRegExpList: true,
    language: true,
    languageId: true,
    languageSettings: true,
    loadDefaultConfiguration: true,
    minWordLength: true,
    noConfigSearch: true,
    noSuggestDictionaries: true,
    numSuggestions: true,
    overrides: true,
    parser: true,
    patterns: true,
    pnpFiles: true,
    reporters: true,
    suggestWords: true,
    useGitignore: true,
    usePnP: true,
    userWords: true,
    validateDirectives: true,
    words: true,
};

const fields = Object.keys(cspellMergeFields) as CSpellMergeFields[];

/**
 * Filter fields to be passed to cspell.
 * @param settings - settings from vscode and imports
 * @param mergeCSpellSettings - the filter
 * @returns filtered settings
 */
export function filterMergeFields(
    settings: Readonly<CSpellUserSettings>,
    mergeCSpellSettings: CSpellUserSettings['mergeCSpellSettings'],
): CSpellUserSettings {
    if (mergeCSpellSettings === true) return settings;
    const copy = { ...settings };
    mergeCSpellSettings = mergeCSpellSettings || {};
    for (const field of fields) {
        if (mergeCSpellSettings[field]) continue;
        delete copy[field];
    }
    return copy;
}
