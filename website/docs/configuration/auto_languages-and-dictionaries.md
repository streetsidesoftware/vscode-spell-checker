---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mts`
title: Languages and Dictionaries
id: languages-and-dictionaries
---

# Languages and Dictionaries

Settings that control dictionaries and language preferences.


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

[`cSpell.caseSensitive`](#cspellcasesensitive)

</td>
<td>

resource

</td>
<td>

Determines if words must match case and accent rules.

</td>
</tr>
<tr>
<td>

[`cSpell.customDictionaries`](#cspellcustomdictionaries)

</td>
<td>

resource

</td>
<td>

Custom Dictionaries

</td>
</tr>
<tr>
<td>

[`cSpell.dictionaries`](#cspelldictionaries)

</td>
<td>

resource

</td>
<td>

Optional list of dictionaries to use.

</td>
</tr>
<tr>
<td>

[`cSpell.dictionaryDefinitions`](#cspelldictionarydefinitions)

</td>
<td>

resource

</td>
<td>

Dictionary Definitions

</td>
</tr>
<tr>
<td>

[`cSpell.flagWords`](#cspellflagwords)

</td>
<td>

resource

</td>
<td>

List of words to always be considered incorrect. Words found in `flagWords` override `words`.

</td>
</tr>
<tr>
<td>

[`cSpell.ignoreWords`](#cspellignorewords)

</td>
<td>

resource

</td>
<td>

A list of words to be ignored by the spell checker.

</td>
</tr>
<tr>
<td>

[`cSpell.language`](#cspelllanguage)

</td>
<td>

resource

</td>
<td>

Current active spelling language.

</td>
</tr>
<tr>
<td>

[`cSpell.languageSettings`](#cspelllanguagesettings)

</td>
<td>

resource

</td>
<td>

Additional settings for individual programming languages and locales.

</td>
</tr>
<tr>
<td>

[`cSpell.noSuggestDictionaries`](#cspellnosuggestdictionaries)

</td>
<td>

resource

</td>
<td>

Optional list of dictionaries that will not be used for suggestions. Words in these dictionaries…

</td>
</tr>
<tr>
<td>

[`cSpell.suggestWords`](#cspellsuggestwords)

</td>
<td>



</td>
<td>

A list of suggested replacements for words. Suggested words provide a way to make preferred…

</td>
</tr>
<tr>
<td>

[`cSpell.useLocallyInstalledCSpellDictionaries`](#cspelluselocallyinstalledcspelldictionaries)

</td>
<td>

resource

</td>
<td>

Search for `@cspell/cspell-bundled-dicts` in the workspace folder and use it if found.

</td>
</tr>
<tr>
<td>

[`cSpell.userWords`](#cspelluserwords)

</td>
<td>

resource

</td>
<td>

Words to add to global dictionary -- should only be in the user config file.

</td>
</tr>
<tr>
<td>

[`cSpell.words`](#cspellwords)

</td>
<td>

resource

</td>
<td>

List of words to be considered correct.

</td>
</tr>
</tbody>
</table>


## Settings


### `cSpell.caseSensitive`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.caseSensitive`

</dd>

<dt>
Description
</dt>
<dd>

