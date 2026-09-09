import type { RegExpString } from './annotatedTypes.mjs';
import type { AppearanceSettings } from './AppearanceSettings.mjs';
import type { CSpellMergeFields } from './CSpellSettingsPackageProperties.mjs';
import type { CustomDictionaries, CustomDictionaryEntry } from './CustomDictionary.mjs';
import type { FileTypesAndSchemeSettings } from './FileTypesAndSchemeSettings.mjs';
import type { SpellCheckerShouldCheckDocSettings } from './SpellCheckerShouldCheckDocSettings.mjs';

export type DiagnosticLevel = 'Error' | 'Warning' | 'Information' | 'Hint';

/**
 * Diagnostic level for source control _commit_ messages. Issues found by the spell checker are marked with a Diagnostic Severity Level.
 * This affects the color of the squiggle.
 *
 * By default, this setting will match `#cSpell.diagnosticLevel#`.
 *
 * See: [VS Code Diagnostic Severity Level](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity)
 * @title Set Diagnostic Reporting Level
 * @sinceVersion 4.0.0
 * @enumDescriptions [
 *  "Report Spelling Issues as Errors",
 *  "Report Spelling Issues as Warnings",
 *  "Report Spelling Issues as Information",
 *  "Report Spelling Issues as Hints, will not show up in Problems"
 *  "Do not Report Spelling Issues"]
 */
export type DiagnosticLevelExt = 'Error' | 'Warning' | 'Information' | 'Hint' | 'Off';

export type UseVSCodeDiagnosticSeverity = Record<string, DiagnosticLevelExt>;

export interface SpellCheckerUserSettings {
    /**
     * Enable / Disable autocorrect while typing.
     * @title Autocorrect
     * @scope resource
     * @default false
     */
    autocorrect?: boolean;

    /**
     * If a `cspell` configuration file is updated, format the configuration file
     * using the VS Code Format Document Provider. This will cause the configuration
     * file to be saved prior to being updated.
     * @title Auto Format Configuration File
     * @scope window
     * @default false
     */
    autoFormatConfigFile?: boolean;

    /**
     * Set the maximum number of blocks of text to check.
     * Each block is 1024 characters.
     * @scope resource
     * @default 500
     */
    checkLimit?: number;

    /**
     * The Diagnostic Severity Level determines how issues are shown in the Problems Pane and within the document.
     * Set the level to `Hint` to hide the issues from the Problems Pane.
     *
     * Note: `#cSpell.useCustomDecorations#` must be `false` to use VS Code Diagnostic Severity Levels.
     *
     * See: [VS Code Diagnostic Severity Level](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity)
     * @title Set Diagnostic Reporting Level
     * @scope resource
     * @default "Information"
     * @enumDescriptions [
     *  "Report Spelling Issues as Errors",
     *  "Report Spelling Issues as Warnings",
     *  "Report Spelling Issues as Information",
     *  "Report Spelling Issues as Hints, will not show up in Problems"]
     */
    diagnosticLevel?: DiagnosticLevel;

    /**
     * Flagged word issues found by the spell checker are marked with a Diagnostic Severity Level. This affects the color of the squiggle.
     * By default, flagged words will use the same diagnostic level as general issues. Use this setting to customize them.
     *
     * See: [VS Code Diagnostic Severity Level](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity)
     * @title Set Diagnostic Reporting Level for Flagged Words
     * @scope resource
     * @sinceVersion 4.0.0
     * @enumDescriptions [
     *  "Report Spelling Issues as Errors",
     *  "Report Spelling Issues as Warnings",
     *  "Report Spelling Issues as Information",
     *  "Report Spelling Issues as Hints, will not show up in Problems"]
     */
    diagnosticLevelFlaggedWords?: DiagnosticLevel;

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
     * @deprecationMessage No longer used.
     */
    showStatus?: boolean;

    /**
     * The side of the status bar to display the spell checker status.
     * @scope application
     * @default "Right"
     * @enumDescriptions [
     *  "Left Side of Statusbar",
     *  "Right Side of Statusbar"]
     * @deprecated true
     * @deprecationMessage No longer supported.
     */
    showStatusAlignment?: 'Left' | 'Right';

