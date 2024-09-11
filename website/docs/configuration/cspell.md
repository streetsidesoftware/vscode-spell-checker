---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mjs`
title: CSpell
id: cspell
---

# CSpell


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.experimental.symbols`](#cspellexperimentalsymbols) | application | Experiment with `executeDocumentSymbolProvider` |
| [`cSpell.ignoreRegExpList`](#cspellignoreregexplist) | resource | List of regular expressions or Pattern names (defined in `#cSpell.patterns#`) to exclude from… |
| [`cSpell.includeRegExpList`](#cspellincluderegexplist) | resource | List of regular expression patterns or defined pattern names to match for spell checking. |
| [`cSpell.overrides`](#cspelloverrides) | resource | Overrides are used to apply settings for specific files in your project. |
| [`cSpell.patterns`](#cspellpatterns) | resource | Defines a list of patterns that can be used with the `#cSpell.ignoreRegExpList#` and `#cSpell.includeRegExpList#`… |


## Definitions


### `cSpell.experimental.symbols`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.experimental.symbols` -- Experiment with `executeDocumentSymbolProvider`

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

application

</dd>


<dt>
Description
</dt>
<dd>

Experiment with executeDocumentSymbolProvider.
This feature is experimental and will be removed in the future.

</dd>




<dt>
Default
</dt>
<dd>

_`false`_

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
Type
</dt>
<dd>

`string[]`

</dd>


<dt>
Scope
</dt>
<dd>

resource

</dd>


<dt>
Description
</dt>
<dd>

List of regular expressions or Pattern names (defined in [`cSpell.patterns`](#cspellpatterns)) to exclude from spell checking.

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
Type
</dt>
<dd>

`string[]`

</dd>


<dt>
Scope
</dt>
<dd>

resource

</dd>


<dt>
Description
</dt>
<dd>

List of regular expression patterns or defined pattern names to match for spell checking.

If this property is defined, only text matching the included patterns will be checked.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

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
Type
</dt>
<dd>

`object[]`

</dd>


<dt>
Scope
</dt>
<dd>

resource

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
Type
</dt>
<dd>

`object[]`

</dd>


<dt>
Scope
</dt>
<dd>

resource

</dd>


<dt>
Description
</dt>
<dd>

Defines a list of patterns that can be used with the [`cSpell.ignoreRegExpList`](#cspellignoreregexplist) and
[`cSpell.includeRegExpList`](#cspellincluderegexplist) options.

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
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


