---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.js`
title: Configuration
slug: configuration
toc_max_heading_level: 5
---

# Configuration Settings


- [Code Spell Checker](#code-spell-checker)
- [Languages and Dictionaries](#languages-and-dictionaries)
- [Reporting and Display](#reporting-and-display)
- [Files, Folders, and Workspaces](#files-folders-and-workspaces)
- [Performance](#performance)
- [CSpell](#cspell)
- [Appearance](#appearance)
- [Advanced](#advanced)
- [Experimental](#experimental)
- [Legacy](#legacy)



## Code Spell Checker


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.enabled`](#cspellenabled) | resource | Enable / Disable the spell checker. |


### Definitions


#### `cSpell.enabled`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.enabled`

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

Enable / Disable the spell checker.

</dd>




<dt>
Default
</dt>
<dd>

_`true`_

</dd>




</dl>

---




## Languages and Dictionaries


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


### Definitions


#### `cSpell.caseSensitive`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.caseSensitive`

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

Determines if words must match case and accent rules.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
  Note: Some languages like Portuguese have case sensitivity turned on by default.
  You must use [`cSpell.languageSettings`](#cspelllanguagesettings) to turn it off.
- `true` - Case and accents are enforced by default.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.customDictionaries`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.customDictionaries` -- Custom Dictionaries

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

resource

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
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.dictionaries`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.dictionaries`

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
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.dictionaryDefinitions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.dictionaryDefinitions` -- Dictionary Definitions

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

Define custom dictionaries.
If `addWords` is `true` words will be added to this dictionary.

This setting is subject to User/Workspace settings precedence rules: [Visual Studio Code User and Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings#_settings-precedence).

It is better to use [`cSpell.customDictionaries`](#cspellcustomdictionaries)

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
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.flagWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.flagWords`

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
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.ignoreWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.ignoreWords`

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

A list of words to be ignored by the spell checker.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.language`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.language`

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

resource

</dd>


<dt>
Description
</dt>
<dd>

Current active spelling language.

Example: "en-GB" for British English

Example: "en,nl" to enable both English and Dutch

</dd>




<dt>
Default
</dt>
<dd>

_`"en"`_

</dd>




</dl>

---


#### `cSpell.languageSettings`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.languageSettings`

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

Additional settings for individual programming languages and locales.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.noSuggestDictionaries`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.noSuggestDictionaries`

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

Optional list of dictionaries that will not be used for suggestions.
Words in these dictionaries are considered correct, but will not be
used when making spell correction suggestions.

Note: if a word is suggested by another dictionary, but found in
one of these dictionaries, it will be removed from the set of
possible suggestions.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.suggestWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.suggestWords`

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
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.useLocallyInstalledCSpellDictionaries`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.useLocallyInstalledCSpellDictionaries`

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

Search for `@cspell/cspell-bundled-dicts` in the workspace folder and use it if found.

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


#### `cSpell.userWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.userWords`

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

Words to add to global dictionary -- should only be in the user config file.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.words`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.words`

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

List of words to be considered correct.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---




## Reporting and Display


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.autoFormatConfigFile`](#cspellautoformatconfigfile) | window | Auto Format Configuration File |
| [`cSpell.diagnosticLevel`](#cspelldiagnosticlevel) | resource | Set Diagnostic Reporting Level |
| [`cSpell.diagnosticLevelFlaggedWords`](#cspelldiagnosticlevelflaggedwords) | resource | Set Diagnostic Reporting Level for Flagged Words |
| [`cSpell.hideAddToDictionaryCodeActions`](#cspellhideaddtodictionarycodeactions) | resource | Hide the options to add words to dictionaries or settings. |
| [`cSpell.hideIssuesWhileTyping`](#cspellhideissueswhiletyping) | application | Hide Issues While Typing |
| [`cSpell.maxDuplicateProblems`](#cspellmaxduplicateproblems) | resource | The maximum number of times the same word can be flagged as an error in a file. |
| [`cSpell.maxNumberOfProblems`](#cspellmaxnumberofproblems) | resource | Controls the maximum number of spelling errors per document. |
| [`cSpell.minWordLength`](#cspellminwordlength) | resource | The minimum length of a word before checking it against a dictionary. |
| [`cSpell.numSuggestions`](#cspellnumsuggestions) | resource | Controls the number of suggestions shown. |
| [`cSpell.revealIssuesAfterDelayMS`](#cspellrevealissuesafterdelayms) | application | Reveal Issues After a Delay in Milliseconds |
| [`cSpell.showAutocompleteDirectiveSuggestions`](#cspellshowautocompletedirectivesuggestions) | language-overridable | Show CSpell in-document directives as you type. |
| [`cSpell.showCommandsInEditorContextMenu`](#cspellshowcommandsineditorcontextmenu) | application | Show Spell Checker actions in Editor Context Menu |
| [`cSpell.showSuggestionsLinkInEditorContextMenu`](#cspellshowsuggestionslinkineditorcontextmenu) | application | Show Spelling Suggestions link in the top level context menu. |
| [`cSpell.suggestionMenuType`](#cspellsuggestionmenutype) | resource | The type of menu used to display spelling suggestions. |
| [`cSpell.suggestionNumChanges`](#cspellsuggestionnumchanges) | resource | The maximum number of changes allowed on a word to be considered a suggestions. |
| [`cSpell.validateDirectives`](#cspellvalidatedirectives) | window | Verify that the in-document directives are correct. |


### Definitions


#### `cSpell.autoFormatConfigFile`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.autoFormatConfigFile` -- Auto Format Configuration File

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

window

</dd>


<dt>
Description
</dt>
<dd>

If a `cspell` configuration file is updated, format the configuration file
using the VS Code Format Document Provider. This will cause the configuration
file to be saved prior to being updated.

</dd>




<dt>
Default
</dt>
<dd>

_`false`_

</dd>




</dl>

---


#### `cSpell.diagnosticLevel`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.diagnosticLevel` -- Set Diagnostic Reporting Level

</dd>


<dt>
Type
</dt>
<dd>

`( "Error" | "Warning" | "Information" | "Hint" )`
| Value | Description |
| ----- | ----------- |
| `Error` | Report Spelling Issues as Errors |
| `Warning` | Report Spelling Issues as Warnings |
| `Information` | Report Spelling Issues as Information |
| `Hint` | Report Spelling Issues as Hints, will not show up in Problems |


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

The Diagnostic Severity Level determines how issues are shown in the Problems Pane and within the document.
Set the level to `Hint` to hide the issues from the Problems Pane. Use the [`cSpell.useCustomDecorations`](#cspellusecustomdecorations)
to control how issues are displayed in the document.

See: [VS Code Diagnostic Severity Level](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity)

</dd>




<dt>
Default
</dt>
<dd>

_`"Information"`_

</dd>




</dl>

---


#### `cSpell.diagnosticLevelFlaggedWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.diagnosticLevelFlaggedWords` -- Set Diagnostic Reporting Level for Flagged Words

</dd>


<dt>
Type
</dt>
<dd>

`( "Error" | "Warning" | "Information" | "Hint" )`
| Value | Description |
| ----- | ----------- |
| `Error` | Report Spelling Issues as Errors |
| `Warning` | Report Spelling Issues as Warnings |
| `Information` | Report Spelling Issues as Information |
| `Hint` | Report Spelling Issues as Hints, will not show up in Problems |


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

Flagged word issues found by the spell checker are marked with a Diagnostic Severity Level. This affects the color of the squiggle.
By default, flagged words will use the same diagnostic level as general issues. Use this setting to customize them.

See: [VS Code Diagnostic Severity Level](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity)

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.hideAddToDictionaryCodeActions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.hideAddToDictionaryCodeActions`

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

Hide the options to add words to dictionaries or settings.

</dd>




<dt>
Default
</dt>
<dd>

_`false`_

</dd>




</dl>

---


#### `cSpell.hideIssuesWhileTyping`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.hideIssuesWhileTyping` -- Hide Issues While Typing

</dd>


<dt>
Type
</dt>
<dd>

`( "Off" | "Word" | "Line" | "Document" )`
| Value | Description |
| ----- | ----------- |
| `Off` | Show issues while typing |
| `Word` | Hide issues while typing in the current word |
| `Line` | Hide issues while typing on the line |
| `Document` | Hide all issues while typing in the document |


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

Control how spelling issues are displayed while typing.
See: [`cSpell.revealIssuesAfterMS`](#cspellrevealissuesafterms) to control when issues are revealed.

</dd>




<dt>
Default
</dt>
<dd>

_`"Word"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.maxDuplicateProblems`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.maxDuplicateProblems`

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

resource

</dd>


<dt>
Description
</dt>
<dd>

The maximum number of times the same word can be flagged as an error in a file.

</dd>




<dt>
Default
</dt>
<dd>

_`20`_

</dd>




</dl>

---


#### `cSpell.maxNumberOfProblems`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.maxNumberOfProblems`

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

resource

</dd>


<dt>
Description
</dt>
<dd>

Controls the maximum number of spelling errors per document.

</dd>




<dt>
Default
</dt>
<dd>

_`100`_

</dd>




</dl>

---


#### `cSpell.minWordLength`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.minWordLength`

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

resource

</dd>


<dt>
Description
</dt>
<dd>

The minimum length of a word before checking it against a dictionary.

</dd>




<dt>
Default
</dt>
<dd>

_`4`_

</dd>




</dl>

---


#### `cSpell.numSuggestions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.numSuggestions`

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

resource

</dd>


<dt>
Description
</dt>
<dd>

Controls the number of suggestions shown.

</dd>




<dt>
Default
</dt>
<dd>

_`8`_

</dd>




</dl>

---


#### `cSpell.revealIssuesAfterDelayMS`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.revealIssuesAfterDelayMS` -- Reveal Issues After a Delay in Milliseconds

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

application

</dd>


<dt>
Description
</dt>
<dd>

Reveal hidden issues related to [`cSpell.hideIssuesWhileTyping`](#cspellhideissueswhiletyping) after a delay in milliseconds.

</dd>




<dt>
Default
</dt>
<dd>

_`1500`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.showAutocompleteDirectiveSuggestions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.showAutocompleteDirectiveSuggestions`

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

language-overridable

</dd>


<dt>
Description
</dt>
<dd>

Show CSpell in-document directives as you type.

**Note:** VS Code must be restarted for this setting to take effect.

</dd>




<dt>
Default
</dt>
<dd>

_`true`_

</dd>




</dl>

---


#### `cSpell.showCommandsInEditorContextMenu`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.showCommandsInEditorContextMenu`

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

Show Spell Checker actions in Editor Context Menu

</dd>




<dt>
Default
</dt>
<dd>

_`true`_

</dd>




</dl>

---


#### `cSpell.showSuggestionsLinkInEditorContextMenu`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.showSuggestionsLinkInEditorContextMenu`

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

Show Spelling Suggestions link in the top level context menu.

</dd>




<dt>
Default
</dt>
<dd>

_`true`_

</dd>




</dl>

---


#### `cSpell.suggestionMenuType`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.suggestionMenuType`

</dd>


<dt>
Type
</dt>
<dd>

`( "quickPick" | "quickFix" )`
| Value | Description |
| ----- | ----------- |
| `quickPick` | Suggestions will appear as a drop down at the top of the IDE. (Best choice for Vim Key Bindings) |
| `quickFix` | Suggestions will appear inline near the word, inside the text editor. |


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

The type of menu used to display spelling suggestions.

</dd>




<dt>
Default
</dt>
<dd>

_`"quickPick"`_

</dd>




</dl>

---


#### `cSpell.suggestionNumChanges`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.suggestionNumChanges`

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

resource

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
Default
</dt>
<dd>

_`3`_

</dd>




</dl>

---


#### `cSpell.validateDirectives`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.validateDirectives`

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

window

</dd>


<dt>
Description
</dt>
<dd>

Verify that the in-document directives are correct.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### ~~`cSpell.showStatus`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.showStatus`~~

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

Display the spell checker status on the status bar.

</dd>


<dt>
Deprecation Message
</dt>
<dd>

No longer used.

</dd>


<dt>
Default
</dt>
<dd>

_`true`_

</dd>




</dl>

---


#### ~~`cSpell.showStatusAlignment`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.showStatusAlignment`~~

</dd>


<dt>
Type
</dt>
<dd>

`( "Left" | "Right" )`
| Value | Description |
| ----- | ----------- |
| `Left` | Left Side of Statusbar |
| `Right` | Right Side of Statusbar |


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

The side of the status bar to display the spell checker status.

</dd>


<dt>
Deprecation Message
</dt>
<dd>

No longer supported.

</dd>


<dt>
Default
</dt>
<dd>

_`"Right"`_

</dd>




</dl>

---




## Files, Folders, and Workspaces


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.checkOnlyEnabledFileTypes`](#cspellcheckonlyenabledfiletypes) | resource | Check Only Enabled File Types |
| [`cSpell.enabledFileTypes`](#cspellenabledfiletypes) | resource | Enabled File Types to Check |
| [`cSpell.enabledSchemes`](#cspellenabledschemes) | window | Specify Allowed Schemes |
| [`cSpell.files`](#cspellfiles) | resource | Glob patterns of files to be checked. Glob patterns are relative to the `#cSpell.globRoot#`… |
| [`cSpell.globRoot`](#cspellglobroot) | resource | The root to use for glob patterns found in this configuration. Default: The current workspace… |
| [`cSpell.ignorePaths`](#cspellignorepaths) | resource | Glob patterns of files to be ignored |
| [`cSpell.import`](#cspellimport) | resource | Allows this configuration to inherit configuration for one or more other files. |
| [`cSpell.mergeCSpellSettings`](#cspellmergecspellsettings) | resource | Specify if fields from `.vscode/settings.json` are passed to the spell checker. This only applies… |
| [`cSpell.mergeCSpellSettingsFields`](#cspellmergecspellsettingsfields) | resource | Specify which fields from `.vscode/settings.json` are passed to the spell checker. This only… |
| [`cSpell.noConfigSearch`](#cspellnoconfigsearch) | resource | Prevents searching for local configuration when checking individual documents. |
| [`cSpell.spellCheckOnlyWorkspaceFiles`](#cspellspellcheckonlyworkspacefiles) | window | Spell Check Only Workspace Files |
| [`cSpell.useGitignore`](#cspellusegitignore) | resource | Tells the spell checker to load `.gitignore` files and skip files that match the globs in the… |
| [`cSpell.usePnP`](#cspellusepnp) | resource | Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading packages stored in… |
| [`cSpell.workspaceRootPath`](#cspellworkspacerootpath) | resource | Workspace Root Folder Path |


### Definitions


#### `cSpell.checkOnlyEnabledFileTypes`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.checkOnlyEnabledFileTypes` -- Check Only Enabled File Types

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

By default, the spell checker checks only enabled file types. Use [`cSpell.enableFiletypes`](#cspellenablefiletypes)
to turn on / off various file types.

When this setting is `false`, all file types are checked except for the ones disabled by [`cSpell.enabledFileTypes`](#cspellenabledfiletypes).
See [`cSpell.enableFiletypes`](#cspellenablefiletypes) on how to disable a file type.

</dd>




<dt>
Default
</dt>
<dd>

_`true`_

</dd>




</dl>

---


#### `cSpell.enabledFileTypes`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.enabledFileTypes` -- Enabled File Types to Check

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

resource

</dd>


<dt>
Description
</dt>
<dd>

Enable / Disable checking file types (languageIds).

This setting replaces: [`cSpell.enabledLanguageIds`](#cspellenabledlanguageids) and [`cSpell.enableFiletypes`](#cspellenablefiletypes).

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
Default
</dt>
<dd>


```json5
{
"asciidoc": true, "bat": true, "c": true, "clojure": true, "coffeescript":
true, "cpp": true, "csharp": true, "css": true, "dart": true, "diff": true,
"dockerfile": true, "elixir": true, "erlang": true, "fsharp": true,
"git-commit": true, "git-rebase": true, "github-actions-workflow": true, "go":
true, "graphql": true, "groovy": true, "handlebars": true, "haskell": true,
"html": true, "ini": true, "jade": true, "java": true, "javascript": true,
"javascriptreact": true, "json": true, "jsonc": true, "julia": true, "jupyter":
true, "latex": true, "less": true, "lua": true, "makefile": true, "markdown":
true, "objective-c": true, "perl": true, "perl6": true, "php": true,
"plaintext": true, "powershell": true, "properties": true, "pug": true,
"python": true, "r": true, "razor": true, "restructuredtext": true, "ruby":
true, "rust": true, "scala": true, "scminput": true, "scss": true, "shaderlab":
true, "shellscript": true, "sql": true, "swift": true, "text": true,
"typescript": true, "typescriptreact": true, "vb": true, "vue": true, "xml":
true, "xsl": true, "yaml": true
}
```


</dd>




</dl>

---


#### `cSpell.enabledSchemes`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.enabledSchemes` -- Specify Allowed Schemes

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

window

</dd>


<dt>
Description
</dt>
<dd>

Control which file schemes will be checked for spelling (VS Code must be restarted for this setting to take effect).


Some schemes have special meaning like:
- `untitled` - Used for new documents that have not yet been saved
- `vscode-notebook-cell` - Used for validating segments of a Notebook.
- `vscode-userdata` - Needed to spell check `.code-snippets`
- `vscode-scm` - Needed to spell check Source Control commit messages.
- `comment` - Used for new comment editors.

</dd>




<dt>
Default
</dt>
<dd>


```json5
{
"comment": true, "file": true, "gist": true, "repo": true, "sftp": true,
"untitled": true, "vscode-notebook-cell": true, "vscode-scm": true,
"vscode-userdata": true, "vscode-vfs": true, "vsls": true
}
```


</dd>




</dl>

---


#### `cSpell.files`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.files`

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

Glob patterns of files to be checked.
Glob patterns are relative to the [`cSpell.globRoot`](#cspellglobroot) of the configuration file that defines them.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.globRoot`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.globRoot`

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

resource

</dd>


<dt>
Description
</dt>
<dd>

The root to use for glob patterns found in this configuration.
Default: The current workspace folder.
Use `globRoot` to define a different location. `globRoot` can be relative to the location of this configuration file.
Defining globRoot, does not impact imported configurations.

Special Values:

- `${workspaceFolder}` - Default - globs will be relative to the current workspace folder
- `${workspaceFolder:<name>}` - Where `<name>` is the name of the workspace folder.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.ignorePaths`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.ignorePaths` -- Glob patterns of files to be ignored

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

Glob patterns of files to be ignored. The patterns are relative to the [`cSpell.globRoot`](#cspellglobroot) of the configuration file that defines them.

</dd>




<dt>
Default
</dt>
<dd>


```json5
[
"package-lock.json", "node_modules", "vscode-extension",
".git/{info,lfs,logs,refs,objects}/**", ".git/{index,*refs,*HEAD}", ".vscode",
".vscode-insiders"
]
```


</dd>




</dl>

---


#### `cSpell.import`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.import`

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

Allows this configuration to inherit configuration for one or more other files.

See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.mergeCSpellSettings`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.mergeCSpellSettings`

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

Specify if fields from `.vscode/settings.json` are passed to the spell checker.
This only applies when there is a CSpell configuration file in the workspace.

The purpose of this setting to help provide a consistent result compared to the
CSpell spell checker command line tool.

Values:
- `true` - all settings will be merged based upon [`cSpell.mergeCSpellSettingsFields`](#cspellmergecspellsettingsfields).
- `false` - only use `.vscode/settings.json` if a CSpell configuration is not found.

Note: this setting is used in conjunction with [`cSpell.mergeCSpellSettingsFields`](#cspellmergecspellsettingsfields).

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


#### `cSpell.mergeCSpellSettingsFields`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.mergeCSpellSettingsFields`

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

resource

</dd>


<dt>
Description
</dt>
<dd>

Specify which fields from `.vscode/settings.json` are passed to the spell checker.
This only applies when there is a CSpell configuration file in the workspace and
[`cSpell.mergeCSpellSettings`](#cspellmergecspellsettings) is `true`.

Values:
- `{ flagWords: true, userWords: false }` - Always allow `flagWords`, but never allow `userWords`.

Example:
```json5
"cSpell.mergeCSpellSettingsFields": { "userWords": false }
```

</dd>




<dt>
Default
</dt>
<dd>


```json5
{
"allowCompoundWords": true, "caseSensitive": true, "dictionaries": true,
"dictionaryDefinitions": true, "enableGlobDot": true, "features": true,
"files": true, "flagWords": true, "gitignoreRoot": true, "globRoot": true,
"ignorePaths": true, "ignoreRegExpList": true, "ignoreWords": true, "import":
true, "includeRegExpList": true, "language": true, "languageId": true,
"languageSettings": true, "loadDefaultConfiguration": true, "minWordLength":
true, "noConfigSearch": true, "noSuggestDictionaries": true, "numSuggestions":
true, "overrides": true, "patterns": true, "pnpFiles": true, "reporters": true,
"suggestWords": true, "useGitignore": true, "usePnP": true, "userWords": true,
"validateDirectives": true, "words": true
}
```


</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.noConfigSearch`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.noConfigSearch`

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

Prevents searching for local configuration when checking individual documents.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.spellCheckOnlyWorkspaceFiles`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.spellCheckOnlyWorkspaceFiles` -- Spell Check Only Workspace Files

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

window

</dd>


<dt>
Description
</dt>
<dd>

Only spell check files that are in the currently open workspace.
This same effect can be achieved using the [`cSpell.files`](#cspellfiles) setting.


```js
"cSpell.files": ["/**"]
```

</dd>




<dt>
Default
</dt>
<dd>

_`false`_

</dd>




</dl>

---


#### `cSpell.useGitignore`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.useGitignore`

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

Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.

</dd>




<dt>
Default
</dt>
<dd>

_`true`_

</dd>




</dl>

---


#### `cSpell.usePnP`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.usePnP`

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

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.workspaceRootPath`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.workspaceRootPath` -- Workspace Root Folder Path

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

resource

</dd>


<dt>
Description
</dt>
<dd>

Define the path to the workspace root folder in a multi-root workspace.
By default it is the first folder.

This is used to find the `cspell.json` file for the workspace.


**Example: use the `client` folder**
```
${workspaceFolder:client}
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


#### ~~`cSpell.allowedSchemas`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.allowedSchemas`~~ -- Define Allowed Schemes

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

window

</dd>


<dt>
Description
</dt>
<dd>

Control which file schemes will be checked for spelling (VS Code must be restarted for this setting to take effect).


Some schemes have special meaning like:
- `untitled` - Used for new documents that have not yet been saved
- `vscode-notebook-cell` - Used for validating segments of a Notebook.
- `vscode-userdata` - Needed to spell check `.code-snippets`
- `vscode-scm` - Needed to spell check Source Control commit messages.
- `comment` - Used for new comment editors.

</dd>


<dt>
Deprecation Message
</dt>
<dd>

- Use `#cSpell.enabledSchemes#` instead.

</dd>


<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### ~~`cSpell.enableFiletypes`~~

<dl>

<dt>
Name
</dt>
<dd>

~~`cSpell.enableFiletypes`~~ -- Enable File Types

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

Enable / Disable checking file types (languageIds).

These are in additional to the file types specified by [`cSpell.enabledLanguageIds`](#cspellenabledlanguageids).
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




## Performance


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`](#cspellblockcheckingwhenaveragechunksizegreaterthan) | language-overridable | The maximum average length of chunks of text without word breaks. |
| [`cSpell.blockCheckingWhenLineLengthGreaterThan`](#cspellblockcheckingwhenlinelengthgreaterthan) | language-overridable | The maximum line length. |
| [`cSpell.blockCheckingWhenTextChunkSizeGreaterThan`](#cspellblockcheckingwhentextchunksizegreaterthan) | language-overridable | The maximum length of a chunk of text without word breaks. |
| [`cSpell.checkLimit`](#cspellchecklimit) | resource | Set the maximum number of bocks of text to check. Each block is 1024 characters. |
| [`cSpell.spellCheckDelayMs`](#cspellspellcheckdelayms) | application | Delay in ms after a document has changed before checking it for spelling errors. |
| [`cSpell.suggestionsTimeout`](#cspellsuggestionstimeout) | resource | The maximum amount of time in milliseconds to generate suggestions for a word. |


### Definitions


#### `cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`

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

language-overridable

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
Default
</dt>
<dd>

_`80`_

</dd>




</dl>

---


#### `cSpell.blockCheckingWhenLineLengthGreaterThan`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.blockCheckingWhenLineLengthGreaterThan`

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

language-overridable

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
Default
</dt>
<dd>

_`10000`_

</dd>




</dl>

---


#### `cSpell.blockCheckingWhenTextChunkSizeGreaterThan`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.blockCheckingWhenTextChunkSizeGreaterThan`

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

language-overridable

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
Default
</dt>
<dd>

_`500`_

</dd>




</dl>

---


#### `cSpell.checkLimit`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.checkLimit`

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

resource

</dd>


<dt>
Description
</dt>
<dd>

Set the maximum number of bocks of text to check.
Each block is 1024 characters.

</dd>




<dt>
Default
</dt>
<dd>

_`500`_

</dd>




</dl>

---


#### `cSpell.spellCheckDelayMs`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.spellCheckDelayMs`

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

application

</dd>


<dt>
Description
</dt>
<dd>

Delay in ms after a document has changed before checking it for spelling errors.

</dd>




<dt>
Default
</dt>
<dd>

_`50`_

</dd>




</dl>

---


#### `cSpell.suggestionsTimeout`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.suggestionsTimeout`

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

resource

</dd>


<dt>
Description
</dt>
<dd>

The maximum amount of time in milliseconds to generate suggestions for a word.

</dd>




<dt>
Default
</dt>
<dd>

_`400`_

</dd>




</dl>

---




## CSpell


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.experimental.symbols`](#cspellexperimentalsymbols) | application | Experiment with `executeDocumentSymbolProvider` |
| [`cSpell.ignoreRegExpList`](#cspellignoreregexplist) | resource | List of regular expressions or Pattern names (defined in `#cSpell.patterns#`) to exclude from… |
| [`cSpell.includeRegExpList`](#cspellincluderegexplist) | resource | List of regular expression patterns or defined pattern names to match for spell checking. |
| [`cSpell.overrides`](#cspelloverrides) | resource | Overrides are used to apply settings for specific files in your project. |
| [`cSpell.patterns`](#cspellpatterns) | resource | Defines a list of patterns that can be used with the `#cSpell.ignoreRegExpList#` and `#cSpell.includeRegExpList#`… |


### Definitions


#### `cSpell.experimental.symbols`

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


#### `cSpell.ignoreRegExpList`

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


#### `cSpell.includeRegExpList`

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


#### `cSpell.overrides`

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


#### `cSpell.patterns`

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




## Appearance


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.dark`](#cspelldark) | application | Decoration for dark themes. |
| [`cSpell.doNotUseCustomDecorationForScheme`](#cspelldonotusecustomdecorationforscheme) | application | Use VS Code to Render Spelling Issues |
| [`cSpell.light`](#cspelllight) | application | Decoration for light themes. |
| [`cSpell.overviewRulerColor`](#cspelloverviewrulercolor) | application | The CSS color used to show issues in the ruler. |
| [`cSpell.textDecoration`](#cspelltextdecoration) | application | The CSS Style used to decorate spelling issues. Depends upon `#cSpell.useCustomDecorations#`. |
| [`cSpell.textDecorationColor`](#cspelltextdecorationcolor) | application | The decoration color for normal spelling issues. |
| [`cSpell.textDecorationColorFlagged`](#cspelltextdecorationcolorflagged) | application | The decoration color for flagged issues. |
| [`cSpell.textDecorationColorSuggestion`](#cspelltextdecorationcolorsuggestion) | application | The decoration color for spelling suggestions. |
| [`cSpell.textDecorationLine`](#cspelltextdecorationline) | application | The CSS line type used to decorate issues. |
| [`cSpell.textDecorationStyle`](#cspelltextdecorationstyle) | application | The CSS line style used to decorate issues. |
| [`cSpell.textDecorationThickness`](#cspelltextdecorationthickness) | application | The CSS line thickness used to decorate issues. |
| [`cSpell.useCustomDecorations`](#cspellusecustomdecorations) | application | Draw custom decorations on Spelling Issues. |


### Definitions


#### `cSpell.dark`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.dark`

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

application

</dd>


<dt>
Description
</dt>
<dd>

Decoration for dark themes.

See:
- [`cSpell.overviewRulerColor`](#cspelloverviewrulercolor)
- [`cSpell.textDecoration`](#cspelltextdecoration)

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.doNotUseCustomDecorationForScheme`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.doNotUseCustomDecorationForScheme` -- Use VS Code to Render Spelling Issues

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

application

</dd>


<dt>
Description
</dt>
<dd>

Use the VS Code Diagnostic Collection to render spelling issues.

With some edit boxes, like the source control message box, the custom decorations do not show up.
This setting allows the use of the VS Code Diagnostic Collection to render spelling issues.

</dd>




<dt>
Default
</dt>
<dd>

_`{"vscode-scm":true}`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.light`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.light`

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

application

</dd>


<dt>
Description
</dt>
<dd>

Decoration for light themes.

See:
- [`cSpell.overviewRulerColor`](#cspelloverviewrulercolor)
- [`cSpell.textDecoration`](#cspelltextdecoration)

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.overviewRulerColor`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.overviewRulerColor`

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

application

</dd>


<dt>
Description
</dt>
<dd>

The CSS color used to show issues in the ruler.

See:
- [`<color>` CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)
- [CSS Colors, W3C Schools](https://www.w3schools.com/cssref/css_colors.php)
- Hex colors
- Use "" (empty string) to disable.

Examples:
- `green`
- `DarkYellow`
- `#ffff0080` - semi-transparent yellow.
- `rgb(255 153 0 / 80%)`

</dd>




<dt>
Default
</dt>
<dd>

_`"#fc4c"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.textDecoration`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecoration`

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

application

</dd>


<dt>
Description
</dt>
<dd>

The CSS Style used to decorate spelling issues. Depends upon [`cSpell.useCustomDecorations`](#cspellusecustomdecorations).

This setting is used to manually configure the text decoration. If it is not set, the following settings are used:
- [`cSpell.textDecorationLine`](#cspelltextdecorationline) to pick the line type
- [`cSpell.textDecorationStyle`](#cspelltextdecorationstyle) to pick the style
- [`cSpell.textDecorationColor`](#cspelltextdecorationcolor) to set the color
- [`cSpell.textDecorationThickness`](#cspelltextdecorationthickness) to set the thickness.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)

Format:  `<line> [style] <color> [thickness]`

- line - `underline`, `overline`, see: [text-decoration-line, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)
- style - `solid`, `wavy`, `dotted`, see: [text-decoration-style, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)
- thickness - see: [text-decoration-thickness, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness)

Examples:
- `underline green`
- `underline dotted yellow 0.2rem`
- `underline wavy #ff0c 1.5px` - Wavy underline with 1.5px thickness in semi-transparent yellow.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.textDecorationColor`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationColor`

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

application

</dd>


<dt>
Description
</dt>
<dd>

The decoration color for normal spelling issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

Examples:
- `green`
- `yellow`
- `#ff0c`

</dd>




<dt>
Default
</dt>
<dd>

_`"#fc4"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.textDecorationColorFlagged`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationColorFlagged`

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

application

</dd>


<dt>
Description
</dt>
<dd>

The decoration color for flagged issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

Examples:
- `green`
- `yellow`
- `#ff0c`

</dd>




<dt>
Default
</dt>
<dd>

_`"#f44"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.textDecorationColorSuggestion`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationColorSuggestion`

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

application

</dd>


<dt>
Description
</dt>
<dd>

The decoration color for spelling suggestions.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

Common Format: `#RGBA` or `#RRGGBBAA` or `#RGB` or `#RRGGBB`

Examples:
- `green`
- `yellow`
- `#ff0c`

</dd>




<dt>
Default
</dt>
<dd>

_`"#8884"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.2

</dd>


</dl>

---


#### `cSpell.textDecorationLine`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationLine`

</dd>


<dt>
Type
</dt>
<dd>

`( "underline" | "overline" | "line-through" )`

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

The CSS line type used to decorate issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- line - `underline`, `overline`, see: [text-decoration-line, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)

</dd>




<dt>
Default
</dt>
<dd>

_`"underline"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.textDecorationStyle`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationStyle`

</dd>


<dt>
Type
</dt>
<dd>

`( "solid" | "wavy" | "dotted" | "dashed" | "double" )`

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

The CSS line style used to decorate issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- style - `solid`, `wavy`, `dotted`, see: [text-decoration-style, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)

</dd>




<dt>
Default
</dt>
<dd>

_`"wavy"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.textDecorationThickness`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.textDecorationThickness`

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

application

</dd>


<dt>
Description
</dt>
<dd>

The CSS line thickness used to decorate issues.

See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
- thickness - see: [text-decoration-thickness, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness)

Examples:
- `auto`
- `from-font`
- `0.2rem`
- `1.5px`
- `10%`

</dd>




<dt>
Default
</dt>
<dd>

_`"auto"`_

</dd>


<dt>
Since Version
</dt>
<dd>

4.0.0

</dd>


</dl>

---


#### `cSpell.useCustomDecorations`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.useCustomDecorations`

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

Draw custom decorations on Spelling Issues.
- `true` - Use custom decorations.
- `false` - Use the VS Code Diagnostic Collection to render spelling issues.

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




## Advanced


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.advanced.feature.useReferenceProviderRemove`](#cspelladvancedfeatureusereferenceproviderremove) | language-overridable | Remove Matching Characters Before Rename |
| [`cSpell.advanced.feature.useReferenceProviderWithRename`](#cspelladvancedfeatureusereferenceproviderwithrename) | language-overridable | Use Reference Provider During Rename |
| [`cSpell.fixSpellingWithRenameProvider`](#cspellfixspellingwithrenameprovider) | language-overridable | Use Rename Provider when fixing spelling issues. |
| [`cSpell.logFile`](#cspelllogfile) | window | Write Logs to a File |
| [`cSpell.logLevel`](#cspellloglevel) | window | Set Logging Level |
| [`cSpell.trustedWorkspace`](#cspelltrustedworkspace) | window | Enable loading JavaScript CSpell configuration files. |


### Definitions


#### `cSpell.advanced.feature.useReferenceProviderRemove`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.advanced.feature.useReferenceProviderRemove` -- Remove Matching Characters Before Rename

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

language-overridable

</dd>


<dt>
Description
</dt>
<dd>

Used to work around bugs in Reference Providers and Rename Providers.
Anything matching the provided Regular Expression will be removed from the text
before sending it to the Rename Provider.

See: [Markdown: Fixing spelling issues in Header sections changes the entire line · Issue #1987](https://github.com/streetsidesoftware/vscode-spell-checker/issues/1987)

It is unlikely that you would need to edit this setting. If you need to, please open an issue at
[Spell Checker Issues](https://github.com/streetsidesoftware/vscode-spell-checker/issues)

This feature is used in connection with [`cSpell.advanced.feature.useReferenceProviderWithRename`](#cspelladvancedfeatureusereferenceproviderwithrename)

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.advanced.feature.useReferenceProviderWithRename`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.advanced.feature.useReferenceProviderWithRename` -- Use Reference Provider During Rename

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

language-overridable

</dd>


<dt>
Description
</dt>
<dd>

Use the Reference Provider when fixing spelling issues with the Rename Provider.
This feature is used in connection with [`cSpell.fixSpellingWithRenameProvider`](#cspellfixspellingwithrenameprovider)

</dd>




<dt>
Default
</dt>
<dd>

_`false`_

</dd>




</dl>

---


#### `cSpell.fixSpellingWithRenameProvider`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.fixSpellingWithRenameProvider`

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

language-overridable

</dd>


<dt>
Description
</dt>
<dd>

Use Rename Provider when fixing spelling issues.

</dd>




<dt>
Default
</dt>
<dd>

_`true`_

</dd>




</dl>

---


#### `cSpell.logFile`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.logFile` -- Write Logs to a File

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

window

</dd>


<dt>
Description
</dt>
<dd>

Have the logs written to a file instead of to VS Code.

</dd>




<dt>
Default
</dt>
<dd>

_- none -_

</dd>




</dl>

---


#### `cSpell.logLevel`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.logLevel` -- Set Logging Level

</dd>


<dt>
Type
</dt>
<dd>

`( "None" | "Error" | "Warning" | "Information" | "Debug" )`
| Value | Description |
| ----- | ----------- |
| `None` | Do not log |
| `Error` | Log only errors |
| `Warning` | Log errors and warnings |
| `Information` | Log errors, warnings, and info |
| `Debug` | Log everything (noisy) |


</dd>


<dt>
Scope
</dt>
<dd>

window

</dd>


<dt>
Description
</dt>
<dd>

Set the Debug Level for logging messages.

</dd>




<dt>
Default
</dt>
<dd>

_`"Error"`_

</dd>




</dl>

---


#### `cSpell.trustedWorkspace`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.trustedWorkspace`

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

window

</dd>


<dt>
Description
</dt>
<dd>

Enable loading JavaScript CSpell configuration files.

This setting is automatically set to `true` in a trusted workspace. It is possible to override the setting to `false` in a trusted workspace,
but a setting of `true` in an untrusted workspace will be ignored.

See:
- [Visual Studio Code Workspace Trust security](https://code.visualstudio.com/docs/editor/workspace-trust)
- [Workspace Trust Extension Guide -- Visual Studio Code Extension API](https://code.visualstudio.com/api/extension-guides/workspace-trust)

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




## Experimental


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.experimental.enableRegexpView`](#cspellexperimentalenableregexpview) | application | Show Regular Expression Explorer |
| [`cSpell.experimental.enableSettingsViewerV2`](#cspellexperimentalenablesettingsviewerv2) | application | Enable the Settings Viewer V2 Extension |
| [`cSpell.reportUnknownWords`](#cspellreportunknownwords) | language-overridable | Strict Spell Checking |


### Definitions


#### `cSpell.experimental.enableRegexpView`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.experimental.enableRegexpView`

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

Show Regular Expression Explorer

</dd>




<dt>
Default
</dt>
<dd>

_`false`_

</dd>




</dl>

---


#### `cSpell.experimental.enableSettingsViewerV2`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.experimental.enableSettingsViewerV2`

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

Enable the Settings Viewer V2 Extension

</dd>




<dt>
Default
</dt>
<dd>

_`false`_

</dd>




</dl>

---


#### `cSpell.reportUnknownWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.reportUnknownWords` -- Strict Spell Checking

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

language-overridable

</dd>


<dt>
Description
</dt>
<dd>

By default, the spell checker reports all unknown words as misspelled. This setting allows for a more relaxed spell checking, by only
reporting unknown words as suggestions. Common spelling errors are still flagged as misspelled.

- `true` - report unknown words as misspelled
- `false` - report unknown words as suggestions

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

4.0.2

</dd>


</dl>

---




## Legacy


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.allowCompoundWords`](#cspellallowcompoundwords) | resource | Enable / Disable allowing word compounds. |


### Definitions


#### `cSpell.allowCompoundWords`

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


#### ~~`cSpell.customFolderDictionaries`~~

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


#### ~~`cSpell.customUserDictionaries`~~

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


#### ~~`cSpell.customWorkspaceDictionaries`~~

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


#### ~~`cSpell.enabledLanguageIds`~~

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





