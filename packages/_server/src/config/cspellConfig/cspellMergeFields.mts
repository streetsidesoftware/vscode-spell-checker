import type { CSpellUserSettings } from './cspellConfig.mjs';
import type { CSpellMergeFields, CSpellMergeFieldsKeys } from './CSpellSettingsPackageProperties.mjs';

export const cspellMergeFields: Required<CSpellMergeFields> = {
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

const fields = Object.keys(cspellMergeFields) as CSpellMergeFieldsKeys[];

/**
 * Filter fields to be passed to cspell.
 * @param settings - settings from vscode and imports
 * @param mergeCSpellSettings - the filter
 * @returns filtered settings
 */
export function filterMergeFields(
    settings: Readonly<CSpellUserSettings>,
    mergeCSpellSettings: CSpellUserSettings['mergeCSpellSettings'],
    mergeCSpellSettingsFields: CSpellUserSettings['mergeCSpellSettingsFields'],
): CSpellUserSettings {
    mergeCSpellSettings ??= false;
    if (mergeCSpellSettings === true && !mergeCSpellSettingsFields) return settings;
    const copy = { ...settings };
    mergeCSpellSettingsFields = mergeCSpellSettingsFields || {};

    for (const field of fields) {
        const keep = mergeCSpellSettings && (mergeCSpellSettingsFields[field] ?? cspellMergeFields[field]);
        if (keep) continue;
        delete copy[field];
    }
    return copy;
}