    /**
     * Show CSpell in-document directives as you type.
     *
     * **Note:** VS Code must be restarted for this setting to take effect.
     * @scope language-overridable
     * @default true
     */
    showAutocompleteDirectiveSuggestions?: boolean;

    /**
     * Delay in ms after a document has changed before checking it for spelling errors.
     * @scope application
     * @default 50
     */
    spellCheckDelayMs?: number;

    /**
     * Use Rename Provider when fixing spelling issues.
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
     * Show Spelling Suggestions link in the top level context menu.
     * @scope application
     * @default true
     */
    showSuggestionsLinkInEditorContextMenu?: boolean;

    /**
     * Control which menu items are shown on the Editor Context Menu.
     *
     * @sinceVersion 4.9.1
     * @default {
     *   suggestSpellingCorrections: true,
     *   spellingContextMenu: true,
     *   hideIssues: true,
     *   showIssues: true
     * }
     */
    menuItemsOnEditorContextMenu?: EnabledItemsInEditorContextMenu;

    /**
     * Control which menu items are shown on the Spelling Context Menu.
     * @sinceVersion 4.9.1
     * @default {
     *   suggestSpellingCorrections: true,
     *   addWordToDictionary: true,
     *   addWordToFolderDictionary: true,
     *   addWordToWorkspaceDictionary: true,
     *   addWordToCSpellConfig: true,
     *   addWordToFolderSettings: true,
     *   addWordToWorkspaceSettings: true,
     *   addWordToUserDictionary: true,
     *   addWordToUserSettings: true,
     *   addIssuesToDictionary: true,
     *   addIgnoreWord: true,
     *   createCSpellConfig: true,
     *   createCustomDictionary: true
     * }
     */
    menuItemsOnSpellingContextMenu?: EnabledItemsInSpellingContextMenu;

    /**
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
     * @title Workspace Root Folder Path
     * @scope resource
     */
    workspaceRootPath?: string;

    /**
     * Define custom dictionaries to be included by default for the user.
     * If `addWords` is `true` words will be added to this dictionary.
     * @title Custom User Dictionaries
     * @scope application
     * @deprecated true
     * @deprecationMessage - Use `#cSpell.customDictionaries#` instead.
     */
    customUserDictionaries?: CustomDictionaryEntry[];

    /**
     * Define custom dictionaries to be included by default for the workspace.
     * If `addWords` is `true` words will be added to this dictionary.
     * @title Custom Workspace Dictionaries
     * @scope resource
     * @deprecated true
     * @deprecationMessage - Use `#cSpell.customDictionaries#` instead.
     */
    customWorkspaceDictionaries?: CustomDictionaryEntry[];

    /**
     * Define custom dictionaries to be included by default for the folder.
     * If `addWords` is `true` words will be added to this dictionary.
     * @title Custom Folder Dictionaries
     * @scope resource
     * @deprecated true
     * @deprecationMessage - Use `#cSpell.customDictionaries#` instead.
     */
    customFolderDictionaries?: CustomDictionaryEntry[];

    /**
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
     * @title Custom Dictionaries
     * @scope resource
     */
    customDictionaries?: CustomDictionaries;

    /**
     * Only spell check files that are in the currently open workspace.
     * This same effect can be achieved using the `#cSpell.files#` setting.
     *
     *
     * ```js
     * "cSpell.files": ["/**"]
     * ```
     * @title Spell Check Only Workspace Files
     * @scope window
     * @default false
     */
    spellCheckOnlyWorkspaceFiles?: boolean;

    /**
     * The type of menu used to display spelling suggestions.
     * @scope resource
     * @default "quickPick"
     * @enumDescriptions [
     *  "Suggestions will appear as a drop down at the top of the IDE. (Best choice for Vim Key Bindings)",
     *  "Suggestions will appear inline near the word, inside the text editor."]
     */
    suggestionMenuType?: 'quickPick' | 'quickFix';

