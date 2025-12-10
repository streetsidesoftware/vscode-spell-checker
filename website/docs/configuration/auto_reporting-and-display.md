---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mjs`
title: Reporting and Display
id: reporting-and-display
---

# Reporting and Display

Settings that control how the spell checker reports and displays errors.


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.autocorrect`](#cspellautocorrect) | resource | Autocorrect |
| [`cSpell.autoFormatConfigFile`](#cspellautoformatconfigfile) | window | Auto Format Configuration File |
| [`cSpell.diagnosticLevel`](#cspelldiagnosticlevel) | resource | Set Diagnostic Reporting Level |
| [`cSpell.diagnosticLevelFlaggedWords`](#cspelldiagnosticlevelflaggedwords) | resource | Set Diagnostic Reporting Level for Flagged Words |
| [`cSpell.enabledNotifications`](#cspellenablednotifications) | resource | Enabled Notifications |
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


## Settings


### `cSpell.autocorrect`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.autocorrect` -- Autocorrect

</dd>

<dt>
Description
</dt>
<dd>

Enable / Disable autocorrect while typing.

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

_`false`_

</dd>

</dl>

---


### `cSpell.autoFormatConfigFile`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.autoFormatConfigFile` -- Auto Format Configuration File

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
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

window - Windows (instance) specific settings which can be configured in user, workspace, or remote settings.

</dd>

<dt>
Default
</dt>
<dd>

_`false`_

</dd>

</dl>

---


### `cSpell.diagnosticLevel`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.diagnosticLevel` -- Set Diagnostic Reporting Level

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

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"Information"`_

</dd>

</dl>

---


### `cSpell.diagnosticLevelFlaggedWords`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.diagnosticLevelFlaggedWords` -- Set Diagnostic Reporting Level for Flagged Words

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

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

---


### `cSpell.enabledNotifications`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.enabledNotifications` -- Enabled Notifications

</dd>

<dt>
Description
</dt>
<dd>

Control which notifications are displayed.

See:
- [`cSpell.blockCheckingWhenLineLengthGreaterThan`](performance#cspellblockcheckingwhenlinelengthgreaterthan)
- [`cSpell.blockCheckingWhenTextChunkSizeGreaterThan`](performance#cspellblockcheckingwhentextchunksizegreaterthan)
- [`cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`](performance#cspellblockcheckingwhenaveragechunksizegreaterthan)

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

```json5
{
"Average Word Length too Long": true, "Lines too Long": true,
"Maximum Word Length Exceeded": true
}
```

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.41

</dd>

</dl>

---


### `cSpell.hideAddToDictionaryCodeActions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.hideAddToDictionaryCodeActions`

</dd>

<dt>
Description
</dt>
<dd>

Hide the options to add words to dictionaries or settings.

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

_`false`_

</dd>

</dl>

---


### `cSpell.hideIssuesWhileTyping`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.hideIssuesWhileTyping` -- Hide Issues While Typing

</dd>

<dt>
Description
</dt>
<dd>

Control how spelling issues are displayed while typing.
See: [`cSpell.revealIssuesAfterDelayMS`](reporting-and-display#cspellrevealissuesafterdelayms) to control when issues are revealed.

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

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"Word"`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

---


### `cSpell.maxDuplicateProblems`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.maxDuplicateProblems`

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
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_`20`_

</dd>

</dl>

---


### `cSpell.maxNumberOfProblems`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.maxNumberOfProblems`

</dd>

<dt>
Description
</dt>
<dd>

Controls the maximum number of spelling errors per document.

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

_`100`_

</dd>

</dl>

---


### `cSpell.minWordLength`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.minWordLength`

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
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_`4`_

</dd>

</dl>

---


### `cSpell.numSuggestions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.numSuggestions`

</dd>

<dt>
Description
</dt>
<dd>

Controls the number of suggestions shown.

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

_`8`_

</dd>

</dl>

---


### `cSpell.revealIssuesAfterDelayMS`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.revealIssuesAfterDelayMS` -- Reveal Issues After a Delay in Milliseconds

</dd>

<dt>
Description
</dt>
<dd>

Reveal hidden issues related to [`cSpell.hideIssuesWhileTyping`](reporting-and-display#cspellhideissueswhiletyping) after a delay in milliseconds.

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

_`1500`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

---


### `cSpell.showAutocompleteDirectiveSuggestions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.showAutocompleteDirectiveSuggestions`

</dd>

<dt>
Description
</dt>
<dd>

Show CSpell in-document directives as you type.

**Note:** VS Code must be restarted for this setting to take effect.

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

language-overridable - Resource settings that can be overridable at a language level.

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

---


### `cSpell.showCommandsInEditorContextMenu`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.showCommandsInEditorContextMenu`

</dd>

<dt>
Description
</dt>
<dd>

Show Spell Checker actions in Editor Context Menu

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

_`true`_

</dd>

</dl>

---


### `cSpell.showSuggestionsLinkInEditorContextMenu`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.showSuggestionsLinkInEditorContextMenu`

</dd>

<dt>
Description
</dt>
<dd>

Show Spelling Suggestions link in the top level context menu.

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

_`true`_

</dd>

</dl>

---


### `cSpell.suggestionMenuType`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.suggestionMenuType`

</dd>

<dt>
Description
</dt>
<dd>

The type of menu used to display spelling suggestions.

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

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"quickPick"`_

</dd>

</dl>

---


### `cSpell.suggestionNumChanges`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.suggestionNumChanges`

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
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_`3`_

</dd>

</dl>

---


### `cSpell.validateDirectives`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.validateDirectives`

</dd>

<dt>
Description
</dt>
<dd>

Verify that the in-document directives are correct.

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

window - Windows (instance) specific settings which can be configured in user, workspace, or remote settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


