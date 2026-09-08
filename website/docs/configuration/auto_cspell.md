---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mts`
title: CSpell
id: cspell
---

# CSpell

Settings related to CSpell Command Line Tool.


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

[`cSpell.engines`](#cspellengines)

</td>
<td>



</td>
<td>

Specify compatible engine versions.

</td>
</tr>
<tr>
<td>

[`cSpell.ignoreRandomStrings`](#cspellignorerandomstrings)

</td>
<td>



</td>
<td>

Ignore sequences of characters that look like random strings.

</td>
</tr>
<tr>
<td>

[`cSpell.ignoreRegExpList`](#cspellignoreregexplist)

</td>
<td>

resource

</td>
<td>

List of regular expressions or Pattern names (defined in [`cSpell.patterns`](cspell#cspellpatterns))…

</td>
</tr>
<tr>
<td>

[`cSpell.includeRegExpList`](#cspellincluderegexplist)

</td>
<td>

resource

</td>
<td>

List of regular expression patterns or defined pattern names to match for spell checking.

</td>
</tr>
<tr>
<td>

[`cSpell.maxFileSize`](#cspellmaxfilesize)

</td>
<td>



</td>
<td>

The Maximum size of a file to spell check. This is used to prevent spell checking very large…

</td>
</tr>
<tr>
<td>

[`cSpell.minRandomLength`](#cspellminrandomlength)

</td>
<td>



</td>
<td>

The minimum length of a random string to be ignored.

</td>
</tr>
<tr>
<td>

[`cSpell.overrides`](#cspelloverrides)

</td>
<td>

resource

</td>
<td>

Overrides are used to apply settings for specific files in your project.

</td>
</tr>
<tr>
<td>

[`cSpell.patterns`](#cspellpatterns)

</td>
<td>

resource

</td>
<td>

Defines a list of patterns that can be used with the [`cSpell.ignoreRegExpList`](cspell#cspellignoreregexplist)…

</td>
</tr>
<tr>
<td>

[`cSpell.substitutionDefinitions`](#cspellsubstitutiondefinitions)

</td>
<td>



</td>
<td>

The set of available substitutions. This is a collection of substitution definitions that can…

</td>
</tr>
<tr>
<td>

[`cSpell.substitutions`](#cspellsubstitutions)

</td>
<td>



</td>
<td>

The set of substitutions to apply to a document before spell checking.

</td>
</tr>
<tr>
<td>

[`cSpell.useIntlWordSegmentation`](#cspelluseintlwordsegmentation)

</td>
<td>



</td>
<td>

Enables enables locale-sensitive text segmentation to support languages like Japanese, Chinese,…

</td>
</tr>
<tr>
<td>

[`cSpell.vfs`](#cspellvfs)

</td>
<td>



</td>
<td>

Files to add to the CSpell Virtual File System.

</td>
</tr>
</tbody>
</table>


## Settings


### `cSpell.engines`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.engines`

</dd>

<dt>
Description
</dt>
<dd>

Specify compatible engine versions.

This allows dictionaries and other components to specify the versions of engines (like cspell) they are compatible with.

It does not enforce compatibility, it is up to the client to use this information as needed.

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

`code-spell-checker`

</dd>

<dt>
Description
</dt>
<dd>

The VSCode Spell Checker version predicate.

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

9.6.3

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

`cspell`

</dd>

<dt>
Description
</dt>
<dd>

CSpell version predicate.

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

9.6.3

</dd>

</dl>

</td>
</tr>
</tbody>
</table>

```ts
{
  "code-spell-checker"?: string;
  cspell?: string;
  [key: string]: string;
}
```

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

<dt>
CSpell Version
</dt>
<dd>

9.6.3

</dd>

</dl>

---


### `cSpell.ignoreRandomStrings`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.ignoreRandomStrings`

</dd>

<dt>
Description
</dt>
<dd>

Ignore sequences of characters that look like random strings.

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

_- none -_

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

---


### `cSpell.ignoreRegExpList`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.ignoreRegExpList`

</dd>

<dt>
Description
</dt>
<dd>

