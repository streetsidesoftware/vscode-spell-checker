// Export the cspell settings to the client.

import * as cspell from 'cspell-lib';
export { LanguageSetting, DictionaryDefinition } from 'cspell-lib';

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
}

export interface CSpellUserSettingsWithComments extends cspell.CSpellUserSettingsWithComments, SpellCheckerSettings {}
export interface CSpellUserSettings extends cspell.CSpellSettings, SpellCheckerSettings {}

export type SpellCheckerSettingsProperties = keyof SpellCheckerSettings;
