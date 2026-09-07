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

- Use [`cSpell.customDictionaries`](languages-and-dictionaries#cspellcustomdictionaries) instead.

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

- Use [`cSpell.customDictionaries`](languages-and-dictionaries#cspellcustomdictionaries) instead.

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

- Use [`cSpell.customDictionaries`](languages-and-dictionaries#cspellcustomdictionaries) instead.

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

**Any of:**

<ul>

<li>

`"Left"`
</li>
<li>

`"Right"`
</li>

</ul>

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


### `CustomDictionaryAugmentExistingDictionary`

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

<table>
<thead>
<tr>
<th>

Fields

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`name` _(required)_

</dd>

<dt>
Description
</dt>
<dd>

The reference name of the dictionary.

Example: `My Words` or `custom`

If the name matches a pre-defined dictionary, it will override the pre-defined dictionary.
If you use: `typescript` it will replace the built-in TypeScript dictionary.

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Required
</dt>
<dd>

Yes

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addWords`

</dd>

<dt>
Description
</dt>
<dd>

Indicate if this custom dictionary should be used to store added words.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`description`

</dd>

<dt>
Description
</dt>
<dd>

Optional: A human readable description.

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`noSuggest`

</dd>

<dt>
Description
</dt>
<dd>

Indicate that suggestions should not come from this dictionary.
Words in this dictionary are considered correct, but will not be
used when making spell correction suggestions.

Note: if a word is suggested by another dictionary, but found in
this dictionary, it will be removed from the set of
possible suggestions.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`path`

</dd>

<dt>
Description
</dt>
<dd>

Define the path to the dictionary text file.

**Note:** if path is `undefined` the `name`d dictionary is expected to be found
in the `dictionaryDefinitions`.

File Format: Each line in the file is considered a dictionary entry.

Case is preserved while leading and trailing space is removed.

The path should be absolute, or relative to the workspace.

**Example:** relative to User's folder

```json
"path": "~/dictionaries/custom_dictionary.txt"
```

**Example:** relative to the `client` folder in a multi-root workspace

```json
"path": "${workspaceFolder:client}/build/custom_dictionary.txt"
```

**Example:** relative to the current workspace folder in a single-root workspace

**Note:** this might not work as expected in a multi-root workspace since it is based upon the relative
workspace for the currently open file.

```json
"path": "${workspaceFolder}/build/custom_dictionary.txt"
```

**Example:** relative to the workspace folder in a single-root workspace or the first folder in
a multi-root workspace

```json
"path": "./build/custom_dictionary.txt"
```

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`scope`

</dd>

<dt>
Description
</dt>
<dd>

Options are
- `user` - words that apply to all projects and workspaces
- `workspace` - words that apply to the entire workspace
- `folder` - words that apply to only a workspace folder

</dd>

<dt>
Type
</dt>
<dd>

`( ( "user" | "workspace" | "folder" ) | ( "user" | "workspace" | "folder" )[] )`

</dd>

</dl>

</td>
</tr>
</tbody>
</table>

<details>
<summary>

TypeScript:

</summary>

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

</details>

</dd>

</dl>

---


### `CustomDictionary`

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

<table>
<thead>
<tr>
<th>

Fields

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`name` _(required)_

</dd>

<dt>
Description
</dt>
<dd>

The reference name of the dictionary.

Example: `My Words` or `custom`

If the name matches a pre-defined dictionary, it will override the pre-defined dictionary.
If you use: `typescript` it will replace the built-in TypeScript dictionary.

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Required
</dt>
<dd>

Yes

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`path` _(required)_

</dd>

<dt>
Description
</dt>
<dd>

Define the path to the dictionary text file.

**Note:** if path is `undefined` the `name`d dictionary is expected to be found
in the `dictionaryDefinitions`.

File Format: Each line in the file is considered a dictionary entry.

Case is preserved while leading and trailing space is removed.

The path should be absolute, or relative to the workspace.

**Example:** relative to User's folder

```json
"path": "~/dictionaries/custom_dictionary.txt"
```

**Example:** relative to the `client` folder in a multi-root workspace

```json
"path": "${workspaceFolder:client}/build/custom_dictionary.txt"
```

**Example:** relative to the current workspace folder in a single-root workspace

**Note:** this might not work as expected in a multi-root workspace since it is based upon the relative
workspace for the currently open file.

```json
"path": "${workspaceFolder}/build/custom_dictionary.txt"
```

**Example:** relative to the workspace folder in a single-root workspace or the first folder in
a multi-root workspace

```json
"path": "./build/custom_dictionary.txt"
```

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Required
</dt>
<dd>

Yes

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addWords`

</dd>

<dt>
Description
</dt>
<dd>

Indicate if this custom dictionary should be used to store added words.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`btrie`

</dd>

<dt>
Description
</dt>
<dd>

An alternative path to a bTrie dictionary file.
It will be used in place of `path` if the version of CSpell being used
supports btrie files.

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
CSpell Version
</dt>
<dd>

9.6.0

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`description`

</dd>

<dt>
Description
</dt>
<dd>

Optional: A human readable description.

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`ignoreForbiddenWords`

</dd>

<dt>
Description
</dt>
<dd>

Some dictionaries may contain forbidden words to prevent compounding from generating
words that are not valid in the language. These are often
words that are used in other languages or might be generated through compounding.
This setting allows flagged words to be ignored when checking the dictionary.
The effect is similar to the word not being in the dictionary.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`noSuggest`

</dd>

<dt>
Description
</dt>
<dd>

Indicate that suggestions should not come from this dictionary.
Words in this dictionary are considered correct, but will not be
used when making spell correction suggestions.

Note: if a word is suggested by another dictionary, but found in
this dictionary, it will be removed from the set of
possible suggestions.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`scope`

</dd>

<dt>
Description
</dt>
<dd>

Options are
- `user` - words that apply to all projects and workspaces
- `workspace` - words that apply to the entire workspace
- `folder` - words that apply to only a workspace folder

</dd>

<dt>
Type
</dt>
<dd>

`( ( "user" | "workspace" | "folder" ) | ( "user" | "workspace" | "folder" )[] )`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`supportNonStrictSearches`

</dd>

<dt>
Description
</dt>
<dd>

Strip case and accents to allow for case insensitive searches and
words without accents.

Note: this setting only applies to word lists. It has no-impact on trie
dictionaries.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

</td>
</tr>
</tbody>
</table>

<details>
<summary>

TypeScript:

</summary>

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

</details>

</dd>

</dl>

---


### `CustomDictionaryEntry`

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

**Any of:**

<ul>

<li>

[`CustomDictionaryAugmentExistingDictionary`](#customdictionaryaugmentexistingdictionary)
</li>
<li>

[`CustomDictionary`](#customdictionary)
</li>
<li>

`string`
</li>

</ul>

( [`CustomDictionaryAugmentExistingDictionary`](#customdictionaryaugmentexistingdictionary) | [`CustomDictionary`](#customdictionary) | `string` )

</dd>

</dl>

---




