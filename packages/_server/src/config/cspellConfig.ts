// Export the cspell settings to the client.

import {
    DictionaryId,
    FsPath,
    DictionaryFileTypes,
    CSpellSettings,
    CSpellUserSettingsWithComments as CSpellLibUserSettingsWithComments,
} from '@cspell/cspell-types';
export { LanguageSetting, DictionaryDefinition, DictionaryFileTypes } from '@cspell/cspell-types';

export const defaultDictionaryType: DictionaryFileTypes = 'S';

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
     */
    customUserDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Workspace Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default for the workspace.
     * If `addWords` is `true` words will be added to this dictionary.
     */
    customWorkspaceDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Folder Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default for the folder.
     * If `addWords` is `true` words will be added to this dictionary.
     */
    customFolderDictionaries?: CustomDictionaryEntry[];
}

export type CustomDictionaryEntry = CustomDictionary | DictionaryId;

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
     * @title Path to Dictionary Text File
     * @markdownDescription
     * Define the path to the dictionary text file.
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
}

export interface CSpellUserSettingsWithComments extends CSpellLibUserSettingsWithComments, SpellCheckerSettings {}
export interface CSpellUserSettings extends CSpellSettings, SpellCheckerSettings {}

export type SpellCheckerSettingsProperties = keyof SpellCheckerSettings;
