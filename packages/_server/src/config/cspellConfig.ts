// Export the cspell settings to the client.

import type {
    DictionaryId,
    FsPath,
    CSpellSettings,
    CSpellUserSettingsWithComments as CSpellLibUserSettingsWithComments,
    CustomDictionaryScope,
} from '@cspell/cspell-types';
export type {
    LanguageSetting,
    DictionaryDefinition,
    DictionaryFileTypes,
    CustomDictionaryScope,
    DictionaryDefinitionCustom,
} from '@cspell/cspell-types';

export interface SpellCheckerSettings {
    /**
     * The limit in K-Bytes to be checked in a file.
     * @scope resource
     * @default 500
     */
    checkLimit?: number;

    /**
     * @default "Information"
     * @scope resource
     * @description Issues found by the spell checker are marked with a Diagnostic Severity Level. This affects the color of squiggle.
     */
    diagnosticLevel?: 'Error' | 'Warning' | 'Information' | 'Hint';

    /**
     * Control which file schemas will be checked for spelling (VS Code must be restarted for this setting to take effect).
     * @scope resource
     * @default ["file", "gist", "sftp", "untitled"]
     */
    allowedSchemas?: string[];

    /**
     * Set the Debug Level for logging messages.
     * @scope window
     * @default "Error"
     */
    logLevel?: 'None' | 'Error' | 'Warning' | 'Information' | 'Debug';

    // Show the spell checker status on the status bar.
    /**
     * Display the spell checker status on the status bar.
     * @scope application
     * @default true
     */
    showStatus?: boolean;

    /**
     * The side of the status bar to display the spell checker status.
     * @scope application
     * @default "Left"
     */
    showStatusAlignment?: 'Left' | 'Right';

    /**
     * Delay in ms after a document has changed before checking it for spelling errors.
     * @scope application
     * @default 50
     */
    spellCheckDelayMs?: number;

    /**
     * Use Rename when fixing spelling issues.
     * @scope application
     * @default true
     */
    fixSpellingWithRenameProvider?: boolean;
    /**
     * Show Spell Checker actions in Editor Context Menu
     * @scope application
     * @default true
     */
    showCommandsInEditorContextMenu?: boolean;

    /**
     * @title File Types to Check
     * @scope resource
     * @uniqueItems true
     * @pattern ^!?[\w_\-]+$
     * @markdownDescription
     * Enable / Disable checking file types (languageIds).
     * These are in additional to the file types specified by `cSpell.enabledLanguageIds`.
     * To disable a language, prefix with `!` as in `!json`,
     *
     * Example:
     * ```
     * jsonc       // enable checking for jsonc
     * !json       // disable checking for json
     * kotlin      // enable checking for kotlin
     * ```
     */
    enableFiletypes?: string[];

    /**
     * @title Workspace Root Folder Path
     * @scope resource
     * @markdownDescription
     * Define the path to the workspace root folder in a multi-root workspace.
     * By default it is the first folder.
     *
     * This is used to find the `cspell.json` file for the workspace.
     *
     * Example: use the `client` folder
     * ```
     * ${workspaceFolder:client}
     * ```
     */
    workspaceRootPath?: string;

    /**
     * @title Custom User Dictionaries
     * @scope application
     * @markdownDescription
     * Define custom dictionaries to be included by default for the user.
     * If `addWords` is `true` words will be added to this dictionary.
     * @deprecated
     * @deprecationMessage - Use `customDictionaries` instead.
     */
    customUserDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Workspace Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default for the workspace.
     * If `addWords` is `true` words will be added to this dictionary.
     * @deprecated
     * @deprecationMessage - Use `customDictionaries` instead.
     */
    customWorkspaceDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Folder Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default for the folder.
     * If `addWords` is `true` words will be added to this dictionary.
     * @deprecated
     * @deprecationMessage - Use `customDictionaries` instead.
     */
    customFolderDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default for the folder.
     * If `addWords` is `true` words will be added to this dictionary.
     */
    customDictionaries?: CustomDictionaries;
}

