---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mjs`
title: Experimental
id: experimental
---

# Experimental

Experimental settings that may change or be removed in the future.


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.experimental.enableRegexpView`](#cspellexperimentalenableregexpview) | application | Show Regular Expression Explorer |
| [`cSpell.experimental.symbols`](#cspellexperimentalsymbols) | application | Experiment with `executeDocumentSymbolProvider` |


## Settings


### `cSpell.experimental.enableRegexpView`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.experimental.enableRegexpView`

</dd>


<dt>
Description
</dt>
<dd>

Show Regular Expression Explorer

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


### `cSpell.experimental.symbols`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.experimental.symbols` -- Experiment with `executeDocumentSymbolProvider`

</dd>


<dt>
Description
</dt>
<dd>

Experiment with executeDocumentSymbolProvider.
This feature is experimental and will be removed in the future.

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


### ~~`cSpell.reportUnknownWords`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.reportUnknownWords`~~ -- Strict Spell Checking

</dd>


<dt>
Description
</dt>
<dd>

By default, the spell checker reports all unknown words as misspelled. This setting allows for a more relaxed spell checking, by only
reporting unknown words as suggestions. Common spelling errors are still flagged as misspelled.

- `all` - report all unknown words as misspelled
- `simple` - report unknown words with simple fixes and the rest as suggestions
- `typos` - report on known typo words and the rest as suggestions
- `flagged` - report only flagged words as misspelled

**Note:** This setting is deprecated. Use [`cSpell.unknownWords`](cspell#cspellunknownwords) instead.

</dd>


<dt>
Type
</dt>
<dd>

`( "all" | "simple" | "typos" | "flagged" )`

</dd>


<dt>
Scope
</dt>
<dd>

language-overridable - Resource settings that can be overridable at a language level.

</dd>


<dt>
Deprecation Message
</dt>
<dd>

Use Unknown Words settings instead.

</dd>


<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


