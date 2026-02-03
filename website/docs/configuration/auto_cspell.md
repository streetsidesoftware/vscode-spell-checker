---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mjs`
title: CSpell
id: cspell
---

# CSpell

Settings related to CSpell Command Line Tool.


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.engines`](#cspellengines) |  | Specify compatible engine versions. |
| [`cSpell.ignoreRandomStrings`](#cspellignorerandomstrings) |  | Ignore sequences of characters that look like random strings. |
| [`cSpell.ignoreRegExpList`](#cspellignoreregexplist) | resource | List of regular expressions or Pattern names (defined in [`cSpell.patterns`](cspell#cspellpatterns))… |
| [`cSpell.includeRegExpList`](#cspellincluderegexplist) | resource | List of regular expression patterns or defined pattern names to match for spell checking. |
| [`cSpell.maxFileSize`](#cspellmaxfilesize) |  | The Maximum size of a file to spell check. This is used to prevent spell checking very large… |
| [`cSpell.minRandomLength`](#cspellminrandomlength) |  | The minimum length of a random string to be ignored. |
| [`cSpell.overrides`](#cspelloverrides) | resource | Overrides are used to apply settings for specific files in your project. |
| [`cSpell.patterns`](#cspellpatterns) | resource | Defines a list of patterns that can be used with the [`cSpell.ignoreRegExpList`](cspell#cspellignoreregexplist)… |
| [`cSpell.unknownWords`](#cspellunknownwords) |  | Controls how unknown words are handled. |
| [`cSpell.vfs`](#cspellvfs) |  | Files to add to the CSpell Virtual File System. |


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

`object`

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

`object`

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