/**
 * @title Named dictionary to be enabled / disabled
 * @markdownDescription
 * - `true` - turn on the named dictionary
 * - `false` - turn off the named dictionary
 */
type EnableCustomDictionary = boolean;

export type CustomDictionaries = {
    [Name in DictionaryId]: EnableCustomDictionary | CustomDictionariesDictionary;
};

export type CustomDictionaryEntry = CustomDictionary | DictionaryId;

type OptionalField<T, K extends keyof T> = { [k in K]?: T[k] } & Omit<T, K>;

/**
 * @title Custom Dictionary Entry
 * @markdownDescription
 * Define a custom dictionary to be included.
 */
interface CustomDictionariesDictionary extends OptionalField<CustomDictionary, 'name'> {}

export interface CustomDictionary {
    /**
     * @title Name of Dictionary
     * @markdownDescription
     * The reference name of the dictionary.
     * example: `My Words` or `custom`
     * If they name matches a pre-defined dictionary, it will override the pre-defined dictionary.
     * If you use: `typescript` it will replace the built-in TypeScript dictionary.
     */
    name: DictionaryId;

    /**
     * @title Description of the Dictionary
     * @markdownDescription
     * Optional: A human readable description.
     */
    description?: string;

    /**
     * @title Optional Path to Dictionary Text File
     * @markdownDescription
     * Define the path to the dictionary text file.
     * Note: if path is `undefined` the `name`d dictionary is expected to be found
     * in the `dictionaryDefinitions`.
     *
     * File Format: Each line in the file is considered a dictionary entry.
     *
     * Case is preserved while leading and trailing space is removed.
     *
     * The path should be absolute, or relative to the workspace.
     *
     * Example: relative to User's folder
     * ```
     * ~/dictionaries/custom_dictionary.txt
     * ```
     *
     * Example: relative to the `client` folder in a multi-root workspace
     * ```
     * ${workspaceFolder:client}/build/custom_dictionary.txt
     * ```
     *
     * Example: relative to the current workspace folder in a single-root workspace
     * Note - this might no as expected in a multi-root workspace since it is based upon the relative
     * workspace for the currently open file.
     * ```
     * ${workspaceFolder}/build/custom_dictionary.txt
     * ```
     *
     * Example: relative to the workspace folder in a single-root workspace or the first folder in
     * a multi-root workspace
     * ```
     * ./build/custom_dictionary.txt
     * ```
     */
    path?: FsPath;

    /**
     * @title Add Words to Dictionary
     * @markdownDescription
     * Indicate if this custom dictionary should be used to store added words.
     * @default false
     */
    addWords?: boolean;

    /**
     * @title Scope of dictionary
     * @markdownDescription
     * Options are
     * - `user` - words that apply to all projects and workspaces
     * - `workspace` - words that apply to the entire workspace
     * - `folder` - words that apply to only a workspace folder
     */
    scope?: CustomDictionaryScope | CustomDictionaryScope[];
}

export interface CustomDictionaryWithScope extends CustomDictionary {}

export interface CSpellUserSettingsWithComments extends CSpellLibUserSettingsWithComments, SpellCheckerSettings {}
export interface CSpellUserSettings extends SpellCheckerSettings, CSpellSettings {}

export type SpellCheckerSettingsProperties = keyof SpellCheckerSettings;
export type SpellCheckerSettingsVSCodePropertyKeys = `cspell.${keyof CSpellUserSettings}`;

type AsString<S extends string> = S;

type Prefix<T, P extends string> = {
    [Property in keyof T as `${P}${AsString<string & Property>}`]: T[Property];
};

export type SpellCheckerSettingsVSCodeBase = Omit<CSpellUserSettings, '$schema' | 'description' | 'files' | 'id' | 'name' | 'version'>;

export type SpellCheckerSettingsVSCodeProperties = Prefix<SpellCheckerSettingsVSCodeBase, 'cSpell.'>;

export type SpellCheckerSettingsVSCode = SpellCheckerSettingsVSCodeBase;
