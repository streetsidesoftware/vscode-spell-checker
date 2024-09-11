---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mjs`
title: Performance
id: performance
---

# Performance

Settings that control the performance of the spell checker.


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`](#cspellblockcheckingwhenaveragechunksizegreaterthan) | language-overridable | The maximum average length of chunks of text without word breaks. |
| [`cSpell.blockCheckingWhenLineLengthGreaterThan`](#cspellblockcheckingwhenlinelengthgreaterthan) | language-overridable | The maximum line length. |
| [`cSpell.blockCheckingWhenTextChunkSizeGreaterThan`](#cspellblockcheckingwhentextchunksizegreaterthan) | language-overridable | The maximum length of a chunk of text without word breaks. |
| [`cSpell.checkLimit`](#cspellchecklimit) | resource | Set the maximum number of bocks of text to check. Each block is 1024 characters. |
| [`cSpell.spellCheckDelayMs`](#cspellspellcheckdelayms) | application | Delay in ms after a document has changed before checking it for spelling errors. |
| [`cSpell.suggestionsTimeout`](#cspellsuggestionstimeout) | resource | The maximum amount of time in milliseconds to generate suggestions for a word. |


## Settings


### `cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`

</dd>


<dt>
Description
</dt>
<dd>

The maximum average length of chunks of text without word breaks.


A chunk is the characters between absolute word breaks.
Absolute word breaks match: `/[\s,{}[\]]/`


**Error Message:** _Average Word Size is Too High._


If you are seeing this message, it means that the file contains mostly long lines
without many word breaks.

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

language-overridable - Resource settings that can be overridable at a language level.

</dd>




<dt>
Default
</dt>
<dd>

_`80`_

</dd>




</dl>

---


### `cSpell.blockCheckingWhenLineLengthGreaterThan`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.blockCheckingWhenLineLengthGreaterThan`

</dd>


<dt>
Description
</dt>
<dd>

The maximum line length.


Block spell checking if lines are longer than the value given.
This is used to prevent spell checking generated files.


**Error Message:** _Lines are too long._

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

language-overridable - Resource settings that can be overridable at a language level.

</dd>




<dt>
Default
</dt>
<dd>

_`10000`_

</dd>




</dl>

---


### `cSpell.blockCheckingWhenTextChunkSizeGreaterThan`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.blockCheckingWhenTextChunkSizeGreaterThan`

</dd>


<dt>
Description
</dt>
<dd>

The maximum length of a chunk of text without word breaks.


It is used to prevent spell checking of generated files.


A chunk is the characters between absolute word breaks.
Absolute word breaks match: `/[\s,{}[\]]/`, i.e. spaces or braces.


**Error Message:** _Maximum Word Length is Too High._


If you are seeing this message, it means that the file contains a very long line
without many word breaks.

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

language-overridable - Resource settings that can be overridable at a language level.

</dd>




<dt>
Default
</dt>
<dd>

_`500`_

</dd>




</dl>

---


### `cSpell.checkLimit`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.checkLimit`

</dd>


<dt>
Description
</dt>
<dd>

Set the maximum number of bocks of text to check.
Each block is 1024 characters.

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

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>




<dt>
Default
</dt>
<dd>

_`500`_

</dd>




</dl>

---


### `cSpell.spellCheckDelayMs`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.spellCheckDelayMs`

</dd>


<dt>
Description
</dt>
<dd>

Delay in ms after a document has changed before checking it for spelling errors.

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

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>




<dt>
Default
</dt>
<dd>

_`50`_

</dd>




</dl>

---


### `cSpell.suggestionsTimeout`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.suggestionsTimeout`

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
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>




<dt>
Default
</dt>
<dd>

_`400`_

</dd>




</dl>

---


