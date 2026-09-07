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

[`cSpell.unknownWords`](#cspellunknownwords)

</td>
<td>



</td>
<td>

Controls how unknown words are handled.

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
  languageSettings?: {
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
  }[];
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
}[]
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

```ts
{
  description?: string;
  name: string;
  pattern: (string | string[]);
}[]
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

```ts
{
  description?: string;
  entries: [string, string][];
  name: string;
}[]
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


### `cSpell.unknownWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.unknownWords`

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
Scope
</dt>
<dd>

_- none -_

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

```ts
{
  [key: string]: {
    data: string;
    encoding?: ("base64" | "plaintext" | "utf8");
    url?: string;
  };
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


## Type Definitions


### CustomDictionary

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

---


### DictionaryDef

```ts
(CustomDictionary | {
  btrie?: string;
  description?: string;
  ignoreForbiddenWords?: boolean;
  name: string;
  noSuggest?: boolean;
  path: string;
  supportNonStrictSearches?: boolean;
} | {
  addWords: boolean;
  btrie?: string;
  description?: string;
  ignoreForbiddenWords?: boolean;
  name: string;
  noSuggest?: boolean;
  path: string;
  scope?: (("user" | "workspace" | "folder") | ("user" | "workspace" | "folder")[]);
  supportNonStrictSearches?: boolean;
})
```

---




