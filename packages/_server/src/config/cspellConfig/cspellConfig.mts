/* eslint-disable no-irregular-whitespace */
// Export the cspell settings to the client.

import type {
    CSpellUserSettings as CSpellLibSettings,
    LanguageSetting as CSpellLanguageSetting,
    OverrideSettings as CSpellOverrideSettings,
} from '@cspell/cspell-types';

import type { AppearanceSettings } from './AppearanceSettings.mjs';
import type { CSpellSettingsPackageProperties } from './CSpellSettingsPackageProperties.mjs';
import type { DictionaryDef } from './CustomDictionary.mjs';
import type { FileTypesAndSchemeSettings } from './FileTypesAndSchemeSettings.mjs';
import type { PrefixWithCspell } from './Generics.mjs';
import type {
    AdvancedSettings,
    ExperimentalSettings,
    MenusAndActions,
    SpellCheckerBehaviorSettings,
    SpellCheckerSettings,
} from './SpellCheckerSettings.mjs';

type InternalSettings = object;

export interface CSpellUserAndExtensionSettings extends SpellCheckerSettings, CSpellSettingsPackageProperties, InternalSettings {}

export type SpellCheckerSettingsProperties = keyof SpellCheckerSettings;
export type SpellCheckerSettingsVSCodePropertyKeys = `cspell.${keyof CSpellUserAndExtensionSettings}`;

export interface DictionaryDefinitions {
    /**
     * Define custom dictionaries.
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

type InternalLanguageSetting = Omit<CSpellLanguageSetting, 'local' | 'dictionaryDefinitions'> & DictionaryDefinitions;

export interface LanguageSetting extends InternalLanguageSetting {
    /**
     * @note Matches against `languageId` (File Type)
     * @order 1
     */
    languageId: InternalLanguageSetting['languageId'];

    /**
     * @note Matches against `language`
     * @order 2
     */
    locale?: InternalLanguageSetting['locale'];
}

export interface LanguageSettings {
    /**
     * Additional settings for individual programming languages and locales.
     * @scope resource
     */
    languageSettings?: LanguageSetting[];
}

interface InternalOverrideSettings extends Omit<CSpellOverrideSettings, 'dictionaryDefinitions' | 'languageSettings'> {
    /**
     * The filename glob pattern to which this override applies. This is how the override determines which files it affects.
     *
     * Example to set the language for all TypeScript files:
     * ```jsonc
     * {
     *   "filename": "**​/french/**", // match all files in the french directory
     *   "language": "fr" // Apply French language settings to all files in the french directory
     * }
     * ```
     * Example to set the file type for a specific set of files:
     * ```jsonc
     * {
     *   "filename": "**​/*.ts",
     *   "languageId": "typescript"
     * }
     * ```
     * @note Selects Files
     * @order 1
     */
    filename: string | string[];
}

export type OverrideSettings = InternalOverrideSettings &
    DictionaryDefinitions &
    LanguageSettings &
    Pick<SpellCheckerSettings, 'diagnosticLevel' | 'diagnosticLevelFlaggedWords'>;