    /**
     * Hide the options to add words to dictionaries or settings.
     * @scope resource
     * @default false
     */
    hideAddToDictionaryCodeActions?: boolean;

    /**
     * Specify where words can be added to. This setting is used to control the "Add to Dictionary" code actions.
     *
     * **Examples**
     *
     * To disable adding words to user settings, but allow adding words to workspace settings:
     *
     * ```js
     * "cSpell.addWordTo": {
     *   "user": false // Do not allow adding words to user settings
     * }
     * ```
     *
     * To disable adding words to all VSCode settings:
     *
     * ```js
     * "cSpell.addWordTo": {
     *   "user": false       // Do not allow adding words to user settings
     *   "workspace": false, // Do not allow adding words to workspace settings
     *   "folder": false     // Do not allow adding words to folder settings
     * }
     * ```
     *
     * @default {
     *   folder: true,
     *   workspace: true,
     *   user: true,
     *   cspell: true,
     *   dictionaries: true
     * }
     *
     * @sinceVersion 4.9.1
     * @scope resource
     */
    allowWordsToBeAddTo?: ActionAddToTargets;

    /**
     * Specify if fields from `.vscode/settings.json` are passed to the spell checker.
     * This only applies when there is a CSpell configuration file in the workspace.
     *
     * The purpose of this setting to help provide a consistent result compared to the
     * CSpell spell checker command line tool.
     *
     * Values:
     * - `true` - all settings will be merged based upon `#cSpell.mergeCSpellSettingsFields#`.
     * - `false` - only use `.vscode/settings.json` if a CSpell configuration is not found.
     *
     * Note: this setting is used in conjunction with `#cSpell.mergeCSpellSettingsFields#`.
     *
     * @scope resource
     * @sinceVersion 4.0.0
     * @default true
     */
    mergeCSpellSettings?: boolean;

    /**
     * Specify which fields from `.vscode/settings.json` are passed to the spell checker.
     * This only applies when there is a CSpell configuration file in the workspace and
     * `#cSpell.mergeCSpellSettings#` is `true`.
     *
     * Values:
     * - `{ flagWords: true, userWords: false }` - Always allow `flagWords`, but never allow `userWords`.
     *
     * Example:
     * ```jsonc
     * "cSpell.mergeCSpellSettingsFields": { "userWords": false }
     * ```
     *
     * @scope resource
     * @sinceVersion 4.0.0
     * @default {
     * "allowCompoundWords":true,"caseSensitive":true,"dictionaries":true,"dictionaryDefinitions":true,
     * "enableGlobDot":true,"features":true,"files":true,"flagWords":true,"gitignoreRoot":true,"globRoot":true,
     * "ignorePaths":true,"ignoreRegExpList":true,"ignoreWords":true,"import":true,"includeRegExpList":true,
     * "language":true,"languageId":true,"languageSettings":true,"loadDefaultConfiguration":true,"minWordLength":true,
     * "noConfigSearch":true,"noSuggestDictionaries":true,"numSuggestions":true,"overrides":true,
     * "patterns":true,"pnpFiles":true,"reporters":true,"suggestWords":true,"useGitignore":true,"usePnP":true,
     * "userWords":true,"validateDirectives":true,"words":true
     * }
     */
    mergeCSpellSettingsFields?: CSpellMergeFields;

    /**
     * Search for `@cspell/cspell-bundled-dicts` in the workspace folder and use it if found.
     * @scope resource
     * @sinceVersion 4.0.0
     * @default true
     */
    useLocallyInstalledCSpellDictionaries?: boolean;

    /**
     * Enable loading JavaScript CSpell configuration files.
     *
     * This setting is automatically set to `true` in a trusted workspace. It is possible to override the setting to `false` in a trusted workspace,
     * but a setting of `true` in an untrusted workspace will be ignored.
     *
     * See:
     * - [Visual Studio Code Workspace Trust security](https://code.visualstudio.com/docs/editor/workspace-trust)
     * - [Workspace Trust Extension Guide -- Visual Studio Code Extension API](https://code.visualstudio.com/api/extension-guides/workspace-trust)
     * @scope window
     * @sinceVersion 4.0.0
     * @default true
     */
    trustedWorkspace?: boolean;

