---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mts`
title: Legacy
id: legacy
---

# Legacy

Legacy settings that have been deprecated or are not commonly used.


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

[`cSpell.allowCompoundWords`](#cspellallowcompoundwords)

</td>
<td>

resource

</td>
<td>

Enable / Disable allowing word compounds.

</td>
</tr>
</tbody>
</table>


## Settings


### `cSpell.allowCompoundWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.allowCompoundWords`

</dd>

<dt>
Description
</dt>
<dd>

Enable / Disable allowing word compounds.
- `true` means `arraylength` would be ok
- `false` means it would not pass.

Note: this can also cause many misspelled words to seem correct.

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

_`false`_

</dd>

</dl>

---


### ~~`cSpell.customFolderDictionaries`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.customFolderDictionaries`~~ -- Custom Folder Dictionaries

</dd>

<dt>
Description
</dt>
<dd>

Define custom dictionaries to be included by default for the folder.
If `addWords` is `true` words will be added to this dictionary.

</dd>

<dt>
Type
</dt>
<dd>

[`CustomDictionaryEntry`](#customdictionaryentry)[]

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

- Use `#cSpell.customDictionaries#` instead.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### ~~`cSpell.customUserDictionaries`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.customUserDictionaries`~~ -- Custom User Dictionaries

</dd>

<dt>
Description
</dt>
<dd>

Define custom dictionaries to be included by default for the user.
If `addWords` is `true` words will be added to this dictionary.

</dd>

<dt>
Type
</dt>
<dd>

[`CustomDictionaryEntry`](#customdictionaryentry)[]

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Deprecation Message
</dt>
<dd>

- Use `#cSpell.customDictionaries#` instead.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### ~~`cSpell.customWorkspaceDictionaries`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.customWorkspaceDictionaries`~~ -- Custom Workspace Dictionaries

</dd>

<dt>
Description
</dt>
<dd>

Define custom dictionaries to be included by default for the workspace.
If `addWords` is `true` words will be added to this dictionary.

</dd>

<dt>
Type
</dt>
<dd>

[`CustomDictionaryEntry`](#customdictionaryentry)[]

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

- Use `#cSpell.customDictionaries#` instead.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### ~~`cSpell.enabledLanguageIds`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.enabledLanguageIds`~~ -- Enabled Language Ids

</dd>

<dt>
Description
</dt>
<dd>

Specify a list of file types to spell check. It is better to use [`cSpell.enabledFileTypes`](files-folders-and-workspaces#cspellenabledfiletypes) to Enable / Disable checking files types.

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

- Use `#cSpell.enabledFileTypes#` instead.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### ~~`cSpell.showStatus`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.showStatus`~~

</dd>

<dt>
Description
</dt>
<dd>

Display the spell checker status on the status bar.

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
Deprecation Message
</dt>
<dd>

No longer used.

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

---


### ~~`cSpell.showStatusAlignment`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.showStatusAlignment`~~

</dd>

<dt>
Description
</dt>
<dd>

The side of the status bar to display the spell checker status.

</dd>

<dt>
Type
</dt>
<dd>

`( "Left" | "Right" )`
| Value | Description |
| ----- | ----------- |
| `Left` | Left Side of Statusbar |
| `Right` | Right Side of Statusbar |

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Deprecation Message
</dt>
<dd>

No longer supported.

</dd>

<dt>
Default
</dt>
<dd>

_`"Right"`_

</dd>

</dl>

---


## Type Definitions


### CustomDictionaryAugmentExistingDictionary

<dl>

<dt>
Name
</dt>
<dd>

CustomDictionaryAugmentExistingDictionary

</dd>

<dt>
Description
</dt>
<dd>

</dd>

<dt>
Type
</dt>
<dd>

```ts
{
  addWords?: boolean;
  description?: string;
  name: string;
  noSuggest?: boolean;
  path?: string;
  scope?: (("user" | "workspace" | "folder") | ("user" | "workspace" | "folder")[]);
}
```

</dd>

</dl>

---


### CustomDictionary

<dl>

<dt>
Name
</dt>
<dd>

CustomDictionary

</dd>

<dt>
Description
</dt>
<dd>

</dd>

<dt>
Type
</dt>
<dd>

```ts
{
  addWords?: boolean;
  btrie?: string;
  description?: string;
  ignoreForbiddenWords?: boolean;
  name: string;
  noSuggest?: boolean;
  path: string;
  scope?: (("user" | "workspace" | "folder") | ("user" | "workspace" | "folder")[]);
  supportNonStrictSearches?: boolean;
}
```

</dd>

</dl>

---


### CustomDictionaryEntry

<dl>

<dt>
Name
</dt>
<dd>

CustomDictionaryEntry

</dd>

<dt>
Description
</dt>
<dd>

</dd>

<dt>
Type
</dt>
<dd>

( [`CustomDictionaryAugmentExistingDictionary`](#customdictionaryaugmentexistingdictionary) | [`CustomDictionary`](#customdictionary) | `string` )

</dd>

</dl>

---




