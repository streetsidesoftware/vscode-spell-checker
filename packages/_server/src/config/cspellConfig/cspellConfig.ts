// Export the cspell settings to the client.

import type { LanguageSetting, OverrideSettings } from '@cspell/cspell-types';
import type { CSpellSettingsPackageProperties } from './CSpellSettingsPackageProperties';
import type { DictionaryDef } from './CustomDictionary';
import type { SpellCheckerSettings } from './SpellCheckerSettings';

interface InternalSettings {
    /**
     * Map of known and enabled file types.
     * `true` - enabled
     * `false` - disabled
     * @hidden
     */
    mapOfEnabledFileTypes?: Map<string, boolean>;
}

export interface CSpellUserSettings extends SpellCheckerSettings, CSpellSettingsPackageProperties, InternalSettings {}

export type SpellCheckerSettingsProperties = keyof SpellCheckerSettings;
export type SpellCheckerSettingsVSCodePropertyKeys = `cspell.${keyof CSpellUserSettings}`;

interface DictionaryDefinitions {
    /**
     * Define additional available dictionaries.
     * @scope resource
     */
    dictionaryDefinitions?: DictionaryDef[];
}

type LanguageSettingsReduced = Omit<LanguageSetting, 'local' | 'dictionaryDefinitions'> & DictionaryDefinitions;

interface LanguageSettings {
    /**
     * Additional settings for individual programming languages and locales.
     * @scope resource
     */
    languageSettings?: LanguageSettingsReduced[];
}

type OverridesReduced = Omit<OverrideSettings, 'dictionaryDefinitions' | 'languageSettings'> & DictionaryDefinitions & LanguageSettings;
interface Overrides {
    /**
     * @description
     * @markdownDescription
     * Overrides are used to apply settings for specific files in your project.
     *
     * **Example:**
     *
     * ```jsonc
     * "cSpell.overrides": [
     *   // Force `*.hrr` and `*.crr` files to be treated as `cpp` files:
     *   {
     *     "filename": "**​/{*.hrr,*.crr}",
     *     "languageId": "cpp"
     *   },
     *   // Force `dutch/**​/*.txt` to be treated as Dutch (dictionary needs to be installed separately):
     *   {
     *     "filename": "**​/dutch/**​/*.txt",
     *     "language": "nl"
     *   }
     * ]
     * ```
     * @scope resource
     */
    overrides?: OverridesReduced[];
}

type CSpellOmitFieldsFromExtensionContributesInPackageJson =
    | '$schema'
    | 'cache'
    | 'description'
    | 'enableGlobDot' // Might add this later
    | 'features' // add this back when they are in use.
    | 'gitignoreRoot' // Hide until implemented
    | 'failFast'
    | 'id'
    | 'languageId'
    | 'loadDefaultConfiguration'
    | 'name'
    | 'pnpFiles'
    | 'readonly'
    | 'reporters'
    | 'version';

export interface SpellCheckerSettingsVSCodeBase
    extends Omit<
            CSpellUserSettings,
            CSpellOmitFieldsFromExtensionContributesInPackageJson | 'dictionaryDefinitions' | 'languageSettings' | 'overrides'
        >,
        DictionaryDefinitions,
        LanguageSettings,
        Overrides {}

export type AllSpellCheckerSettingsInVSCode = SpellCheckerSettingsVSCodeBase;

type Prefix<T, P extends string> = {
    [K in keyof T as K extends string ? `${P}${K}` : K]: T[K];
};
type PrefixWithCspell<T> = Prefix<T, 'cSpell.'>;

/**
 * @title Code Spell Checker
 * @order 0
 */
type VSConfigRoot = PrefixWithCspell<_VSConfigRoot>;
type _VSConfigRoot = Pick<SpellCheckerSettingsVSCodeBase, 'enabled'>;

/**
 * @title Languages and Dictionaries
 * @order 1
 */
type VSConfigLanguageAndDictionaries = PrefixWithCspell<_VSConfigLanguageAndDictionaries>;
type _VSConfigLanguageAndDictionaries = Pick<
    SpellCheckerSettingsVSCodeBase,
    // | 'addWordsTo'
    | 'caseSensitive'
    | 'customDictionaries'
    | 'dictionaries'
    | 'dictionaryDefinitions'
    | 'flagWords'
    | 'ignoreWords'
    | 'language'
    | 'languageSettings'
    | 'noSuggestDictionaries'
    | 'userWords'
    | 'words'