    /**
     * By default, the spell checker reports all unknown words as misspelled. This setting allows for a more relaxed spell checking, by only
     * reporting unknown words as suggestions. Common spelling errors are still flagged as misspelled.
     *
     * - `all` - report all unknown words as misspelled
     * - `simple` - report unknown words with simple fixes and the rest as suggestions
     * - `typos` - report on known typo words and the rest as suggestions
     * - `flagged` - report only flagged words as misspelled
     *
     * **Note:** This setting is deprecated. Use `#cSpell.unknownWords#` instead.
     *
     * @title Strict Spell Checking
     * @scope language-overridable
     * @deprecated true
     * @deprecationMessage  Use Unknown Words settings instead.
     */
    reportUnknownWords?: UnknownWordsReportingLevel | undefined;
}

export interface ExperimentalSettings {
    /**
     * Show Regular Expression Explorer
     * @scope application
     * @default false
     */
    'experimental.enableRegexpView'?: boolean;

    /**
     * Experiment with executeDocumentSymbolProvider.
     * This feature is experimental and will be removed in the future.
     * @title Experiment with `executeDocumentSymbolProvider`
     * @scope application
     * @default false
     */
    'experimental.symbols'?: boolean;
}

export interface AdvancedSettings {
    /**
     * Use the Reference Provider when fixing spelling issues with the Rename Provider.
     * This feature is used in connection with `#cSpell.fixSpellingWithRenameProvider#`
     * @title Use Reference Provider During Rename
     * @scope language-overridable
     * @default false
     */
    'advanced.feature.useReferenceProviderWithRename'?: boolean;

    /**
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
     * @title Remove Matching Characters Before Rename
     * @scope language-overridable
     */
    'advanced.feature.useReferenceProviderRemove'?: RegExpString;
}

export interface SpellCheckerBehaviorSettings {
    /**
     * Control how spelling issues are displayed while typing.
     * See: `#cSpell.revealIssuesAfterDelayMS#` to control when issues are revealed.
     * @title Hide Issues While Typing
     * @scope application
     * @sinceVersion 4.0.0
     * @default "Word"
     * @enumDescriptions [
     *  "Show issues while typing",
     *  "Hide issues while typing in the current word",
     *  "Hide issues while typing on the line",
     *  "Hide all issues while typing in the document"]
     */
    hideIssuesWhileTyping?: 'Off' | 'Word' | 'Line' | 'Document';

    /**
     * Reveal hidden issues related to `#cSpell.hideIssuesWhileTyping#` after a delay in milliseconds.
     * @title Reveal Issues After a Delay in Milliseconds
     * @scope application
     * @sinceVersion 4.0.0
     * @default 1500
     */
    revealIssuesAfterDelayMS?: number;

    /**
     * Control which notifications are displayed.
     *
     * See:
     * - `#cSpell.blockCheckingWhenLineLengthGreaterThan#`
     * - `#cSpell.blockCheckingWhenTextChunkSizeGreaterThan#`
     * - `#cSpell.blockCheckingWhenAverageChunkSizeGreaterThan#`
     *
     *
     * @title Enabled Notifications
     * @scope resource
     * @sinceVersion 4.0.41
     * @default { "Lines too Long": true, "Average Word Length too Long": true, "Maximum Word Length Exceeded": true }
     */
    enabledNotifications?: EnabledNotifications;
}

/**
 *
 */
type AddToOptions = boolean;

/**
 * Reference to a dictionary
 * @pattern (^#[\s\w]+$)
 */
type DictionaryRef = string;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface AddToDictionaryTarget {
    /**
     * Custom Add To dictionary targets. The key is the dictionary name prefixed with `#`.
     * The value is `true` to enable adding words to the dictionary, `false` to disable adding words to the dictionary, or `undefined` to autodetect.
     */
    [key: DictionaryRef]: AddToOptions;
}

/**
 * Action targets for adding words to various settings.
 *
 * Controls which action items are allowed.
 * @sinceVersion 4.9.1
 */
