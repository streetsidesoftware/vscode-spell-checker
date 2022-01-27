// Export the cspell settings to the client.

import type {
    CSpellSettings,
    CustomDictionaryScope,
    DictionaryDefinitionCustom,
    DictionaryDefinitionPreferred,
    LanguageSetting,
    OverrideSettings,
    DictionaryId,
    FsPath,
    GlobDef,
    SimpleGlob,
} from '@cspell/cspell-types';
export type {
    CustomDictionaryScope,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
    DictionaryFileTypes,
    LanguageSetting,
} from '@cspell/cspell-types';

export interface SpellCheckerSettings extends SpellCheckerShouldCheckDocSettings {
    /**
     * The limit in K-Characters to be checked in a file.
     * @scope resource
     * @default 500
     */
    checkLimit?: number;

    /**
     * @scope resource
     * @description Issues found by the spell checker are marked with a Diagnostic Severity Level. This affects the color of squiggle.
     * @default "Information"
     * @enumDescriptions [
     *  "Report Spelling Issues as Errors",
     *  "Report Spelling Issues as Warnings",
     *  "Report Spelling Issues as Information",
     *  "Report Spelling Issues as Hints, will not show up in Problems"]
     */
    diagnosticLevel?: 'Error' | 'Warning' | 'Information' | 'Hint';

    /**
     * Control which file schemas will be checked for spelling (VS Code must be restarted for this setting to take effect).
     * @markdownDescription
     * Control which file schemas will be checked for spelling (VS Code must be restarted for this setting to take effect).
     *
     * Some schemas have special meaning like:
     * - `untitled` - Used for new documents that have not yet been saved
     * - `vscode-notebook-cell` - Used for validating segments of a Notebook.
     * @scope window
     * @default ["file", "gist", "sftp", "untitled", "vscode-notebook-cell"]
     */
    allowedSchemas?: string[];

    /**
     * Set the Debug Level for logging messages.
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
     * @default "Right"
     * @enumDescriptions [
     *  "Left Side of Statusbar",
     *  "Right Side of Statusbar"]
     */
    showStatusAlignment?: 'Left' | 'Right';

    /**
     * Show CSpell in-document directives as you type.
     * @markdownDescription
     * Show CSpell in-document directives as you type.
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
     * Use Rename when fixing spelling issues.
     * @scope language-overridable
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
    enableFiletypes?: EnableFileTypeId[];

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
     * @deprecated true
     * @deprecationMessage - Use `customDictionaries` instead.
     */
    customUserDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Workspace Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default for the workspace.
     * If `addWords` is `true` words will be added to this dictionary.
     * @deprecated true
     * @deprecationMessage - Use `customDictionaries` instead.
     */
    customWorkspaceDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Folder Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default for the folder.
     * If `addWords` is `true` words will be added to this dictionary.
     * @deprecated true
     * @deprecationMessage - Use `customDictionaries` instead.
     */
    customFolderDictionaries?: CustomDictionaryEntry[];

