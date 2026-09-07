---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mts`
title: Files, Folders, and Workspaces
id: files-folders-and-workspaces
---

# Files, Folders, and Workspaces

Settings that control which files and folders are spell checked.


<table>
<thead>
<tr>
<th>

Setting

</th>
<th>

Scope

</th>
<th>

Description

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

[`cSpell.checkOnlyEnabledFileTypes`](#cspellcheckonlyenabledfiletypes)

</td>
<td>

resource

</td>
<td>

Check Only Enabled File Types

</td>
</tr>
<tr>
<td>

[`cSpell.checkVSCodeSystemFiles`](#cspellcheckvscodesystemfiles)

</td>
<td>

application

</td>
<td>

Spell check VS Code system files. These include:

</td>
</tr>
<tr>
<td>

[`cSpell.enabledFileTypes`](#cspellenabledfiletypes)

</td>
<td>

resource

</td>
<td>

Enabled File Types to Check

</td>
</tr>
<tr>
<td>

[`cSpell.enabledSchemes`](#cspellenabledschemes)

</td>
<td>

window

</td>
<td>

Specify Allowed Schemes

</td>
</tr>
<tr>
<td>

[`cSpell.files`](#cspellfiles)

</td>
<td>

resource

</td>
<td>

Glob patterns of files to be checked

</td>
</tr>
<tr>
<td>

[`cSpell.globRoot`](#cspellglobroot)

</td>
<td>

resource

</td>
<td>

The root to use for glob patterns found in this configuration. Default: The current workspace…

</td>
</tr>
<tr>
<td>

[`cSpell.ignorePaths`](#cspellignorepaths)

</td>
<td>

resource

</td>
<td>

Glob patterns of files to be ignored

</td>
</tr>
<tr>
<td>

[`cSpell.import`](#cspellimport)

</td>
<td>

resource

</td>
<td>

Allows this configuration to inherit configuration for one or more other files.

</td>
</tr>
<tr>
<td>

[`cSpell.mergeCSpellSettings`](#cspellmergecspellsettings)

</td>
<td>

resource

</td>
<td>

Specify if fields from `.vscode/settings.json` are passed to the spell checker. This only applies…

</td>
</tr>
<tr>
<td>

[`cSpell.mergeCSpellSettingsFields`](#cspellmergecspellsettingsfields)

</td>
<td>

resource

</td>
<td>

Specify which fields from `.vscode/settings.json` are passed to the spell checker. This only…

</td>
</tr>
<tr>
<td>

[`cSpell.noConfigSearch`](#cspellnoconfigsearch)

</td>
<td>

resource

</td>
<td>

Prevents searching for local configuration when checking individual documents.

</td>
</tr>
<tr>
<td>

[`cSpell.spellCheckOnlyWorkspaceFiles`](#cspellspellcheckonlyworkspacefiles)

</td>
<td>

window

</td>
<td>

Spell Check Only Workspace Files

</td>
</tr>
<tr>
<td>

[`cSpell.useGitignore`](#cspellusegitignore)

</td>
<td>

resource

</td>
<td>

Tells the spell checker to load `.gitignore` files and skip files that match the globs in the…

</td>
</tr>
<tr>
<td>

[`cSpell.usePnP`](#cspellusepnp)

</td>
<td>

resource

</td>
<td>

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading packages stored in…

</td>
</tr>
<tr>
<td>

[`cSpell.workspaceRootPath`](#cspellworkspacerootpath)

</td>
<td>

resource

</td>
<td>

Workspace Root Folder Path

</td>
</tr>
</tbody>
</table>


## Settings


### `cSpell.checkOnlyEnabledFileTypes`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.checkOnlyEnabledFileTypes` -- Check Only Enabled File Types

</dd>

<dt>
Description
</dt>
<dd>