export interface ActionAddToTargets {
    /**
     * Allow adding words to folder settings.
     * - `true` - allow add to folder settings
     * - `false` - never enable add to folder settings
     * @default true
     */
    folder?: AddToOptions;
    /**
     * Allow adding words to workspace settings.
     * - `true` - allow  add to workspace settings
     * - `false` - never enable add to workspace settings
     * @default true
     */
    workspace?: AddToOptions;
    /**
     * Allow adding words to user settings.
     * - `true` - allow add to user settings
     * - `false` - never enable add to user settings
     * @default true
     */
    user?: AddToOptions;
    /**
     * Allow adding words cspell configuration file settings.
     * - `true` - allow add to cspell settings
     * - `false` - never enable add to cspell settings
     * @default true
     */
    cspell?: AddToOptions;

    /**
     * Allow adding words user defined dictionaries settings.
     * - `true` - allow add to cspell settings
     * - `false` - never enable add to cspell settings
     * @default true
     */
    dictionaries?: AddToOptions;
}

export interface EnabledItemsInEditorContextMenu {
    /** Enable Menu Item: `Spelling Suggestions...` */
    suggestSpellingCorrections?: boolean;
    /** Enable Menu Item: `Spelling` */
    spellingContextMenu?: boolean;
    /** Enable Menu Item: `Hide Spelling Issues` */
    hideIssues?: boolean;
    /** Enable Menu Item: `Show Spelling Issues` */
    showIssues?: boolean;
}

export interface EnabledItemsInSpellingContextMenu {
    /** Enable Menu Item: Spelling Suggestions... */
    suggestSpellingCorrections?: boolean;
    /** Enable Menu Item: Add Word(s) to Dictionary */
    addWordToDictionary?: boolean;
    /** Enable Menu Item: Add Word(s) to Folder Dictionary */
    addWordToFolderDictionary?: boolean;
    /** Enable Menu Item: Add Word(s) to Workspace Dictionary */
    addWordToWorkspaceDictionary?: boolean;
    /** Enable Menu Item: Add Word(s) to CSpell Configuration */
    addWordToCSpellConfig?: boolean;
    /** Enable Menu Item: Add Word(s) to Folder Settings */
    addWordToFolderSettings?: boolean;
    /** Enable Menu Item: Add Word(s) to Workspace Settings */
    addWordToWorkspaceSettings?: boolean;
    /** Enable Menu Item: Add Word(s) to User Dictionary */
    addWordToUserDictionary?: boolean;
    /** Enable Menu Item: Add Word(s) to User Settings */
    addWordToUserSettings?: boolean;
    /** Enable Menu Item: Add All Spelling Issues to Dictionary */
    addIssuesToDictionary?: boolean;
    /** Enable Menu Item: Ignore Word(s) */
    addIgnoreWord?: boolean;
    /** Enable Menu Item: Create a CSpell Configuration File */
    createCSpellConfig?: boolean;
    /** Enable Menu Item: Create a Custom Dictionary File */
    createCustomDictionary?: boolean;
}

export type UnknownWordsReportingLevel = 'all' | 'simple' | 'typos' | 'flagged';

/**
 * Control which notifications are displayed.
 * @title Enabled Notifications
 * @scope resource
 * @sinceVersion 4.0.41
 */
export interface EnabledNotifications {
    /**
     * Enable notifications if the line is too long.
     */
    'Lines too Long'?: boolean;
    /**
     * Enable notifications if the average word size is too high.
     */
    'Average Word Length too Long'?: boolean;
    /**
     * Enable notifications if the maximum word length is exceeded.
     */
    'Maximum Word Length Exceeded'?: boolean;
}

export type NotificationMessageId = keyof EnabledNotifications;

export interface SpellCheckerSettings
    extends
        SpellCheckerShouldCheckDocSettings,
        FileTypesAndSchemeSettings,
        SpellCheckerBehaviorSettings,
        AppearanceSettings,
        ExperimentalSettings,
        AdvancedSettings,
        SpellCheckerUserSettings {}