    /**
     * @title Custom Dictionaries
     * @scope resource
     * @markdownDescription
     * Define custom dictionaries to be included by default.
     * If `addWords` is `true` words will be added to this dictionary.
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
     * This same effect can be achieved using the `files` setting.
     *
     * ```
     * "cSpell.files": ["**", "**​/.*", "**​/.*​/**"]
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
}

/**
 * @title Named dictionary to be enabled / disabled
 * @markdownDescription
 * - `true` - turn on the named dictionary
 * - `false` - turn off the named dictionary
 */
type EnableCustomDictionary = boolean;

/**
 * @markdownDescription
 * Enable / Disable checking file types (languageIds).
 * To disable a language, prefix with `!` as in `!json`,
 *
 * Example:
 * ```
 * jsonc       // enable checking for jsonc
 * !json       // disable checking for json
 * kotlin      // enable checking for kotlin
 * ```
 * @pattern ^!?(?!\s)[\s\w_.\-]+$
 * @patternErrorMessage "Allowed characters are `a-zA-Z`, `.`, `-`, `_` and space."
 */
type EnableFileTypeId = string;

interface SpellCheckerShouldCheckDocSettings {
    /**
     * @markdownDescription
     * The maximum line length.
     *
     * Block spell checking if lines are longer than the value given.
     * This is used to prevent spell checking generated files.
     *
     * **Error Message:** _Lines are too long._
     *
     * @scope language-overridable
     * @default 10000
     */
    blockCheckingWhenLineLengthGreaterThan?: number;
    /**
     * @markdownDescription
     * The maximum length of a chunk of text without word breaks.
     *
     * It is used to prevent spell checking of generated files.
     *
     * A chunk is the characters between absolute word breaks.
     * Absolute word breaks match: `/[\s,{}[\]]/`, i.e. spaces or braces.
     *
     * **Error Message:** _Maximum Word Length is Too High._
     *
     * If you are seeing this message, it means that the file contains a very long line
     * without many word breaks.
     *
     * @scope language-overridable
     * @default 500
     */
    blockCheckingWhenTextChunkSizeGreaterThan?: number;
    /**
     * @markdownDescription
     * The maximum average length of chunks of text without word breaks.
     *
     * A chunk is the characters between absolute word breaks.
     * Absolute word breaks match: `/[\s,{}[\]]/`
     *
     * **Error Message:** _Average Word Size is Too High._
     *
     * If you are seeing this message, it means that the file contains mostly long lines
     * without many word breaks.
     *
     * @scope language-overridable
     * @default 80
     */
    blockCheckingWhenAverageChunkSizeGreaterThan?: number;
}

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
export interface CustomDictionariesDictionary extends OptionalField<CustomDictionary, 'name'> {}

export interface CustomDictionary {
    /**
     * @title Name of Dictionary
     * @markdownDescription
     * The reference name of the dictionary.
     *
     * Example: `My Words` or `custom`
     *
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
     *
     * **Note:** if path is `undefined` the `name`d dictionary is expected to be found
     * in the `dictionaryDefinitions`.
     *
     * File Format: Each line in the file is considered a dictionary entry.
     *
     * Case is preserved while leading and trailing space is removed.
     *
     * The path should be absolute, or relative to the workspace.
     *
     * **Example:** relative to User's folder
     *
     * ```
     * ~/dictionaries/custom_dictionary.txt
     * ```
     *
     * **Example:** relative to the `client` folder in a multi-root workspace
     *
     * ```
     * ${workspaceFolder:client}/build/custom_dictionary.txt
     * ```
     *
     * **Example:** relative to the current workspace folder in a single-root workspace
     *
     * **Note:** this might no as expected in a multi-root workspace since it is based upon the relative
     * workspace for the currently open file.
     *
     * ```
     * ${workspaceFolder}/build/custom_dictionary.txt
     * ```
     *
     * **Example:** relative to the workspace folder in a single-root workspace or the first folder in
     * a multi-root workspace
     *
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

/**
 * @hidden
 */
type HiddenFsPath = FsPath;

/**
 * CSpellSettingsPackageProperties are used to annotate CSpellSettings found in
 * the `package.json#contributes.configuration`
 */
interface CSpellSettingsPackageProperties extends CSpellSettings {
    /**
     * Enable / Disable the spell checker.
     * @scope resource
     * @default true
     */
    enabled?: boolean;

    /**
     * @scope resource
     * @description
     * Current active spelling language.
     * Example: "en-GB" for British English
     * Example: "en,nl" to enable both English and Dutch
     * @default "en"
     */
    language?: string;

    /**
     * @scope resource
     * @description
     * Controls the maximum number of spelling errors per document.
     * @default 100
     */
    maxNumberOfProblems?: number;

    /**
     * @scope resource
     * @description
     * Controls the number of suggestions shown.
     * @default 8
     */
    numSuggestions?: number;

    /**
     * @scope resource
     * @default 3
     */
    suggestionNumChanges?: CSpellSettings['suggestionNumChanges'];

    /**
     * @scope resource
     * @default 400
     */
    suggestionsTimeout?: CSpellSettings['suggestionsTimeout'];

    /**
     * @scope resource
     * @default 4
     */
    minWordLength?: number;

    /**
     * @scope resource
     * @default 5
     */
    maxDuplicateProblems?: number;

    /**
     * @title Enabled Language Ids
     * @scope resource
     * @description
     * Specify file types to spell check. Use `cSpell.enableFiletypes` to Enable / Disable checking files types.
     * @markdownDescription
     * Specify a list of file types to spell check. It is better to use `cSpell.enableFiletypes` to Enable / Disable checking files types.
     * @uniqueItems true
     * @default [
     *       "asciidoc",
     *       "c",
     *       "cpp",
     *       "csharp",
     *       "css",
     *       "git-commit",
     *       "go",
     *       "graphql",
     *       "handlebars",
     *       "haskell",
     *       "html",
     *       "jade",
     *       "java",
     *       "javascript",
     *       "javascriptreact",
     *       "json",
     *       "jsonc",
     *       "jupyter",
     *       "latex",
     *       "less",
     *       "markdown",
     *       "php",
     *       "plaintext",
     *       "python",
     *       "pug",
     *       "restructuredtext",
     *       "rust",
     *       "scala",
     *       "scss",
     *       "swift",
     *       "text",
     *       "typescript",
     *       "typescriptreact",
     *       "vue",
     *       "yaml",
     *       "yml"
     *     ]
     */
    enabledLanguageIds?: string[];

    /**
     * @scope resource
     */
    import?: FsPath[] | HiddenFsPath;