By default, the spell checker checks only enabled file types. Use [`cSpell.enabledFileTypes`](files-folders-and-workspaces#cspellenabledfiletypes)
to turn on / off various file types.

When this setting is `false`, all file types are checked except for the ones disabled by [`cSpell.enabledFileTypes`](files-folders-and-workspaces#cspellenabledfiletypes).
See [`cSpell.enabledFileTypes`](files-folders-and-workspaces#cspellenabledfiletypes) on how to disable a file type.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

---


### `cSpell.checkVSCodeSystemFiles`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.checkVSCodeSystemFiles`

</dd>

<dt>
Description
</dt>
<dd>

Spell check VS Code system files.
These include:
- `vscode-userdata:/**/settings.json`
- `vscode-userdata:/**/keybindings.json`

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`false`_

</dd>

</dl>

---


### `cSpell.enabledFileTypes`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.enabledFileTypes` -- Enabled File Types to Check

</dd>

<dt>
Description
</dt>
<dd>

Enable / Disable checking file types (languageIds).

This setting replaces: [`cSpell.enabledLanguageIds`](legacy#cspellenabledlanguageids) and [`cSpell.enableFiletypes`](files-folders-and-workspaces#cspellenablefiletypes).

A Value of:
- `true` - enable checking for the file type
- `false` - disable checking for the file type

A file type of `*` is a wildcard that enables all file types.

**Example: enable all file types**

| File Type | Enabled | Comment |
| --------- | ------- | ------- |
| `*`       | `true`  | Enable all file types. |
| `json`    | `false` | Disable checking for json files. |

</dd>

<dt>
Type
</dt>
<dd>

[`EnabledFileTypes`](#enabledfiletypes)

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

```json5 title="default"
{
  "*": true,
  "markdown": true
}
```

</dd>

</dl>

---


### `cSpell.enabledSchemes`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.enabledSchemes` -- Specify Allowed Schemes

</dd>

<dt>
Description
</dt>
<dd>

Control which file schemes will be checked for spelling (VS Code must be restarted for this setting to take effect).

Some schemes have special meaning like:
- `untitled` - Used for new documents that have not yet been saved
- `vscode-notebook-cell` - Used for validating segments of a Notebook.
- `vscode-userdata` - Needed to spell check `.code-snippets`
- `vscode-scm` - Needed to spell check Source Control commit messages.
- `comment` - Used for new comment editors.

A scheme of `*` is a wildcard that enables all schemes without an explicit entry.
This is useful for virtual file systems provided by other extensions.

**Example: enable all schemes**

| Scheme | Enabled | Comment |
| ------ | ------- | ------- |
| `*`    | `true`  | Enable all schemes. |
| `git`  | `false` | Do not check documents provided by the `git` file system. |

</dd>

<dt>
Type
</dt>
<dd>

[`EnabledSchemes`](#enabledschemes)

</dd>

<dt>
Scope
</dt>
<dd>

window - Windows (instance) specific settings which can be configured in user, workspace, or remote settings.

</dd>

<dt>
Default
</dt>
<dd>

```json5 title="default"
{
  "chatSessionInput": true, "comment": true, "file": true, "gist": true,
  "repo": true, "sftp": true, "untitled": true, "vscode-notebook-cell": true,
  "vscode-scm": true, "vscode-userdata": true, "vscode-vfs": true, "vsls": true
}
```

</dd>

</dl>

---


### `cSpell.files`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.files` -- Glob patterns of files to be checked

</dd>

<dt>
Description
</dt>
<dd>

Glob patterns of files to be checked.
Glob patterns are relative to the [`cSpell.globRoot`](files-folders-and-workspaces#cspellglobroot) of the configuration file that defines them.

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### `cSpell.globRoot`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.globRoot`

</dd>

<dt>
Description
</dt>
<dd>

The root to use for glob patterns found in this configuration.
Default: The current workspace folder.
Use `globRoot` to define a different location. `globRoot` can be relative to the location of this configuration file.
Defining globRoot, does not impact imported configurations.

Special Values:

- `${workspaceFolder}` - Default - globs will be relative to the current workspace folder
- `${workspaceFolder:<name>}` - Where `<name>` is the name of the workspace folder.

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### `cSpell.ignorePaths`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.ignorePaths` -- Glob patterns of files to be ignored

</dd>

<dt>
Description
</dt>
<dd>

Glob patterns of files to be ignored. The patterns are relative to the [`cSpell.globRoot`](files-folders-and-workspaces#cspellglobroot) of the configuration file that defines them.

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

```json5 title="default"
[
  "package-lock.json",
  "node_modules",
  "vscode-extension",
  ".git/{info,lfs,logs,refs,objects}/**",
  ".git/{index,*refs,*HEAD}",
  ".vscode",
  ".vscode-insiders"
]
```

</dd>

</dl>

---


### `cSpell.import`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.import`

</dd>

<dt>
Description
</dt>
<dd>

Allows this configuration to inherit configuration for one or more other files.

See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### `cSpell.mergeCSpellSettings`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.mergeCSpellSettings`

</dd>

<dt>
Description
</dt>
<dd>

Specify if fields from `.vscode/settings.json` are passed to the spell checker.
This only applies when there is a CSpell configuration file in the workspace.

The purpose of this setting to help provide a consistent result compared to the
CSpell spell checker command line tool.

Values:
- `true` - all settings will be merged based upon [`cSpell.mergeCSpellSettingsFields`](files-folders-and-workspaces#cspellmergecspellsettingsfields).
- `false` - only use `.vscode/settings.json` if a CSpell configuration is not found.

Note: this setting is used in conjunction with [`cSpell.mergeCSpellSettingsFields`](files-folders-and-workspaces#cspellmergecspellsettingsfields).

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

---


### `cSpell.mergeCSpellSettingsFields`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.mergeCSpellSettingsFields`

</dd>

<dt>
Description
</dt>
<dd>

Specify which fields from `.vscode/settings.json` are passed to the spell checker.
This only applies when there is a CSpell configuration file in the workspace and
[`cSpell.mergeCSpellSettings`](files-folders-and-workspaces#cspellmergecspellsettings) is `true`.

Values:
- `{ flagWords: true, userWords: false }` - Always allow `flagWords`, but never allow `userWords`.

Example:
```json5
"cSpell.mergeCSpellSettingsFields": { "userWords": false }
```

</dd>

<dt>
Type
</dt>
<dd>

[`CSpellMergeFields`](#cspellmergefields)

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

```json5 title="default"
{
  "allowCompoundWords": true, "caseSensitive": true, "dictionaries": true,
  "dictionaryDefinitions": true, "enableGlobDot": true, "features": true,
  "files": true, "flagWords": true, "gitignoreRoot": true, "globRoot": true,
  "ignorePaths": true, "ignoreRegExpList": true, "ignoreWords": true,
  "import": true, "includeRegExpList": true, "language": true,
  "languageId": true, "languageSettings": true,
  "loadDefaultConfiguration": true, "minWordLength": true,
  "noConfigSearch": true, "noSuggestDictionaries": true,
  "numSuggestions": true, "overrides": true, "patterns": true,
  "pnpFiles": true, "reporters": true, "suggestWords": true,
  "useGitignore": true, "usePnP": true, "userWords": true,
  "validateDirectives": true, "words": true
}
```

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

---


### `cSpell.noConfigSearch`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.noConfigSearch`

</dd>

<dt>
Description
</dt>
<dd>

Prevents searching for local configuration when checking individual documents.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### `cSpell.spellCheckOnlyWorkspaceFiles`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.spellCheckOnlyWorkspaceFiles` -- Spell Check Only Workspace Files

</dd>

<dt>
Description
</dt>
<dd>

Only spell check files that are in the currently open workspace.
This same effect can be achieved using the [`cSpell.files`](files-folders-and-workspaces#cspellfiles) setting.

```js
"cSpell.files": ["/**"]
```

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

window - Windows (instance) specific settings which can be configured in user, workspace, or remote settings.

</dd>

<dt>
Default
</dt>
<dd>

_`false`_

</dd>

</dl>

---


### `cSpell.useGitignore`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.useGitignore`

</dd>

<dt>
Description
</dt>
<dd>

Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

---


### `cSpell.usePnP`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.usePnP`

</dd>

<dt>
Description
</dt>
<dd>

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### `cSpell.workspaceRootPath`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.workspaceRootPath` -- Workspace Root Folder Path

</dd>

<dt>
Description
</dt>
<dd>

Define the path to the workspace root folder in a multi-root workspace.
By default it is the first folder.

This is used to find the `cspell.json` file for the workspace.

**Example: use the `client` folder**
```
${workspaceFolder:client}
```

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### ~~`cSpell.allowedSchemas`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.allowedSchemas`~~ -- Define Allowed Schemes

</dd>

<dt>
Description
</dt>
<dd>

Control which file schemes will be checked for spelling (VS Code must be restarted for this setting to take effect).

Some schemes have special meaning like:
- `untitled` - Used for new documents that have not yet been saved
- `vscode-notebook-cell` - Used for validating segments of a Notebook.
- `vscode-userdata` - Needed to spell check `.code-snippets`
- `vscode-scm` - Needed to spell check Source Control commit messages.
- `comment` - Used for new comment editors.

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

</dd>

<dt>
Scope
</dt>
<dd>

window - Windows (instance) specific settings which can be configured in user, workspace, or remote settings.

</dd>

<dt>
Deprecation Message
</dt>
<dd>

- Use [`cSpell.enabledSchemes`](files-folders-and-workspaces#cspellenabledschemes) instead.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### ~~`cSpell.enableFiletypes`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.enableFiletypes`~~ -- Enable File Types

</dd>

<dt>
Description
</dt>
<dd>

Enable / Disable checking file types (languageIds).

These are in additional to the file types specified by [`cSpell.enabledLanguageIds`](legacy#cspellenabledlanguageids).
To disable a language, prefix with `!` as in `!json`,

**Example: individual file types**

```
jsonc       // enable checking for jsonc
!json       // disable checking for json
kotlin      // enable checking for kotlin
```

**Example: enable all file types**

```
*           // enable checking for all file types
!json       // except for json
```

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Deprecation Message
</dt>
<dd>

- Use [`cSpell.enabledFileTypes`](files-folders-and-workspaces#cspellenabledfiletypes) instead.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


## Type Definitions


### `EnabledFileTypes`

<dl>

<dt>
Name
</dt>
<dd>

EnabledFileTypes

</dd>

<dt>
Description
</dt>
<dd>

Enable / Disable checking file types (languageIds).

This setting replaces: [`cSpell.enabledLanguageIds`](legacy#cspellenabledlanguageids) and [`cSpell.enableFiletypes`](files-folders-and-workspaces#cspellenablefiletypes).

A Value of:
- `true` - enable checking for the file type
- `false` - disable checking for the file type

A file type of `*` is a wildcard that enables all file types.

**Example: enable all file types**

| File Type | Enabled | Comment |
| --------- | ------- | ------- |
| `*`       | `true`  | Enable all file types. |
| `json`    | `false` | Disable checking for json files. |

</dd>

<dt>
Type
</dt>
<dd>

```ts
{
  [key: string]: boolean;
}
```

</dd>

</dl>

---


### `EnabledSchemes`

<dl>

<dt>
Name
</dt>
<dd>

EnabledSchemes

</dd>

<dt>
Description
</dt>
<dd>

Control which file schemes will be checked for spelling (VS Code must be restarted for this setting to take effect).

Some schemes have special meaning like:
- `untitled` - Used for new documents that have not yet been saved
- `vscode-notebook-cell` - Used for validating segments of a Notebook.
- `vscode-userdata` - Needed to spell check `.code-snippets`
- `vscode-scm` - Needed to spell check Source Control commit messages.
- `comment` - Used for new comment editors.

A scheme of `*` is a wildcard that enables all schemes without an explicit entry.
This is useful for virtual file systems provided by other extensions.

**Example: enable all schemes**

| Scheme | Enabled | Comment |
| ------ | ------- | ------- |
| `*`    | `true`  | Enable all schemes. |
| `git`  | `false` | Do not check documents provided by the `git` file system. |

</dd>

<dt>
Type
</dt>
<dd>

```ts
{
  [key: string]: boolean;
}
```

</dd>

</dl>

---


### `CSpellMergeFields`

<dl>

<dt>
Name
</dt>
<dd>

CSpellMergeFields

</dd>

<dt>
Description
</dt>
<dd>

Specify which fields from `.vscode/settings.json` are passed to the spell checker.
This only applies when there is a CSpell configuration file in the workspace and
[`cSpell.mergeCSpellSettings`](files-folders-and-workspaces#cspellmergecspellsettings) is `true`.

Values:
- `{ flagWords: true, userWords: false }` - Always allow `flagWords`, but never allow `userWords`.

Example:
```json5
"cSpell.mergeCSpellSettingsFields": { "userWords": false }
```

</dd>

<dt>
Type
</dt>
<dd>

<details>
<summary>

TypeScript:

</summary>

```ts
{
  allowCompoundWords?: boolean;
  caseSensitive?: boolean;
  dictionaries?: boolean;
  dictionaryDefinitions?: boolean;
  enableGlobDot?: boolean;
  features?: boolean;
  files?: boolean;
  flagWords?: boolean;
  gitignoreRoot?: boolean;
  globRoot?: boolean;
  ignorePaths?: boolean;
  ignoreRegExpList?: boolean;
  ignoreWords?: boolean;
  import?: boolean;
  includeRegExpList?: boolean;
  language?: boolean;
  languageId?: boolean;
  languageSettings?: boolean;
  loadDefaultConfiguration?: boolean;
  minWordLength?: boolean;
  noConfigSearch?: boolean;
  noSuggestDictionaries?: boolean;
  numSuggestions?: boolean;
  overrides?: boolean;
  patterns?: boolean;
  pnpFiles?: boolean;
  reporters?: boolean;
  suggestWords?: boolean;
  useGitignore?: boolean;
  usePnP?: boolean;
  userWords?: boolean;
  validateDirectives?: boolean;
  words?: boolean;
}
```

</details>

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

---