export interface Overrides {
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
    overrides?: OverrideSettings[];
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
    extends
        Omit<
            CSpellUserAndExtensionSettings,
            CSpellOmitFieldsFromExtensionContributesInPackageJson | keyof DictionaryDefinitions | keyof LanguageSettings | keyof Overrides
        >,
        DictionaryDefinitions,
        LanguageSettings,
        Overrides {}

export type AllSpellCheckerSettingsInVSCode = SpellCheckerSettingsVSCodeBase;
export type AllSpellCheckerSettingsInVSCodeWithPrefix = PrefixWithCspell<AllSpellCheckerSettingsInVSCode>;

/**
 * @title Code Spell Checker
 * @description Settings that control the behavior of the spell checker.
 * @order 0
 */
type VSConfigRoot = PrefixWithCspell<_VSConfigRoot>;
type _VSConfigRoot = Pick<SpellCheckerSettingsVSCodeBase, 'enabled'>;

/**
 * @title Languages and Dictionaries
 * @description Settings that control dictionaries and language preferences.
 * @order 1
 */
type VSConfigLanguageAndDictionaries = PrefixWithCspell<_VSConfigLanguageAndDictionaries>;
type _VSConfigLanguageAndDictionaries = Pick<
    SpellCheckerSettingsVSCodeBase,
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
    | 'useLocallyInstalledCSpellDictionaries'
    | 'userWords'
    | 'words'
>;

/**
 * @title Reporting and Display
 * @description Settings that control how the spell checker reports and displays errors.
 * @order 2
 */
type VSConfigReporting = PrefixWithCspell<_VSConfigReporting>;
type _VSConfigReporting = Pick<
    SpellCheckerSettingsVSCodeBase,
    | 'autocorrect'
    | 'autoFormatConfigFile'
    | 'diagnosticLevel'
    | 'diagnosticLevelFlaggedWords'
    | 'maxDuplicateProblems'
    | 'maxNumberOfProblems'
    | 'minWordLength'
    | 'numSuggestions'
    // | 'reportUnknownWords' // to ba added when it has been finalized.
    | 'showAutocompleteDirectiveSuggestions'
    | 'suggestionNumChanges'
    | 'unknownWords'
    | 'validateDirectives'
    | keyof SpellCheckerBehaviorSettings
>;

/**
 * @title Performance
 * @description Settings that control the performance of the spell checker.
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
 * @title Menus and Actions
 * @description Settings that control the menu items and actions available in the spell checker.
 * @order 7
 */
type VSConfigMenusAndActions = PrefixWithCspell<_VSConfigMenusAndActions>;
type _VSConfigMenusAndActions = Pick<SpellCheckerSettingsVSCodeBase, keyof MenusAndActions>;

type ExtensionConfigKeys =
    | keyof _VSConfigAdvanced
    | keyof _VSConfigAppearance
    | keyof _VSConfigExperimental
    | keyof _VSConfigFilesAndFolders
    | keyof _VSConfigLanguageAndDictionaries
    | keyof _VSConfigLegacy
    | keyof _VSConfigMenusAndActions
    | keyof _VSConfigPerf
    | keyof _VSConfigReporting
    | keyof _VSConfigRoot;

type KeysCSpellLibSettings = keyof CSpellLibSettings;

type UnassignedConfigKeysGoingToCSpell = Exclude<keyof SpellCheckerSettingsVSCodeBase, ExtensionConfigKeys | KeysCSpellLibSettings>;

/**
 * @title CSpell
 * @description Settings related to CSpell Command Line Tool.
 * @order 5
 */
type VSConfigCSpell = PrefixWithCspell<_VSConfigCSpell>;
type _VSConfigCSpell = Omit<SpellCheckerSettingsVSCodeBase, ExtensionConfigKeys>;

/**
 * @title Files, Folders, and Workspaces
 * @description Settings that control which files and folders are spell checked.
 * @order 3
 */
type VSConfigFilesAndFolders = PrefixWithCspell<_VSConfigFilesAndFolders>;
type _VSConfigFilesAndFolders = Pick<
    SpellCheckerSettingsVSCodeBase,
    | 'allowedSchemas'
    | 'checkOnlyEnabledFileTypes'
    | 'checkVSCodeSystemFiles'
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
    | keyof FileTypesAndSchemeSettings
>;

/**
 * @title Appearance
 * @description Settings that control the appearance of the spell checker.
 * @order 6
 */
type VSConfigAppearance = PrefixWithCspell<_VSConfigAppearance>;
type _VSConfigAppearance = Pick<SpellCheckerSettingsVSCodeBase, keyof AppearanceSettings>;

/**
 * @title Legacy
 * @description Legacy settings that have been deprecated or are not commonly used.
 * @order 20
 */
type VSConfigLegacy = PrefixWithCspell<_VSConfigLegacy>;
type _VSConfigLegacy = Pick<
    SpellCheckerSettingsVSCodeBase,
    | 'allowCompoundWords'
    | 'customFolderDictionaries'
    | 'customUserDictionaries'
    | 'customWorkspaceDictionaries'
    | 'enabledLanguageIds'
    | 'showStatus'
    | 'showStatusAlignment'
>;

/**
 * @title Advanced
 * @description Advanced settings that are not commonly used.
 * @order 18
 */
export type VSConfigAdvanced = PrefixWithCspell<_VSConfigAdvanced>;
type _VSConfigAdvanced = Pick<
    SpellCheckerSettingsVSCodeBase,
    | keyof AdvancedSettings
    | 'advanced.feature.useReferenceProviderWithRename'
    | 'advanced.feature.useReferenceProviderRemove'
    | 'fixSpellingWithRenameProvider'
    | 'logFile'
    | 'logLevel'
    | 'trustedWorkspace'
>;

/**
 * @title Experimental
 * @description Experimental settings that may change or be removed in the future.
 * @order 19
 */
type VSConfigExperimental = PrefixWithCspell<_VSConfigExperimental>;
type _VSConfigExperimental = Pick<
    SpellCheckerSettingsVSCodeBase,
    | keyof ExperimentalSettings
    // The plan is to move `reportUnknownWords` to the reporting section.
    | 'reportUnknownWords'
>;

export type SpellCheckerSettingsVSCode = [
    VSConfigAdvanced,
    VSConfigAppearance,
    VSConfigCSpell,
    VSConfigExperimental,
    VSConfigFilesAndFolders,
    VSConfigLanguageAndDictionaries,
    VSConfigLegacy,
    VSConfigMenusAndActions,
    VSConfigPerf,
    VSConfigReporting,
    VSConfigRoot,
];

/**
 * This is a compile-time check to ensure that there are no unassigned
 * configuration keys going to CSpell.
 */
export const unusedConfig: unknown = {} as const satisfies Record<UnassignedConfigKeysGoingToCSpell, boolean>;