Determines if words must match case and accent rules.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
  **Note:** Some languages like Portuguese have case sensitivity turned on by default.
  You must use [`cSpell.languageSettings`](languages-and-dictionaries#cspelllanguagesettings) to turn it off.
- `true` - Case and accents are enforced by default.

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


### `cSpell.customDictionaries`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.customDictionaries` -- Custom Dictionaries

</dd>

<dt>
Description
</dt>
<dd>

Define custom dictionaries to be included by default.
If `addWords` is `true` words will be added to this dictionary.

**Example:**

```js
"cSpell.customDictionaries": {
  "project-words": {
    "name": "project-words",
    "path": "${workspaceRoot}/project-words.txt",
    "description": "Words used in this project",
    "addWords": true
  },
  "custom": true, // Enable the `custom` dictionary
  "internal-terms": false // Disable the `internal-terms` dictionary
}
```

</dd>

<dt>
Type
</dt>
<dd>

[`CustomDictionaries`](#customdictionaries)

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


### `cSpell.dictionaries`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.dictionaries`

</dd>

<dt>
Description
</dt>
<dd>

Optional list of dictionaries to use.

Each entry should match the name of the dictionary.

To remove a dictionary from the list add `!` before the name.
i.e. `!typescript` will turn off the dictionary with the name `typescript`.

Example:

```json5
// Enable `lorem-ipsum` and disable `typescript`
"cSpell.dictionaries": ["lorem-ipsum", "!typescript"]
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
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### `cSpell.dictionaryDefinitions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.dictionaryDefinitions` -- Dictionary Definitions

</dd>

<dt>
Description
</dt>
<dd>

Define custom dictionaries.
If `addWords` is `true` words will be added to this dictionary.

This setting is subject to User/Workspace settings precedence rules: [Visual Studio Code User and Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings#_settings-precedence).

It is better to use [`cSpell.customDictionaries`](languages-and-dictionaries#cspellcustomdictionaries)

**Example:**

```js
"cSpell.dictionaryDefinitions": [
  {
    "name": "project-words",
    "path": "${workspaceRoot}/project-words.txt",
    "description": "Words used in this project",
    "addWords": true
  }
]
```

</dd>

<dt>
Type
</dt>
<dd>

[`DictionaryDef`](#dictionarydef)[]

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


### `cSpell.flagWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.flagWords`

</dd>

<dt>
Description
</dt>
<dd>

List of words to always be considered incorrect. Words found in `flagWords` override `words`.

Format of `flagWords`
- single word entry - `word`
- with suggestions - `word:suggestion` or `word->suggestion, suggestions`

Example:
```ts
"flagWords": [
  "color: colour",
  "incase: in case, encase",
  "canot->cannot",
  "cancelled->canceled"
]
```

Case Sensitivity:

A word is flagged if it exactly matches an entry, or if its lowercased form exactly matches an entry.
In practice this means:
- An entry written in **all lowercase** (e.g. `avocado`) flags that word in any casing found in the
  document — `avocado`, `Avocado`, and `AVOCADO` are all flagged.
- An entry containing **any uppercase letter** (e.g. `Avocado`) only flags that exact casing —
  `avocado` and `AVOCADO` are not flagged.

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


### `cSpell.ignoreWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.ignoreWords`

</dd>

<dt>
Description
</dt>
<dd>

A list of words to be ignored by the spell checker.

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


### `cSpell.language`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.language`

</dd>

<dt>
Description
</dt>
<dd>

Current active spelling language.

Example: `en-GB` for British English

Example: `en,nl` to enable both English and Dutch

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

_`"en"`_

</dd>

</dl>

---


### `cSpell.languageSettings`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.languageSettings`

</dd>

<dt>
Description
</dt>
<dd>

Additional settings for individual programming languages and locales.

</dd>

<dt>
Type
</dt>
<dd>

[`LanguageSetting`](#languagesetting)[]

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


### `cSpell.noSuggestDictionaries`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.noSuggestDictionaries`

</dd>

<dt>
Description
</dt>
<dd>

Optional list of dictionaries that will not be used for suggestions.
Words in these dictionaries are considered correct, but will not be
used when making spell correction suggestions.

Note: if a word is suggested by another dictionary, but found in
one of these dictionaries, it will be removed from the set of
possible suggestions.

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


### `cSpell.suggestWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.suggestWords`

</dd>

<dt>
Description
</dt>
<dd>

A list of suggested replacements for words.
Suggested words provide a way to make preferred suggestions on word replacements.
To hint at a preferred change, but not to require it.

Format of `suggestWords`
- Single suggestion (possible auto fix)
    - `word: suggestion`
    - `word->suggestion`
- Multiple suggestions (not auto fixable)
   - `word: first, second, third`
   - `word->first, second, third`

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

_- none -_

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### `cSpell.useLocallyInstalledCSpellDictionaries`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.useLocallyInstalledCSpellDictionaries`

</dd>

<dt>
Description
</dt>
<dd>

Search for `@cspell/cspell-bundled-dicts` in the workspace folder and use it if found.

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


### `cSpell.userWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.userWords`

</dd>

<dt>
Description
</dt>
<dd>

Words to add to global dictionary -- should only be in the user config file.

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


### `cSpell.words`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.words`

</dd>

<dt>
Description
</dt>
<dd>

List of words to be considered correct.

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


## Type Definitions


### `CustomDictionariesDictionary`

<dl>

<dt>
Name
</dt>
<dd>

CustomDictionariesDictionary

</dd>

<dt>
Description
</dt>
<dd>

Define a custom dictionary to be included.

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

`kind`

</dd>

<dt>
Description
</dt>
<dd>

Used to specify the type of dictionary being referenced.
Values:
- `words` - (default) A dictionary containing words.
- `flag-words` - A dictionary containing flag words. Words found in the dictionary will be treated like `flagWords`.
- `ignore-words` - A dictionary containing words to ignore.
   This is the same as setting `noSuggest` to `true`.
- `suggest-words` - A dictionary containing suggested word corrections. Words found in the
   dictionary will be treated like `suggestWords`.

</dd>

<dt>
Type
</dt>
<dd>

`( "words" | "flag-words" | "ignore-words" | "suggest-words" )`

</dd>

<dt>
CSpell Version
</dt>
<dd>

10.3.0

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

`name`

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
  kind?: ("words" | "flag-words" | "ignore-words" | "suggest-words");
  name?: string;
  noSuggest?: boolean;
  path?: string;
  scope?: (("user" | "workspace" | "folder") | ("user" | "workspace" | "folder")[]);
  supportNonStrictSearches?: boolean;
}
```

</details>

</dd>

</dl>

---


### `CustomDictionaries`

<dl>

<dt>
Name
</dt>
<dd>

CustomDictionaries

</dd>

<dt>
Description
</dt>
<dd>

Define custom dictionaries to be included by default.
If `addWords` is `true` words will be added to this dictionary.

**Example:**

```js
"cSpell.customDictionaries": {
  "project-words": {
    "name": "project-words",
    "path": "${workspaceRoot}/project-words.txt",
    "description": "Words used in this project",
    "addWords": true
  },
  "custom": true, // Enable the `custom` dictionary
  "internal-terms": false // Disable the `internal-terms` dictionary
}
```

</dd>

<dt>
Type
</dt>
<dd>

```ts
{
  [key: string]: (boolean | CustomDictionariesDictionary);
}
```

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

`kind`

</dd>

<dt>
Description
</dt>
<dd>

Used to specify the type of dictionary being referenced.
Values:
- `words` - (default) A dictionary containing words.
- `flag-words` - A dictionary containing flag words. Words found in the dictionary will be treated like `flagWords`.
- `ignore-words` - A dictionary containing words to ignore.
   This is the same as setting `noSuggest` to `true`.
- `suggest-words` - A dictionary containing suggested word corrections. Words found in the
   dictionary will be treated like `suggestWords`.

</dd>

<dt>
Type
</dt>
<dd>

`( "words" | "flag-words" | "ignore-words" | "suggest-words" )`

</dd>

<dt>
CSpell Version
</dt>
<dd>

10.3.0

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
  kind?: ("words" | "flag-words" | "ignore-words" | "suggest-words");
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


### `DictionaryDefPreferred`

<dl>

<dt>
Name
</dt>
<dd>

DictionaryDefPreferred

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

This is the name of a dictionary.

Name Format:
- Must contain at least 1 number or letter.
- Spaces are allowed.
- Leading and trailing space will be removed.
- Names ARE case-sensitive.
- Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.

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

Path or url to the dictionary file.

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

Optional description of the contents / purpose of the dictionary.

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

`kind`

</dd>

<dt>
Description
</dt>
<dd>

Used to specify the type of dictionary being referenced.
Values:
- `words` - (default) A dictionary containing words.
- `flag-words` - A dictionary containing flag words. Words found in the dictionary will be treated like `flagWords`.
- `ignore-words` - A dictionary containing words to ignore.
   This is the same as setting `noSuggest` to `true`.
- `suggest-words` - A dictionary containing suggested word corrections. Words found in the
   dictionary will be treated like `suggestWords`.

</dd>

<dt>
Type
</dt>
<dd>

`( "words" | "flag-words" | "ignore-words" | "suggest-words" )`

</dd>

<dt>
CSpell Version
</dt>
<dd>

10.3.0

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
  btrie?: string;
  description?: string;
  ignoreForbiddenWords?: boolean;
  kind?: ("words" | "flag-words" | "ignore-words" | "suggest-words");
  name: string;
  noSuggest?: boolean;
  path: string;
  supportNonStrictSearches?: boolean;
}
```

</details>

</dd>

</dl>

---


### `DictionaryDefCustom`

<dl>

<dt>
Name
</dt>
<dd>

DictionaryDefCustom

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

`addWords` _(required)_

</dd>

<dt>
Description
</dt>
<dd>

When `true`, let's the spell checker know that words can be added to this dictionary.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

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

`name` _(required)_

</dd>

<dt>
Description
</dt>
<dd>

This is the name of a dictionary.

Name Format:
- Must contain at least 1 number or letter.
- Spaces are allowed.
- Leading and trailing space will be removed.
- Names ARE case-sensitive.
- Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.

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

A file path or url to a custom dictionary file.

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

Optional description of the contents / purpose of the dictionary.

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

`kind`

</dd>

<dt>
Description
</dt>
<dd>

Used to specify the type of dictionary being referenced.
Values:
- `words` - (default) A dictionary containing words.
- `flag-words` - A dictionary containing flag words. Words found in the dictionary will be treated like `flagWords`.
- `ignore-words` - A dictionary containing words to ignore.
   This is the same as setting `noSuggest` to `true`.
- `suggest-words` - A dictionary containing suggested word corrections. Words found in the
   dictionary will be treated like `suggestWords`.

</dd>

<dt>
Type
</dt>
<dd>

`( "words" | "flag-words" | "ignore-words" | "suggest-words" )`

</dd>

<dt>
CSpell Version
</dt>
<dd>

10.3.0

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

Defines the scope for when words will be added to the dictionary.

Scope values: `user`, `workspace`, `folder`.

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
  addWords: boolean;
  btrie?: string;
  description?: string;
  ignoreForbiddenWords?: boolean;
  kind?: ("words" | "flag-words" | "ignore-words" | "suggest-words");
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


### `DictionaryDef`

<dl>

<dt>
Name
</dt>
<dd>

DictionaryDef

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

[`CustomDictionary`](#customdictionary)
</li>
<li>

[`DictionaryDefPreferred`](#dictionarydefpreferred)
</li>
<li>

[`DictionaryDefCustom`](#dictionarydefcustom)
</li>

</ul>

( [`CustomDictionary`](#customdictionary) | [`DictionaryDefPreferred`](#dictionarydefpreferred) | [`DictionaryDefCustom`](#dictionarydefcustom) )

</dd>

</dl>

---


### `LanguageSetting`

<dl>

<dt>
Name
</dt>
<dd>

LanguageSetting

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

`languageId` _(required)_<br/> _Note: Matches against `languageId` (File Type)_

</dd>

<dt>
Description
</dt>
<dd>

The language id.  Ex: `typescript`, `html`, or `php`.  `*` -- will match all languages.

</dd>

<dt>
Type
</dt>
<dd>

`( string | string[] )`

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

`locale`<br/> _Note: Matches against `language`_

</dd>

<dt>
Description
</dt>
<dd>

The locale filter, matches against the language. This can be a comma separated list. `*` will match all locales.

</dd>

<dt>
Type
</dt>
<dd>

`( string | string[] )`

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

`allowCompoundWords`

</dd>

<dt>
Description
</dt>
<dd>

True to enable compound word checking.

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

`caseSensitive`

</dd>

<dt>
Description
</dt>
<dd>

Determines if words must match case and accent rules.

See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
- `true` - Case and accents are enforced.

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

`description`

</dd>

<dt>
Description
</dt>
<dd>

Optional description of configuration.

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

`dictionaries`

</dd>

<dt>
Description
</dt>
<dd>

Optional list of dictionaries to use. Each entry should match the name of the dictionary.

To remove a dictionary from the list, add `!` before the name.

For example, `!typescript` will turn off the dictionary with the name `typescript`.

See the [Dictionaries](https://cspell.org/docs/dictionaries/)
and [Custom Dictionaries](https://cspell.org/docs/dictionaries/custom-dictionaries/) for more details.

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

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

`dictionaryDefinitions`

</dd>

<dt>
Description
</dt>
<dd>

Define custom dictionaries.
If `addWords` is `true` words will be added to this dictionary.

This setting is subject to User/Workspace settings precedence rules: [Visual Studio Code User and Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings#_settings-precedence).

It is better to use [`cSpell.customDictionaries`](languages-and-dictionaries#cspellcustomdictionaries)

**Example:**

```js
"cSpell.dictionaryDefinitions": [
  {
    "name": "project-words",
    "path": "${workspaceRoot}/project-words.txt",
    "description": "Words used in this project",
    "addWords": true
  }
]
```

</dd>

<dt>
Type
</dt>
<dd>

[`DictionaryDef`](#dictionarydef)[]

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

`enabled`

</dd>

<dt>
Description
</dt>
<dd>

Is the spell checker enabled.

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

`flagWords`

</dd>

<dt>
Description
</dt>
<dd>

List of words to always be considered incorrect. Words found in `flagWords` override `words`.

Format of `flagWords`
- single word entry - `word`
- with suggestions - `word:suggestion` or `word->suggestion, suggestions`

Example:
```ts
"flagWords": [
  "color: colour",
  "incase: in case, encase",
  "canot->cannot",
  "cancelled->canceled"
]
```

Case Sensitivity:

A word is flagged if it exactly matches an entry, or if its lowercased form exactly matches an entry.
In practice this means:
- An entry written in **all lowercase** (e.g. `avocado`) flags that word in any casing found in the
  document — `avocado`, `Avocado`, and `AVOCADO` are all flagged.
- An entry containing **any uppercase letter** (e.g. `Avocado`) only flags that exact casing —
  `avocado` and `AVOCADO` are not flagged.

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

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

`id`

</dd>

<dt>
Description
</dt>
<dd>

Optional identifier.

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

`ignoreRegExpList`

</dd>

<dt>
Description
</dt>
<dd>

List of regular expression patterns or pattern names to exclude from spell checking.

Example: `["href"]` - to exclude html href pattern.

Regular expressions use JavaScript regular expression syntax.

Example: to ignore ALL-CAPS words

JSON
```json
"ignoreRegExpList": ["/\\b[A-Z]+\\b/g"]
```

YAML
```yaml
ignoreRegExpList:
  - >-
   /\b[A-Z]+\b/g
```

By default, several patterns are excluded. See
[Configuration](https://cspell.org/configuration/patterns) for more details.

While you can create your own patterns, you can also leverage several patterns that are
[built-in to CSpell](https://cspell.org/types/cspell-types/types/PredefinedPatterns.html).

</dd>

<dt>
Type
</dt>
<dd>

```ts
( string  | ( "Base64"  | "Base64MultiLine"  | "Base64SingleLine"  |
 "CStyleComment"  | "CStyleHexValue"  | "CSSHexValue"  | "CommitHash"  |
 "CommitHashLink"  | "Email"  | "EscapeCharacters"  | "HexValues"  | "href"  |
 "PhpHereDoc"  | "PublicKey"  | "RsaCert"  | "SshRsa"  | "SHA"  |
 "HashStrings"  | "SpellCheckerDisable"  | "SpellCheckerDisableBlock"  |
 "SpellCheckerDisableLine"  | "SpellCheckerDisableNext"  |
 "SpellCheckerIgnoreInDocSetting"  | "string"  | "UnicodeRef"  | "Urls"  |
 "UUID"  | "Everything" ) )[]
```

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

`ignoreWords`

</dd>

<dt>
Description
</dt>
<dd>

List of words to be ignored. An ignored word will not show up as an error, even if it is
also in the `flagWords`.

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

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

`includeRegExpList`

</dd>

<dt>
Description
</dt>
<dd>

List of regular expression patterns or defined pattern names to match for spell checking.

If this property is defined, only text matching the included patterns will be checked.

While you can create your own patterns, you can also leverage several patterns that are
[built-in to CSpell](https://cspell.org/types/cspell-types/types/PredefinedPatterns.html).

</dd>

<dt>
Type
</dt>
<dd>

```ts
( string  | ( "Base64"  | "Base64MultiLine"  | "Base64SingleLine"  |
 "CStyleComment"  | "CStyleHexValue"  | "CSSHexValue"  | "CommitHash"  |
 "CommitHashLink"  | "Email"  | "EscapeCharacters"  | "HexValues"  | "href"  |
 "PhpHereDoc"  | "PublicKey"  | "RsaCert"  | "SshRsa"  | "SHA"  |
 "HashStrings"  | "SpellCheckerDisable"  | "SpellCheckerDisableBlock"  |
 "SpellCheckerDisableLine"  | "SpellCheckerDisableNext"  |
 "SpellCheckerIgnoreInDocSetting"  | "string"  | "UnicodeRef"  | "Urls"  |
 "UUID"  | "Everything" ) )[]
```

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

`name`

</dd>

<dt>
Description
</dt>
<dd>

Optional name of configuration.

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

`noSuggestDictionaries`

</dd>

<dt>
Description
</dt>
<dd>

Optional list of dictionaries that will not be used for suggestions.
Words in these dictionaries are considered correct, but will not be
used when making spell correction suggestions.

Note: if a word is suggested by another dictionary, but found in
one of these dictionaries, it will be removed from the set of
possible suggestions.

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

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

`patterns`

</dd>

<dt>
Description
</dt>
<dd>

Defines a list of patterns that can be used with the  `ignoreRegExpList`  and
 `includeRegExpList`  options.

For example:

```javascript
"ignoreRegExpList": ["comments"],
"patterns": [
  {
    "name": "comment-single-line",
    "pattern": "/#.*/g"
  },
  {
    "name": "comment-multi-line",
    "pattern": "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g"
  },
  // You can also combine multiple named patterns into one single named pattern
  {
    "name": "comments",
    "pattern": ["comment-single-line", "comment-multi-line"]
  }
]
```

</dd>

<dt>
Type
</dt>
<dd>

```ts
{
  description?: string;
  name: string;
  pattern: (string | string[]);
}[]
```

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

`substitutionDefinitions`

</dd>

<dt>
Description
</dt>
<dd>

The set of available substitutions. This is a collection of substitution definitions that can be applied to a document before spell checking.

</dd>

<dt>
Type
</dt>
<dd>

```ts
{
  description?: string;
  entries: [string, string][];
  name: string;
}[]
```

</dd>

<dt>
CSpell Version
</dt>
<dd>

9.7.0

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

`substitutions`

</dd>

<dt>
Description
</dt>
<dd>

The set of substitutions to apply to a document before spell checking.

</dd>

<dt>
Type
</dt>
<dd>

`( [ string, string ] | string )[]`

</dd>

<dt>
CSpell Version
</dt>
<dd>

9.7.0

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

`suggestWords`

</dd>

<dt>
Description
</dt>
<dd>

A list of suggested replacements for words.
Suggested words provide a way to make preferred suggestions on word replacements.
To hint at a preferred change, but not to require it.

Format of `suggestWords`
- Single suggestion (possible auto fix)
    - `word: suggestion`
    - `word->suggestion`
- Multiple suggestions (not auto fixable)
   - `word: first, second, third`
   - `word->first, second, third`

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

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

`unknownWords`

</dd>

<dt>
Description
</dt>
<dd>

Controls how unknown words are handled.

- `report-all` - Report all unknown words (default behavior)
- `report-simple` - Report unknown words that have simple spelling errors, typos, and flagged words.
- `report-common-typos` - Report unknown words that are common typos and flagged words.
- `report-flagged` - Report unknown words that are flagged.

</dd>

<dt>
Type
</dt>
<dd>

`( "report-all" | "report-simple" | "report-common-typos" | "report-flagged" )`

</dd>

<dt>
Default
</dt>
<dd>

_`"report-all"`_

</dd>

<dt>
CSpell Version
</dt>
<dd>

9.1.0

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

`useIntlWordSegmentation`

</dd>

<dt>
Description
</dt>
<dd>

Enables enables locale-sensitive text segmentation to support languages like Japanese, Chinese, Thai, Lao, Khmer, Myanmar, etc.
The locale used for the segmentation is based on the  `language`  setting.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
CSpell Version
</dt>
<dd>

10.2.0

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

`words`

</dd>

<dt>
Description
</dt>
<dd>

List of words to be considered correct.

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

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
  allowCompoundWords?: boolean;
  caseSensitive?: boolean;
  description?: string;
  dictionaries?: string[];
  dictionaryDefinitions?: DictionaryDef[];
  enabled?: boolean;
  flagWords?: string[];
  id?: string;
  ignoreRegExpList?: (string | ("Base64" | "Base64MultiLine" | "Base64SingleLine" | "CStyleComment" | "CStyleHexValue" | "CSSHexValue" | "CommitHash" | "CommitHashLink" | "Email" | "EscapeCharacters" | "HexValues" | "href" | "PhpHereDoc" | "PublicKey" | "RsaCert" | "SshRsa" | "SHA" | "HashStrings" | "SpellCheckerDisable" | "SpellCheckerDisableBlock" | "SpellCheckerDisableLine" | "SpellCheckerDisableNext" | "SpellCheckerIgnoreInDocSetting" | "string" | "UnicodeRef" | "Urls" | "UUID" | "Everything"))[];
  ignoreWords?: string[];
  includeRegExpList?: (string | ("Base64" | "Base64MultiLine" | "Base64SingleLine" | "CStyleComment" | "CStyleHexValue" | "CSSHexValue" | "CommitHash" | "CommitHashLink" | "Email" | "EscapeCharacters" | "HexValues" | "href" | "PhpHereDoc" | "PublicKey" | "RsaCert" | "SshRsa" | "SHA" | "HashStrings" | "SpellCheckerDisable" | "SpellCheckerDisableBlock" | "SpellCheckerDisableLine" | "SpellCheckerDisableNext" | "SpellCheckerIgnoreInDocSetting" | "string" | "UnicodeRef" | "Urls" | "UUID" | "Everything"))[];
  languageId: (string | string[]);
  locale?: (string | string[]);
  name?: string;
  noSuggestDictionaries?: string[];
  patterns?: {
    description?: string;
    name: string;
    pattern: (string | string[]);
  }[];
  substitutionDefinitions?: {
    description?: string;
    entries: [string, string][];
    name: string;
  }[];
  substitutions?: ([string, string] | string)[];
  suggestWords?: string[];
  unknownWords?: ("report-all" | "report-simple" | "report-common-typos" | "report-flagged");
  useIntlWordSegmentation?: boolean;
  words?: string[];
}
```

</details>

</dd>

</dl>

---