    /**
     * @scope resource
     */
    words?: string[];

    /**
     * @scope resource
     */
    userWords?: string[];

    /**
     * A list of words to be ignored by the spell checker.
     * @scope resource
     */
    ignoreWords?: string[];

    /**
     * Glob patterns of files to be ignored. The patterns are relative to the `globRoot` of the configuration file that defines them.
     * @title Glob patterns of files to be ignored
     * @scope resource
     * @default [
     *      "package-lock.json",
     *      "node_modules",
     *      "vscode-extension",
     *      ".git/objects",
     *      ".vscode",
     *      ".vscode-insiders"
     *    ]
     */
    ignorePaths?: (SimpleGlob | GlobDefX)[];

    /**
     * The root to use for glop patterns found in this configuration.
     * Default: The current workspace folder.
     * Use `globRoot` to define a different location. `globRoot` can be relative to the location of this configuration file.
     * Defining globRoot, does not impact imported configurations.
     *
     * Special Values:
     *
     * - `${workspaceFolder}` - Default - globs will be relative to the current workspace folder\n
     * - `${workspaceFolder:<name>}` - Where `<name>` is the name of the workspace folder.
     *
     * @scope resource
     */
    globRoot?: CSpellSettings['globRoot'];

    /**
     * @scope resource
     */
    files?: CSpellSettings['files'];

    /**
     * @scope resource
     */
    flagWords?: string[];

    /**
     * @scope resource
     */
    patterns?: CSpellSettings['patterns'];

    /**
     * @scope resource
     */
    includeRegExpList?: CSpellSettings['includeRegExpList'];

    /**
     * @scope resource
     */
    ignoreRegExpList?: CSpellSettings['ignoreRegExpList'];

    /**
     * Enable / Disable allowing word compounds. `true` means `arraylength` would be ok, `false` means it would not pass.
     * @scope resource
     * @default false
     * @markdownDescription
     * Enable / Disable allowing word compounds.
     * - `true` means `arraylength` would be ok
     * - `false` means it would not pass.
     *
     * Note: this can also cause many misspelled words to seem correct.
     */
    allowCompoundWords?: CSpellSettings['allowCompoundWords'];

    /**
     * @scope resource
     */
    languageSettings?: CSpellSettings['languageSettings'];

    /**
     * @scope resource
     */
    dictionaries?: CSpellSettings['dictionaries'];

    /**
     * @scope resource
     */
    dictionaryDefinitions?: CSpellSettings['dictionaryDefinitions'];

    /**
     * @scope resource
     */
    overrides?: CSpellSettings['overrides'];

    /**
     * @scope resource
     * @markdownDescription
     * Turns on case sensitive checking by default
     */
    caseSensitive?: CSpellSettings['caseSensitive'];

    /**
     * @hidden
     */
    languageId?: CSpellSettings['languageId'];

    /**
     * @scope resource
     */
    noConfigSearch?: CSpellSettings['noConfigSearch'];

    /**
     * @scope window
     * @default true
     */
    useGitignore?: CSpellSettings['useGitignore'];

    /**
     * Hide this for now.
     * Need to resolve the roots and support substitution of workspace paths.
     * @hidden
     */
    gitignoreRoot?: CSpellSettings['gitignoreRoot'];

    /**
     * @hidden
     */
    pnpFiles?: CSpellSettings['pnpFiles'];

    /**
     * @scope resource
     */
    usePnP?: CSpellSettings['usePnP'];

    /**
     * @hidden
     */
    readonly?: CSpellSettings['readonly'];

    /**
     * @scope resource
     */
    noSuggestDictionaries?: CSpellSettings['noSuggestDictionaries'];
}

/**
 * @hidden
 */
type GlobDefX = GlobDef;

export interface CustomDictionaryWithScope extends CustomDictionary {}

export interface CSpellUserSettings extends SpellCheckerSettings, CSpellSettingsPackageProperties {}

export type SpellCheckerSettingsProperties = keyof SpellCheckerSettings;
export type SpellCheckerSettingsVSCodePropertyKeys = `cspell.${keyof CSpellUserSettings}`;

type AsString<S extends string> = S;

type Prefix<T, P extends string> = {
    [Property in keyof T as `${P}${AsString<string & Property>}`]: T[Property];
};

type DictionaryDef =
    | Omit<DictionaryDefinitionPreferred, 'type' | 'useCompounds' | 'repMap'>
    | Omit<DictionaryDefinitionCustom, 'type' | 'useCompounds' | 'repMap'>;

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
     * Overrides to apply based upon the file path.
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

export type SpellCheckerSettingsVSCodeProperties = Prefix<SpellCheckerSettingsVSCodeBase, 'cSpell.'>;

export type SpellCheckerSettingsVSCode = SpellCheckerSettingsVSCodeBase;
