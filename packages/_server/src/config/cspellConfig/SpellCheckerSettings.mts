import type { EnableFileTypeId, RegExpString } from './annotatedTypes.mjs';
import type { CustomDictionaries, CustomDictionaryEntry } from './CustomDictionary.mjs';
import type { SpellCheckerShouldCheckDocSettings } from './SpellCheckerShouldCheckDocSettings.mjs';

export interface SpellCheckerSettings extends SpellCheckerShouldCheckDocSettings {
    /**
     * @title Auto Format Configuration File
     * @markdownDescription
     * If a `cspell` configuration file is updated, format the configuration file
     * using the VS Code Format Document Provider. This will cause the configuration
     * file to be saved prior to being updated.
     * @scope window
     * @default false
     */
    autoFormatConfigFile?: boolean;

    /**
     * The limit in K-Characters to be checked in a file.
     * @scope resource
     * @default 500
     */
    checkLimit?: number;

    /**
     * @title Set Diagnostic Reporting Level
     * @scope resource
     * @description Issues found by the spell checker are marked with a Diagnostic Severity Level. This affects the color of the squiggle.
     * @default "Information"
     * @enumDescriptions [
     *  "Report Spelling Issues as Errors",
     *  "Report Spelling Issues as Warnings",
     *  "Report Spelling Issues as Information",
     *  "Report Spelling Issues as Hints, will not show up in Problems"]
     */
    diagnosticLevel?: 'Error' | 'Warning' | 'Information' | 'Hint';

    /**
     * @title Define Allowed Schemas
     * @markdownDescription
     * Control which file schemas will be checked for spelling (VS Code must be restarted for this setting to take effect).
     *
     *
     * Some schemas have special meaning like:
     * - `untitled` - Used for new documents that have not yet been saved
     * - `vscode-notebook-cell` - Used for validating segments of a Notebook.
     * - `vscode-userdata` - Needed to spell check `.code-snippets`
     * @scope window
     * @default ["file", "gist", "repo", "sftp", "untitled", "vscode-notebook-cell", "vscode-scm", "vscode-userdata"]
     */
    allowedSchemas?: string[];

    /**
     * Set the Debug Level for logging messages.
     * @title Set Logging Level
     * @scope window
     * @default "Error"
     * @enumDescriptions [
     *  "Do not log",
     *  "Log only errors",
     *  "Log errors and warnings",
     *  "Log errors, warnings, and info",
     *  "Log everything (noisy)"]
     */
    logLevel?: 'None' | 'Error' | 'Warning' | 'Information' | 'Debug';

    /**
     * Have the logs written to a file instead of to VS Code.
     * @title Write Logs to a File
     * @scope window
     */
    logFile?: string;

    /**
     * Display the spell checker status on the status bar.
     * @scope application
     * @default true
     */
    showStatus?: boolean;

    /**
     * The side of the status bar to display the spell checker status.
     * @scope application
     * @default "Right"
     * @enumDescriptions [
     *  "Left Side of Statusbar",
     *  "Right Side of Statusbar"]
     */
    showStatusAlignment?: 'Left' | 'Right';

    /**
     * @markdownDescription
     * Show CSpell in-document directives as you type.
     *
     * **Note:** VS Code must be restarted for this setting to take effect.
     * @scope language-overridable
     * @default false
     */
    showAutocompleteSuggestions?: boolean;

    /**
     * Delay in ms after a document has changed before checking it for spelling errors.
     * @scope application
     * @default 50
     */
    spellCheckDelayMs?: number;

    /**
     * @markdownDescription
     * Use Rename Provider when fixing spelling issues.
     * @scope language-overridable
     * @default true
     */
    fixSpellingWithRenameProvider?: boolean;

    /**
     * @title Use Reference Provider During Rename
     * @markdownDescription
     * Use the Reference Provider when fixing spelling issues with the Rename Provider.
     * This feature is used in connection with `#cSpell.fixSpellingWithRenameProvider#`
     * @scope language-overridable
     * @default false
     */
    'advanced.feature.useReferenceProviderWithRename'?: boolean;

    /**
     * @title Remove Matching Characters Before Rename
     * @markdownDescription
     * Used to work around bugs in Reference Providers and Rename Providers.
     * Anything matching the provided Regular Expression will be removed from the text
     * before sending it to the Rename Provider.
     *
     * See: [Markdown: Fixing spelling issues in Header sections changes the entire line · Issue #1987](https://github.com/streetsidesoftware/vscode-spell-checker/issues/1987)
     *
     * It is unlikely that you would need to edit this setting. If you need to, please open an issue at
     * [Spell Checker Issues](https://github.com/streetsidesoftware/vscode-spell-checker/issues)
     *
     * This feature is used in connection with `#cSpell.advanced.feature.useReferenceProviderWithRename#`
     * @scope language-overridable
     */
    'advanced.feature.useReferenceProviderRemove'?: RegExpString;

    /**
     * Show Spell Checker actions in Editor Context Menu
     * @scope application
     * @default true
     */
    showCommandsInEditorContextMenu?: boolean;

    /**
     * Show Spelling Suggestions link in the top level context menu.
     * @scope application
     * @default true
     */
    showSuggestionsLinkInEditorContextMenu?: boolean;