List of regular expressions or Pattern names (defined in [`cSpell.patterns`](cspell#cspellpatterns)) to exclude from spell checking.

- When using the VS Code Preferences UI, it is not necessary to escape the `\`, VS Code takes care of that.
- When editing the VS Code `settings.json` file,
  it is necessary to escape `\`.
  Each `\` becomes `\\`.

The default regular expression flags are `gi`. Add `u` (`gui`), to enable Unicode.

| VS Code UI          | settings.json         | Description                                  |
| :------------------ | :-------------------- | :------------------------------------------- |
| `/\\[a-z]+/gi`      | `/\\\\[a-z]+/gi`      | Exclude LaTeX command like `\mapsto`         |
| `/\b[A-Z]{3,5}\b/g` | `/\\b[A-Z]{3,5}\\b/g` | Exclude full-caps acronyms of 3-5 length.    |
| `CStyleComment`     | `CStyleComment`       | A built in pattern                           |

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


### `cSpell.includeRegExpList`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.includeRegExpList`

</dd>

<dt>
Description
</dt>
<dd>

List of regular expression patterns or defined pattern names to match for spell checking.

If this property is defined, only text matching the included patterns will be checked.

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


### `cSpell.maxFileSize`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.maxFileSize`

</dd>

<dt>
Description
</dt>
<dd>

The Maximum size of a file to spell check. This is used to prevent spell checking very large files.

The value can be number or a string formatted `<number>[units]`, number with optional units.

Supported units:

- K, KB - value * 1024
- M, MB - value * 2^20
- G, GB - value * 2^30

Special values:
- `0` - has the effect of removing the limit.

Examples:
- `1000000` - 1 million bytes
- `1000K` or `1000KB` - 1 thousand kilobytes
- `0.5M` or `0.5MB` - 0.5 megabytes

default: no limit

</dd>

<dt>
Type
</dt>
<dd>

**Any of:**

<ul>

<li>

`number`
</li>
<li>

`string`
</li>

</ul>

`( number | string )`

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

<dt>
CSpell Version
</dt>
<dd>

9.4.0

</dd>

</dl>

---


### `cSpell.minRandomLength`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.minRandomLength`

</dd>

<dt>
Description
</dt>
<dd>

The minimum length of a random string to be ignored.

</dd>

<dt>
Type
</dt>
<dd>

`number`

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

_`40`_

</dd>

</dl>

---


### `cSpell.overrides`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.overrides`

</dd>

<dt>
Description
</dt>
<dd>

Overrides are used to apply settings for specific files in your project.

**Example:**

```json5
"cSpell.overrides": [
  // Force `*.hrr` and `*.crr` files to be treated as `cpp` files:
  {
    "filename": "**/{*.hrr,*.crr}",
    "languageId": "cpp"
  },
  // Force `dutch/**/*.txt` to be treated as Dutch (dictionary needs to be installed separately):
  {
    "filename": "**/dutch/**/*.txt",
    "language": "nl"
  }
]
```

</dd>

<dt>
Type
</dt>
<dd>

[`OverrideSettings`](#overridesettings)[]

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


### `cSpell.patterns`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.patterns`

</dd>

<dt>
Description
</dt>
<dd>

Defines a list of patterns that can be used with the [`cSpell.ignoreRegExpList`](cspell#cspellignoreregexplist) and
[`cSpell.includeRegExpList`](cspell#cspellincluderegexplist) options.

**Example:**

```json5
"cSpell.patterns": [
  {
    "name": "comment-single-line",
    "pattern": "/#.*/g"
  },
  {
    "name": "comment-multi-line",
    "pattern": "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g"
  }
]
```

</dd>

<dt>
Type
</dt>
<dd>

**Array of:**

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

Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
It is possible to redefine one of the predefined patterns to override its value.

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

`pattern` _(required)_

</dd>

<dt>
Description
</dt>
<dd>

RegExp pattern or array of RegExp patterns.

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

`description`

</dd>

<dt>
Description
</dt>
<dd>

Description of the pattern.

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
</tbody>
</table>

```ts
{
  description?: string;
  name: string;
  pattern: (string | string[]);
}
```

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


### `cSpell.substitutionDefinitions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.substitutionDefinitions`

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

**Array of:**

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

`entries` _(required)_

</dd>

<dt>
Description
</dt>
<dd>

The entries for the substitution definition. This is a collection of substitution entries that can be applied to a
document before spell checking.

</dd>

<dt>
Type
</dt>
<dd>

`[ string, string ][]`

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

The name of the substitution definition. This is used to reference the substitution definition in the substitutions array.

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

9.7.0

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

`description`

</dd>

<dt>
Description
</dt>
<dd>

An optional description of the substitution definition. This is not used for anything, but can be useful for
documentation purposes.

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
</tbody>
</table>

```ts
{
  description?: string;
  entries: [string, string][];
  name: string;
}
```

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

<dt>
CSpell Version
</dt>
<dd>

9.7.0

</dd>

</dl>

---


### `cSpell.substitutions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.substitutions`

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

<dt>
CSpell Version
</dt>
<dd>

9.7.0

</dd>

</dl>

---


### `cSpell.useIntlWordSegmentation`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.useIntlWordSegmentation`

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

<dt>
CSpell Version
</dt>
<dd>

10.2.0

</dd>

</dl>

---


### `cSpell.vfs`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.vfs`

</dd>

<dt>
Description
</dt>
<dd>

Files to add to the CSpell Virtual File System.

They can be referenced using `cspell-vfs:///<module>/<path-to-file>/<file-name>` URLs.

They can be referenced in the `path` field of dictionary definitions.

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
  [key: string]: {
    data: string;
    encoding?: ("base64" | "plaintext" | "utf8");
    url?: string;
  };
}
```

</details>

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

<dt>
CSpell Version
</dt>
<dd>

9.7.0

</dd>

</dl>

---


## Type Definitions


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


### `OverrideSettings`

<dl>

<dt>
Name
</dt>
<dd>

OverrideSettings

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

`filename` _(required)_<br/> _Note: Selects Files_

</dd>

<dt>
Description
</dt>
<dd>

The filename glob pattern to which this override applies. This is how the override determines which files it affects.

Example to set the language for all TypeScript files:
```json5
{
  "filename": "**/french/**", // match all files in the french directory
  "language": "fr" // Apply French language settings to all files in the french directory
}
```
Example to set the file type for a specific set of files:
```json5
{
  "filename": "**/*.ts",
  "languageId": "typescript"
}
```

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

`diagnosticLevel`

</dd>

<dt>
Description
</dt>
<dd>

The Diagnostic Severity Level determines how issues are shown in the Problems Pane and within the document.
Set the level to `Hint` to hide the issues from the Problems Pane.

Note: [`cSpell.useCustomDecorations`](appearance#cspellusecustomdecorations) must be `false` to use VS Code Diagnostic Severity Levels.

See: [VS Code Diagnostic Severity Level](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity)

</dd>

<dt>
Type
</dt>
<dd>

`( "Error" | "Warning" | "Information" | "Hint" )`

</dd>

<dt>
Default
</dt>
<dd>

_`"Information"`_

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

`diagnosticLevelFlaggedWords`

</dd>

<dt>
Description
</dt>
<dd>

Flagged word issues found by the spell checker are marked with a Diagnostic Severity Level. This affects the color of the squiggle.
By default, flagged words will use the same diagnostic level as general issues. Use this setting to customize them.

See: [VS Code Diagnostic Severity Level](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity)

</dd>

<dt>
Type
</dt>
<dd>

`( "Error" | "Warning" | "Information" | "Hint" )`

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

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

`enabledFileTypes`

</dd>

<dt>
Description
</dt>
<dd>

Enable / Disable checking file types (languageIds).

This setting replaces:  `Settings.enabledLanguageIds`  and  `Settings.enableFiletypes` .

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

<dt>
CSpell Version
</dt>
<dd>

8.8.1

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

`enabledLanguageIds`

</dd>

<dt>
Description
</dt>
<dd>

Specify a list of file types to spell check. It is better to use  `Settings.enabledFileTypes`  to Enable / Disable checking files types.

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

`enableFiletypes`

</dd>

<dt>
Description
</dt>
<dd>

Enable / Disable checking file types (languageIds).

These are in additional to the file types specified by  `Settings.enabledLanguageIds` .
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

`ignoreRandomStrings`

</dd>

<dt>
Description
</dt>
<dd>

Ignore sequences of characters that look like random strings.

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

`language`

</dd>

<dt>
Description
</dt>
<dd>

Sets the locale.

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

`languageId`

</dd>

<dt>
Description
</dt>
<dd>

Sets the programming language id to match file type.

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

`languageSettings`

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

`loadDefaultConfiguration`

</dd>

<dt>
Description
</dt>
<dd>

By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
will prevent ALL default configuration from being loaded.

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

`maxDuplicateProblems`

</dd>

<dt>
Description
</dt>
<dd>

The maximum number of times the same word can be flagged as an error in a file.

</dd>

<dt>
Type
</dt>
<dd>

`number`

</dd>

<dt>
Default
</dt>
<dd>

_`5`_

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

`maxFileSize`

</dd>

<dt>
Description
</dt>
<dd>

The Maximum size of a file to spell check. This is used to prevent spell checking very large files.

The value can be number or a string formatted `<number>[units]`, number with optional units.

Supported units:

- K, KB - value * 1024
- M, MB - value * 2^20
- G, GB - value * 2^30

Special values:
- `0` - has the effect of removing the limit.

Examples:
- `1000000` - 1 million bytes
- `1000K` or `1000KB` - 1 thousand kilobytes
- `0.5M` or `0.5MB` - 0.5 megabytes

default: no limit

</dd>

<dt>
Type
</dt>
<dd>

`( number | string )`

</dd>

<dt>
CSpell Version
</dt>
<dd>

9.4.0

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

`maxNumberOfProblems`

</dd>

<dt>
Description
</dt>
<dd>

The maximum number of problems to report in a file.

</dd>

<dt>
Type
</dt>
<dd>

`number`

</dd>

<dt>
Default
</dt>
<dd>

_`10000`_

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

`minRandomLength`

</dd>

<dt>
Description
</dt>
<dd>

The minimum length of a random string to be ignored.

</dd>

<dt>
Type
</dt>
<dd>

`number`

</dd>

<dt>
Default
</dt>
<dd>

_`40`_

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

`minWordLength`

</dd>

<dt>
Description
</dt>
<dd>

The minimum length of a word before checking it against a dictionary.

</dd>

<dt>
Type
</dt>
<dd>

`number`

</dd>

<dt>
Default
</dt>
<dd>

_`4`_

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

`numSuggestions`

</dd>

<dt>
Description
</dt>
<dd>

Number of suggestions to make.

</dd>

<dt>
Type
</dt>
<dd>

`number`

</dd>

<dt>
Default
</dt>
<dd>

_`10`_

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

`pnpFiles`

</dd>

<dt>
Description
</dt>
<dd>

The PnP files to search for. Note: `.mjs` files are not currently supported.

</dd>

<dt>
Type
</dt>
<dd>

`string[]`

</dd>

<dt>
Default
</dt>
<dd>

```json5 title="default"
[
  ".pnp.js",
  ".pnp.cjs"
]
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

`suggestionNumChanges`

</dd>

<dt>
Description
</dt>
<dd>

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

</dd>

<dt>
Type
</dt>
<dd>

`number`

</dd>

<dt>
Default
</dt>
<dd>

_`3`_

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

`suggestionsTimeout`

</dd>

<dt>
Description
</dt>
<dd>

The maximum amount of time in milliseconds to generate suggestions for a word.

</dd>

<dt>
Type
</dt>
<dd>

`number`

</dd>

<dt>
Default
</dt>
<dd>

_`500`_

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

`usePnP`

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
  diagnosticLevel?: ("Error" | "Warning" | "Information" | "Hint");
  diagnosticLevelFlaggedWords?: ("Error" | "Warning" | "Information" | "Hint");
  dictionaries?: string[];
  dictionaryDefinitions?: DictionaryDef[];
  enableFiletypes?: string[];
  enabled?: boolean;
  enabledFileTypes?: {
    [key: string]: boolean;
  };
  enabledLanguageIds?: string[];
  filename: (string | string[]);
  flagWords?: string[];
  id?: string;
  ignoreRandomStrings?: boolean;
  ignoreRegExpList?: (string | ("Base64" | "Base64MultiLine" | "Base64SingleLine" | "CStyleComment" | "CStyleHexValue" | "CSSHexValue" | "CommitHash" | "CommitHashLink" | "Email" | "EscapeCharacters" | "HexValues" | "href" | "PhpHereDoc" | "PublicKey" | "RsaCert" | "SshRsa" | "SHA" | "HashStrings" | "SpellCheckerDisable" | "SpellCheckerDisableBlock" | "SpellCheckerDisableLine" | "SpellCheckerDisableNext" | "SpellCheckerIgnoreInDocSetting" | "string" | "UnicodeRef" | "Urls" | "UUID" | "Everything"))[];
  ignoreWords?: string[];
  includeRegExpList?: (string | ("Base64" | "Base64MultiLine" | "Base64SingleLine" | "CStyleComment" | "CStyleHexValue" | "CSSHexValue" | "CommitHash" | "CommitHashLink" | "Email" | "EscapeCharacters" | "HexValues" | "href" | "PhpHereDoc" | "PublicKey" | "RsaCert" | "SshRsa" | "SHA" | "HashStrings" | "SpellCheckerDisable" | "SpellCheckerDisableBlock" | "SpellCheckerDisableLine" | "SpellCheckerDisableNext" | "SpellCheckerIgnoreInDocSetting" | "string" | "UnicodeRef" | "Urls" | "UUID" | "Everything"))[];
  language?: string;
  languageId?: (string | string[]);
  languageSettings?: LanguageSetting[];
  loadDefaultConfiguration?: boolean;
  maxDuplicateProblems?: number;
  maxFileSize?: (number | string);
  maxNumberOfProblems?: number;
  minRandomLength?: number;
  minWordLength?: number;
  name?: string;
  noSuggestDictionaries?: string[];
  numSuggestions?: number;
  patterns?: {
    description?: string;
    name: string;
    pattern: (string | string[]);
  }[];
  pnpFiles?: string[];
  substitutionDefinitions?: {
    description?: string;
    entries: [string, string][];
    name: string;
  }[];
  substitutions?: ([string, string] | string)[];
  suggestWords?: string[];
  suggestionNumChanges?: number;
  suggestionsTimeout?: number;
  unknownWords?: ("report-all" | "report-simple" | "report-common-typos" | "report-flagged");
  useIntlWordSegmentation?: boolean;
  usePnP?: boolean;
  words?: string[];
}
```

</details>

</dd>

</dl>

---




