---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mjs`
title: Languages and Dictionaries
id: languages-and-dictionaries
---

# Languages and Dictionaries

Settings that control dictionaries and language preferences.


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.caseSensitive`](#cspellcasesensitive) | resource | Determines if words must match case and accent rules. |
| [`cSpell.customDictionaries`](#cspellcustomdictionaries) | resource | Custom Dictionaries |
| [`cSpell.dictionaries`](#cspelldictionaries) | resource | Optional list of dictionaries to use. |
| [`cSpell.dictionaryDefinitions`](#cspelldictionarydefinitions) | resource | Dictionary Definitions |
| [`cSpell.flagWords`](#cspellflagwords) | resource | List of words to always be considered incorrect. Words found in `flagWords` override `words`. |
| [`cSpell.ignoreWords`](#cspellignorewords) | resource | A list of words to be ignored by the spell checker. |
| [`cSpell.language`](#cspelllanguage) | resource | Current active spelling language. |
| [`cSpell.languageSettings`](#cspelllanguagesettings) | resource | Additional settings for individual programming languages and locales. |
| [`cSpell.noSuggestDictionaries`](#cspellnosuggestdictionaries) | resource | Optional list of dictionaries that will not be used for suggestions. Words in these dictionaries… |
| [`cSpell.suggestWords`](#cspellsuggestwords) |  | A list of suggested replacements for words. Suggested words provide a way to make preferred… |
| [`cSpell.useLocallyInstalledCSpellDictionaries`](#cspelluselocallyinstalledcspelldictionaries) | resource | Search for `@cspell/cspell-bundled-dicts` in the workspace folder and use it if found. |
| [`cSpell.userWords`](#cspelluserwords) | resource | Words to add to global dictionary -- should only be in the user config file. |
| [`cSpell.words`](#cspellwords) | resource | List of words to be considered correct. |


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
  Note: Some languages like Portuguese have case sensitivity turned on by default.
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

`object`

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

`object[]`

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

`object[]`

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
Since Version
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