    /**
     * @title File Types to Check
     * @scope resource
     * @uniqueItems true
     * @markdownDescription
     * Enable / Disable checking file types (languageIds).
     *
     * These are in additional to the file types specified by `#cSpell.enabledLanguageIds#`.
     * To disable a language, prefix with `!` as in `!json`,
     *
     *
     * **Example: individual file types**
     *
     * ```
     * jsonc       // enable checking for jsonc
     * !json       // disable checking for json
     * kotlin      // enable checking for kotlin
     * ```
     *
     * **Example: enable all file types**
     *
     * ```
     * *           // enable checking for all file types
     * !json       // except for json
     * ```
     */
    enableFiletypes?: EnableFileTypeId[];

    /**
     * @title Check Only Enabled File Types
     * @scope resource
     * @default true
     * @markdownDescription
     * By default, the spell checker checks only enabled file types. Use `#cSpell.enableFiletypes#`
     * to turn on / off various file types.
     *
     * When this setting is `false`, all file types are checked except for the ones disabled by `#cSpell.enableFiletypes#`.
     * See `#cSpell.enableFiletypes#` on how to disable a file type.
     */
    checkOnlyEnabledFileTypes?: boolean;

    /**
     * @title Workspace Root Folder Path
     * @scope resource
     * @markdownDescription
     * Define the path to the workspace root folder in a multi-root workspace.
     * By default it is the first folder.
     *
     * This is used to find the `cspell.json` file for the workspace.
     *
     *
     * **Example: use the `client` folder**
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
     * @deprecated true
     * @deprecationMessage - Use `#cSpell.customDictionaries#` instead.
     */
    customUserDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Workspace Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default for the workspace.
     * If `addWords` is `true` words will be added to this dictionary.
     * @deprecated true
     * @deprecationMessage - Use `#cSpell.customDictionaries#` instead.
     */
    customWorkspaceDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Folder Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default for the folder.
     * If `addWords` is `true` words will be added to this dictionary.
     * @deprecated true
     * @deprecationMessage - Use `#cSpell.customDictionaries#` instead.
     */
    customFolderDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default.
     * If `addWords` is `true` words will be added to this dictionary.
     *
     *
     * **Example:**
     *
     * ```js
     * "cSpell.customDictionaries": {
     *   "project-words": {
     *     "name": "project-words",
     *     "path": "${workspaceRoot}/project-words.txt",
     *     "description": "Words used in this project",
     *     "addWords": true
     *   },
     *   "custom": true, // Enable the `custom` dictionary
     *   "internal-terms": false // Disable the `internal-terms` dictionary
     * }
     * ```
     */
    customDictionaries?: CustomDictionaries;

    /**
     * @title Spell Check Only Workspace Files
     * @scope window
     * @markdownDescription
     * Only spell check files that are in the currently open workspace.
     * This same effect can be achieved using the `#cSpell.files#` setting.
     *
     *
     * ```js
     * "cSpell.files": ["/**"]
     * ```
     * @default false
     */
    spellCheckOnlyWorkspaceFiles?: boolean;

    /**
     * @scope resource
     * @markdownDescription
     * The type of menu used to display spelling suggestions.
     * @default "quickPick"
     * @enumDescriptions [
     *  "Suggestions will appear as a drop down at the top of the IDE. (Best choice for Vim Key Bindings)",
     *  "Suggestions will appear inline near the word, inside the text editor."]
     */
    suggestionMenuType?: 'quickPick' | 'quickFix';

    /**
     * Show Regular Expression Explorer
     * @scope application
     * @default false
     */
    'experimental.enableRegexpView'?: boolean;

    /**
     * Enable the Settings Viewer V2 Extension
     * @scope application
     * @default false
     */
    'experimental.enableSettingsViewerV2'?: boolean;

    /**
     * @scope resource
     * @markdownDescription
     * Hide the options to add words to dictionaries or settings.
     * @default false
     */
    hideAddToDictionaryCodeActions?: boolean;

    /**
     * @scope resource
     * @markdownDescription
     * Specify where words can be added.
     *
     * **Note:** Dictionary names should be prefixed with `#`
     *
     * **Example:**
     *
     * ```js
     * "cSpell.addWordTo": {
     *   "cspell": true, // Add words to cspell configuration
     *   "#company-terms": true // Add words to the company terms dictionary.
     * }
     * ```
     *
     * NOTE: This is NOT yest supported.
     *
     * @hidden
     */
    // addWordsTo?: AddToTargets;
}

type AutoOrBoolean = boolean | 'auto';

/**
 * Reference to a dictionary
 * @pattern (^#[\s\w]+$)
 */
type DictionaryRef = string;

type Prefix<T, P extends string> = {
    [K in keyof T as K extends string ? `${P}${K}` : K]: T[K];
};
type AddToDictionaryTarget = Prefix<Record<DictionaryRef, AutoOrBoolean>, '#'>;

export interface AddToTargets extends AddToDictionaryTarget {
    /**
     * Add words to folder settings.
     * - `true` - always enable add to folder settings
     * - `false` - never enable add to folder settings
     * - `auto` - autodetect
     * @default "auto"
     */
    folder?: AutoOrBoolean;
    /**
     * Add words to workspace settings.
     * - `true` - always enable add to workspace settings
     * - `false` - never enable add to workspace settings
     * - `auto` - autodetect
     * @default "auto"
     */
    workspace?: AutoOrBoolean;
    /**
     * Add words to user settings.
     * - `true` - always enable add to user settings
     * - `false` - never enable add to user settings
     * - `auto` - autodetect
     * @default "auto"
     */
    user?: AutoOrBoolean;
    /**
     * Add words to user settings.
     * - `true` - always enable add to cspell settings
     * - `false` - never enable add to cspell settings
     * - `auto` - autodetect
     * @default "auto"
     */
    cspell?: AutoOrBoolean;
}
