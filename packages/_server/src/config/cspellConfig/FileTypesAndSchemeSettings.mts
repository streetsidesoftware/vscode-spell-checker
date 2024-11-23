import type { EnableFileTypeId } from './annotatedTypes.mjs';

export type EnabledFileTypes = Record<string, boolean>;
export type EnabledSchemes = Readonly<Record<string, boolean>>;

export interface FileTypesAndSchemeSettings {
    /**
     * Control which file schemes will be checked for spelling (VS Code must be restarted for this setting to take effect).
     *
     *
     * Some schemes have special meaning like:
     * - `untitled` - Used for new documents that have not yet been saved
     * - `vscode-notebook-cell` - Used for validating segments of a Notebook.
     * - `vscode-userdata` - Needed to spell check `.code-snippets`
     * - `vscode-scm` - Needed to spell check Source Control commit messages.
     * - `comment` - Used for new comment editors.
     * @title Define Allowed Schemes
     * @scope window
     * @deprecated true
     * @deprecationMessage - Use `#cSpell.enabledSchemes#` instead.
     */
    allowedSchemas?: string[];

    /**
     * Control which file schemes will be checked for spelling (VS Code must be restarted for this setting to take effect).
     *
     *
     * Some schemes have special meaning like:
     * - `untitled` - Used for new documents that have not yet been saved
     * - `vscode-notebook-cell` - Used for validating segments of a Notebook.
     * - `vscode-userdata` - Needed to spell check `.code-snippets`
     * - `vscode-scm` - Needed to spell check Source Control commit messages.
     * - `comment` - Used for new comment editors.
     * @title Specify Allowed Schemes
     * @scope window
     * @default { "file": true, "gist": true, "repo": true, "sftp": true, "untitled": true,
     *      "vscode-notebook-cell": true, "vscode-scm": true, "comment": true,
     *      "vscode-userdata": true, "vscode-vfs": true, "vsls": true
     *  }
     */
    enabledSchemes?: EnabledSchemes;

    /**
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
     * @title Enable File Types
     * @scope resource
     * @deprecated true
     * @deprecationMessage - Use `#cSpell.enabledFileTypes#` instead.
     * @uniqueItems true
     */
    enableFiletypes?: EnableFileTypeId[];

    /**
     * Enable / Disable checking file types (languageIds).
     *
     * This setting replaces: `#cSpell.enabledLanguageIds#` and `#cSpell.enableFiletypes#`.
     *
     * A Value of:
     * - `true` - enable checking for the file type
     * - `false` - disable checking for the file type
     *
     * A file type of `*` is a wildcard that enables all file types.
     *
     * **Example: enable all file types**
     *
     * | File Type | Enabled | Comment |
     * | --------- | ------- | ------- |
     * | `*`       | `true`  | Enable all file types. |
     * | `json`    | `false` | Disable checking for json files. |
     *
     * @title Enabled File Types to Check
     * @scope resource
     * @default { "*" : true, "markdown": true }
     */
    enabledFileTypes?: EnabledFileTypes;

    /**
     * By default, the spell checker checks only enabled file types. Use `#cSpell.enableFiletypes#`
     * to turn on / off various file types.
     *
     * When this setting is `false`, all file types are checked except for the ones disabled by `#cSpell.enabledFileTypes#`.
     * See `#cSpell.enableFiletypes#` on how to disable a file type.
     * @title Check Only Enabled File Types
     * @scope resource
     * @default true
     */
    checkOnlyEnabledFileTypes?: boolean;
}
