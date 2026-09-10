---
id: in-document-settings
title: In-document settings
sidebar_position: 1
description: 'Control spell checking from within a file using cSpell directives.'
---

# In-document settings

Some spelling decisions belong to one file rather than to the whole project: a block of
encoded data, a quotation in another language, a test fixture full of deliberate nonsense.
For these, the checker reads directives written as comments in the file itself.

Every directive is prefixed with `cSpell:` or `spell-checker:`. The prefix is case
insensitive, so `cSPELL:DISABLE` also works.

## The directives

| Directive | Effect | Scope |
| --- | --- | --- |
| `disable` | Stop checking from this point | From the directive onward |
| `enable` | Resume checking | From the directive onward |
| `disable-line` | Skip the current line | One line |
| `disable-next-line` | Skip the following line | One line |
| `ignore <words>` | Do not report these words | Entire file |
| `words <words>` | Treat these words as correct, and offer them as suggestions | Entire file |
| `locale <locales>` | Set the locale, e.g. `cSpell:locale fr,en` | Entire file |
| `ignoreRegExp <pattern>` | Do not check text matching the pattern | Entire file |
| `includeRegExp <pattern>` | Check only text matching the pattern | Entire file |
| `enableCompoundWords` / `disableCompoundWords` | Allow or disallow glued words such as `errormessage` | Entire file |

The distinction in the scope column matters. `disable` and `enable` mark off regions;
everything else applies to the whole file no matter where in the file it is written.

## Turning checking off for a region

`disable` and `enable` work as a pair. Without a closing `enable`, checking stays off to the
end of the file.

```js
// cSpell:disable
const wackyWord = ['zaallano', 'wooorrdd', 'zzooommmmmmmm'];
/* cSpell:enable */

const str = 'goededag'; // reported

// cSpell:disable
const other = 'goedemorgen'; // not reported — no closing enable follows
```

Nesting is not supported: a second `disable` inside a disabled region has no additional
effect, and the first `enable` resumes checking.

In Markdown, HTML, and other markup, write the directive in a comment for that language:

```markdown
<!--- cSpell:disable --->

This text is not checked.

<!--- cSpell:enable --->

This text is checked.
```

For a single line, `disable-line` and `disable-next-line` are less disruptive than a pair:

```ts
const hash = 'q3vf9wooorrdd'; // cspell:disable-line

// cspell:disable-next-line
const fixture = 'zzooommmmmmmm';
```

## Accepting particular words

Two directives accept words, and the choice between them depends on whether you want the word
offered as a suggestion elsewhere.

`ignore` suppresses the report and nothing more:

```js
// cSpell:ignore zaallano, wooorrdd
// cSpell:ignore zzooommmmmmmm
const wackyWord = ['zaallano', 'wooorrdd', 'zzooommmmmmmm'];
```

`words` also adds the word to the suggestion list, which is what you want for real
terminology — a product name or an internal abbreviation that other words in the file may be
misspellings of:

```js
// cSpell:words woorxs sweeetbeat
const companyName = 'woorxs sweeetbeat';
```

Both apply to the entire file. Where a term recurs across the project, add it to
`cspell.json` instead — see [Adding words](../getting-started/adding-words.md).

## Compound words

Some languages routinely glue words together. `enableCompoundWords` accepts those
combinations:

```c
// cSpell:enableCompoundWords
char * errormessage;  // accepted
int    errornumber;   // accepted
```

Compound checking cannot be switched on and off within one file. The last directive in the
file determines the setting for all of it.

## Excluding and including text by pattern

By default the whole document is checked. `ignoreRegExp` and `includeRegExp` narrow that by
pattern rather than by position, which suits text identified by its shape — hashes, encoded
blobs, email addresses.

The checker resolves them in this order:

1. Find all text matching `includeRegExp`.
2. Remove any text matching `ignoreRegExp`.
3. Check what remains.

If no flags are given, `gim` are applied.

```js
// cSpell:ignoreRegExp 0x[0-9a-f]+     -- C style hex numbers
// cSpell:ignoreRegExp /0x[0-9A-F]+/g  -- upper case C style hex numbers
// cSpell:ignoreRegExp /[^\s]{40,}/    -- long strings containing no spaces
// cSpell:ignoreRegExp Email           -- a predefined pattern
var encodedImage = 'HR+cPzr7XGAOJNurPL0G8I2kU0UhKcqFssoKvFTR7z0T3VJfK37vS025uKroHfJ9nA6WWbHZ';
var email = 'emailaddress@myfancynewcompany.com';
```

Two details are easy to miss. A pattern given without delimiters ends at the first space, so
`g{5} h{5}` matches `ggggg` but not `hhhhh`; delimit it — `/g{5} h{5}/` — to match the space
as well. And a pattern inside a `/* … */` comment is terminated by the closing `*/`, so
`/* cSpell:ignoreRegExp /n{5}/ */` does not behave as written. Prefer a line comment, or a
block comment spread over several lines.

`includeRegExp` is rarely needed, but it is useful for mixed-language files where only
comments and docstrings should be checked:

```python
# cSpell:includeRegExp #.*
# cSpell:includeRegExp /(["]{3}|[']{3})[^\1]*?\1/g

def sum_it(self, seq):
    """This is checked for spelling"""
    variabele = 0
    alinea = 'this is not checked'
```

Like the word lists, both patterns apply to the entire file; they do not start and stop.

## Predefined patterns

Names may be used in place of a regular expression.

**Exclude:** `Urls`, `HexValues`, `EscapeCharacters`, `Base64`, `Email`.
`Urls`, `EscapeCharacters`, and `Base64` are already excluded from every file.

**Include:** `Everything` (the default), `string`, `CStyleComment`, `PhpHereDoc`.

## Choosing between a directive and a setting

A directive is the right tool when the situation is confined to one file, and when the reason
for it is best read next to the code it concerns. Anything that recurs — project terminology,
ignored paths, the locale — belongs in `cspell.json`, where the
[`cspell`](https://cspell.org) command-line tool reads the same values and continuous
integration agrees with the editor.

**See also:** [Enabling file types](./enable-file-types.md) ·
[Configuration](/docs/configuration)