>;

/**
 * @title Reporting and Display
 * @order 2
 */
type VSConfigReporting = PrefixWithCspell<_VSConfigReporting>;
type _VSConfigReporting = Pick<
    SpellCheckerSettingsVSCodeBase,
    | 'autoFormatConfigFile'
    | 'diagnosticLevel'
    | 'hideAddToDictionaryCodeActions'
    | 'maxDuplicateProblems'
    | 'maxNumberOfProblems'
    | 'minWordLength'
    | 'numSuggestions'
    | 'showAutocompleteSuggestions'
    | 'showCommandsInEditorContextMenu'
    | 'showStatus'
    | 'showStatusAlignment'
    | 'showSuggestionsLinkInEditorContextMenu'
    | 'suggestionMenuType'
    | 'suggestionNumChanges'
    | 'validateDirectives'
>;

/**
 * @title Performance
 * @order 4
 */
type VSConfigPerf = PrefixWithCspell<_VSConfigPerf>;
type _VSConfigPerf = Pick<
    SpellCheckerSettingsVSCodeBase,
    | 'blockCheckingWhenAverageChunkSizeGreaterThan'
    | 'blockCheckingWhenLineLengthGreaterThan'
    | 'blockCheckingWhenTextChunkSizeGreaterThan'
    | 'checkLimit'
    | 'spellCheckDelayMs'
    | 'suggestionsTimeout'
>;

/**
 * @title CSpell
 * @order 5
 */
type VSConfigCSpell = PrefixWithCspell<_VSConfigCSpell>;
type _VSConfigCSpell = Omit<
    SpellCheckerSettingsVSCodeBase,
    | keyof _VSConfigAdvanced
    | keyof _VSConfigExperimental
    | keyof _VSConfigLanguageAndDictionaries
    | keyof _VSConfigLegacy
    | keyof _VSConfigPerf
    | keyof _VSConfigReporting
    | keyof _VSConfigRoot
    | keyof _VSConfigFilesAndFolders
>;

/**
 * @title Files, Folders, and Workspaces
 * @order 3
 */
type VSConfigFilesAndFolders = PrefixWithCspell<_VSConfigFilesAndFolders>;
type _VSConfigFilesAndFolders = Pick<
    SpellCheckerSettingsVSCodeBase,
    | 'allowedSchemas'
    | 'checkOnlyEnabledFileTypes'
    | 'enableFiletypes'
    | 'files'
    | 'globRoot'
    | 'ignorePaths'
    | 'import'
    | 'noConfigSearch'
    | 'spellCheckOnlyWorkspaceFiles'
    | 'useGitignore'
    | 'usePnP'
    | 'workspaceRootPath'
>;

/**
 * @title Legacy
 * @order 20
 */
type VSConfigLegacy = PrefixWithCspell<_VSConfigLegacy>;
type _VSConfigLegacy = Pick<
    SpellCheckerSettingsVSCodeBase,
    'enabledLanguageIds' | 'allowCompoundWords' | 'customFolderDictionaries' | 'customUserDictionaries' | 'customWorkspaceDictionaries'
>;

/**
 * @title Advanced
 * @order 18
 */
type VSConfigAdvanced = PrefixWithCspell<_VSConfigAdvanced>;
type _VSConfigAdvanced = Pick<
    SpellCheckerSettingsVSCodeBase,
    | 'advanced.feature.useReferenceProviderWithRename'
    | 'advanced.feature.useReferenceProviderRemove'
    | 'fixSpellingWithRenameProvider'
    | 'logFile'
    | 'logLevel'
>;

/**
 * @title Experimental
 * @order 19
 */
type VSConfigExperimental = PrefixWithCspell<_VSConfigExperimental>;
type _VSConfigExperimental = Pick<SpellCheckerSettingsVSCodeBase, 'experimental.enableRegexpView' | 'experimental.enableSettingsViewerV2'>;

export type SpellCheckerSettingsVSCode = [
    VSConfigRoot,
    VSConfigAdvanced,
    VSConfigCSpell,
    VSConfigExperimental,
    VSConfigFilesAndFolders,
    VSConfigLanguageAndDictionaries,
    VSConfigLegacy,
    VSConfigPerf,
    VSConfigReporting
];
