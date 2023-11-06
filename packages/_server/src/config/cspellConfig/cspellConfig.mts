/* eslint-disable no-irregular-whitespace */
// Export the cspell settings to the client.

import type { LanguageSetting, OverrideSettings } from '@cspell/cspell-types';

import type { AppearanceSettings } from './AppearanceSettings.mjs';
import type { CSpellSettingsPackageProperties } from './CSpellSettingsPackageProperties.mjs';
import type { DictionaryDef } from './CustomDictionary.mjs';
import type { PrefixWithCspell } from './Generics.mjs';
import type { SpellCheckerSettings } from './SpellCheckerSettings.mjs';

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
     * Define custom dictionaries..
     * If `addWords` is `true` words will be added to this dictionary.
     *
     * This setting is subject to User/Workspace settings precedence rules: [Visual Studio Code User and Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings#_settings-precedence).
     *
     * It is better to use `#cSpell.customDictionaries#`
     *
     * **Example:**
     *
     * ```js
     * "cSpell.dictionaryDefinitions": [
     *   {
     *     "name": "project-words",
     *     "path": "${workspaceRoot}/project-words.txt",
     *     "description": "Words used in this project",
     *     "addWords": true
     *   }
     * ]
     * ```
     * @title Dictionary Definitions
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

type OverridesReduced = Omit<OverrideSettings, 'dictionaryDefinitions' | 'languageSettings'> &
    DictionaryDefinitions &
    LanguageSettings &
    Pick<SpellCheckerSettings, 'diagnosticLevel' | 'diagnosticLevelFlaggedWords'>;

interface Overrides {
    /**
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
            CSpellOmitFieldsFromExtensionContributesInPackageJson | keyof DictionaryDefinitions | keyof LanguageSettings | keyof Overrides
        >,
        DictionaryDefinitions,
        LanguageSettings,
        Overrides {}

export type AllSpellCheckerSettingsInVSCode = SpellCheckerSettingsVSCodeBase;
export type AllSpellCheckerSettingsInVSCodeWithPrefix = PrefixWithCspell<AllSpellCheckerSettingsInVSCode>;

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
    | 'suggestWords'
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
    | 'diagnosticLevelFlaggedWords'
    | 'diagnosticLevelSCM'
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
    | keyof _VSConfigAppearance
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
    | 'mergeCSpellSettings'
    | 'mergeCSpellSettingsFields'
    | 'noConfigSearch'
    | 'spellCheckOnlyWorkspaceFiles'
    | 'useGitignore'
    | 'usePnP'
    | 'workspaceRootPath'
>;

/**
 * @title Appearance
 * @order 6
 */
type VSConfigAppearance = PrefixWithCspell<_VSConfigAppearance>;
type _VSConfigAppearance = Pick<SpellCheckerSettingsVSCodeBase, keyof AppearanceSettings>;

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
    VSConfigAppearance,
    VSConfigLegacy,
    VSConfigPerf,
    VSConfigReporting,
];
