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
 * @since 4.0.0
 * @enumDescriptions [
 *  "Report Spelling Issues as Errors",
 *  "Report Spelling Issues as Warnings",
 *  "Report Spelling Issues as Information",
 *  "Report Spelling Issues as Hints, will not show up in Problems"
 *  "Do not Report Spelling Issues"]
 */
export type DiagnosticLevelExt = 'Error' | 'Warning' | 'Information' | 'Hint' | 'Off';

export type UseVSCodeDiagnosticSeverity = Record<string, DiagnosticLevelExt>;

export interface SpellCheckerSettings
    extends SpellCheckerShouldCheckDocSettings,
        FileTypesAndSchemeSettings,
        SpellCheckerBehaviorSettings,
        AppearanceSettings {
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
     * Set the maximum number of bocks of text to check.
     * Each block is 1024 characters.
     * @scope resource
     * @default 500
     */
    checkLimit?: number;

    /**
     * The Diagnostic Severity Level determines how issues are shown in the Problems Pane and within the document.
     * Set the level to `Hint` to hide the issues from the Problems Pane. Use the `#cSpell.useCustomDecorations#`
     * to control how issues are displayed in the document.
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
     * @since 4.0.0
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
     * Select which fields to display in the language status bar.
     * @scope application
     * @default { "fileType": true, "scheme": true, "issues": true }
     */
    languageStatusFields?: LanguageStatusFields;

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
     * Experiment with executeDocumentSymbolProvider.
     * This feature is experimental and will be removed in the future.
     * @title Experiment with `executeDocumentSymbolProvider`
     * @scope application
     * @default false
     */
    'experimental.symbols'?: boolean;

    /**
     * Hide the options to add words to dictionaries or settings.
     * @scope resource
     * @default false
     */
    hideAddToDictionaryCodeActions?: boolean;

    /**
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
     * @scope resource
     * @hidden
     */
    // addWordsTo?: AddToTargets;

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
     * @since 4.0.0
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
     * @since 4.0.0
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
     * @since 4.0.0
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
     * @since 4.0.0
     * @default true
     */
    trustedWorkspace?: boolean;

    /**
     * Strict spell checking implies that unknown words are flagged as misspelled. This is the default behavior.
     * When strict spell checking is disabled, unknown words are flagged as suggestions while common spelling errors are still flagged as misspelled.
     * @title Strict Spell Checking
     * @scope language-overridable
     * @since 4.0.2
     * @default true
     */
    strict?: boolean;
}

export interface SpellCheckerBehaviorSettings {
    /**
     * Control how spelling issues are displayed while typing.
     * See: `#cSpell.revealIssuesAfterMS#` to control when issues are revealed.
     * @title Hide Issues While Typing
     * @scope application
     * @since 4.0.0
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
     * @since 4.0.0
     * @default 1500
     * @enumDescriptions [
     *  "Show issues while typing",
     *  "Hide issues in the current word",
     *  "Hide issues on the line",
     *  "Hide all issues in the document"]
     */
    revealIssuesAfterDelayMS?: number;
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

export interface LanguageStatusFields {
    fileType: boolean;
    scheme: boolean;
    issues: boolean;
}
