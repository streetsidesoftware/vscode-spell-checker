---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mjs`
title: Legacy
id: legacy
---

# Legacy


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.allowCompoundWords`](#cspellallowcompoundwords) | resource | Enable / Disable allowing word compounds. |


## Definitions


### `cSpell.allowCompoundWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.allowCompoundWords`

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

resource

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
Type
</dt>
<dd>

`( object | string )[]`

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

Define custom dictionaries to be included by default for the folder.
If `addWords` is `true` words will be added to this dictionary.

</dd>


<dt>
Deprecation Message
</dt>
<dd>

- Use `#cSpell.customDictionaries#` instead.

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
Type
</dt>
<dd>

`( object | string )[]`

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

Define custom dictionaries to be included by default for the user.
If `addWords` is `true` words will be added to this dictionary.

</dd>


<dt>
Deprecation Message
</dt>
<dd>

- Use `#cSpell.customDictionaries#` instead.

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
Type
</dt>
<dd>

`( object | string )[]`

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

Define custom dictionaries to be included by default for the workspace.
If `addWords` is `true` words will be added to this dictionary.

</dd>


<dt>
Deprecation Message
</dt>
<dd>

- Use `#cSpell.customDictionaries#` instead.

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

Specify a list of file types to spell check. It is better to use [`cSpell.enabledFileTypes`](#cspellenabledfiletypes) to Enable / Disable checking files types.

</dd>


<dt>
Deprecation Message
</dt>
<dd>

- Use `#cSpell.enabledFileTypes#` instead.

</dd>


<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


