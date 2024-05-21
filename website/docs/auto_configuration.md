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
  <dt>Name</dt>
  <dd>
    `cSpell.enabled`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Enable / Disable the spell checker.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
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
| [`cSpell.userWords`](#cspelluserwords) | resource | Words to add to global dictionary -- should only be in the user config file. |
| [`cSpell.words`](#cspellwords) | resource | List of words to be considered correct. |


### Definitions


#### `cSpell.caseSensitive`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.caseSensitive`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Determines if words must match case and accent rules.

    - `false` - Case is ignored and accents can be missing on the entire word.
      Incorrect accents or partially missing accents will be marked as incorrect.
      Note: Some languages like Portuguese have case sensitivity turned on by default.
      You must use `#cSpell.languageSettings#` to turn it off.
    - `true` - Case and accents are enforced by default.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.customDictionaries`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.customDictionaries` -- Custom Dictionaries
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.dictionaries`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.dictionaries`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.dictionaryDefinitions`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.dictionaryDefinitions` -- Dictionary Definitions
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Define custom dictionaries..
    If `addWords` is `true` words will be added to this dictionary.

    This setting is subject to User/Workspace settings precedence rules: [Visual Studio Code User and Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings#_settings-precedence).

    It is better to use `#cSpell.customDictionaries#`

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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.flagWords`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.flagWords`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.ignoreWords`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.ignoreWords`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    A list of words to be ignored by the spell checker.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.language`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.language`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Current active spelling language.

    Example: "en-GB" for British English

    Example: "en,nl" to enable both English and Dutch
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"en"`_
  </dd>
</dl>



---


#### `cSpell.languageSettings`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.languageSettings`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Additional settings for individual programming languages and locales.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.noSuggestDictionaries`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.noSuggestDictionaries`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Optional list of dictionaries that will not be used for suggestions.
    Words in these dictionaries are considered correct, but will not be
    used when making spell correction suggestions.

    Note: if a word is suggested by another dictionary, but found in
    one of these dictionaries, it will be removed from the set of
    possible suggestions.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.suggestWords`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.suggestWords`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    _- none -_
  </dd>
</dl>

<dl>
  <dt>Description</dt>
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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.userWords`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.userWords`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Words to add to global dictionary -- should only be in the user config file.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.words`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.words`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    List of words to be considered correct.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
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
| [`cSpell.hideIssuesWhileTyping`](#cspellhideissueswhiletyping) | machine | Hide Issues While Typing |
| [`cSpell.maxDuplicateProblems`](#cspellmaxduplicateproblems) | resource | The maximum number of times the same word can be flagged as an error in a file. |
| [`cSpell.maxNumberOfProblems`](#cspellmaxnumberofproblems) | resource | Controls the maximum number of spelling errors per document. |
| [`cSpell.minWordLength`](#cspellminwordlength) | resource | The minimum length of a word before checking it against a dictionary. |
| [`cSpell.numSuggestions`](#cspellnumsuggestions) | resource | Controls the number of suggestions shown. |
| [`cSpell.revealIssuesAfterDelayMS`](#cspellrevealissuesafterdelayms) | machine | Reveal Issues After a Delay in Milliseconds |
| [`cSpell.showAutocompleteDirectiveSuggestions`](#cspellshowautocompletedirectivesuggestions) | language-overridable | Show CSpell in-document directives as you type. |
| [`cSpell.showCommandsInEditorContextMenu`](#cspellshowcommandsineditorcontextmenu) | application | Show Spell Checker actions in Editor Context Menu |
| [`cSpell.showStatus`](#cspellshowstatus) | application | Display the spell checker status on the status bar. |
| [`cSpell.showStatusAlignment`](#cspellshowstatusalignment) | application | The side of the status bar to display the spell checker status. |
| [`cSpell.showSuggestionsLinkInEditorContextMenu`](#cspellshowsuggestionslinkineditorcontextmenu) | application | Show Spelling Suggestions link in the top level context menu. |
| [`cSpell.suggestionMenuType`](#cspellsuggestionmenutype) | resource | The type of menu used to display spelling suggestions. |
| [`cSpell.suggestionNumChanges`](#cspellsuggestionnumchanges) | resource | The maximum number of changes allowed on a word to be considered a suggestions. |
| [`cSpell.validateDirectives`](#cspellvalidatedirectives) | window | Verify that the in-document directives are correct. |


### Definitions


#### `cSpell.autoFormatConfigFile`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.autoFormatConfigFile` -- Auto Format Configuration File
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    window
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    If a `cspell` configuration file is updated, format the configuration file
    using the VS Code Format Document Provider. This will cause the configuration
    file to be saved prior to being updated.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`false`_
  </dd>
</dl>



---


#### `cSpell.diagnosticLevel`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.diagnosticLevel` -- Set Diagnostic Reporting Level
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( "Error" | "Warning" | "Information" | "Hint" )`

    | `Error` | Report Spelling Issues as Errors |
    | `Warning` | Report Spelling Issues as Warnings |
    | `Information` | Report Spelling Issues as Information |
    | `Hint` | Report Spelling Issues as Hints, will not show up in Problems |

  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The Diagnostic Severity Level determines how issues are shown in the Problems Pane and within the document.
    Set the level to `Hint` to hide the issues from the Problems Pane. Use the `#cSpell.useCustomDecorations#`
    to control how issues are displayed in the document.

    See: [VS Code Diagnostic Severity Level](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity)
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"Information"`_
  </dd>
</dl>



---


#### `cSpell.diagnosticLevelFlaggedWords`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.diagnosticLevelFlaggedWords` -- Set Diagnostic Reporting Level for Flagged Words
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( "Error" | "Warning" | "Information" | "Hint" )`

    | `Error` | Report Spelling Issues as Errors |
    | `Warning` | Report Spelling Issues as Warnings |
    | `Information` | Report Spelling Issues as Information |
    | `Hint` | Report Spelling Issues as Hints, will not show up in Problems |

  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Flagged word issues found by the spell checker are marked with a Diagnostic Severity Level. This affects the color of the squiggle.
    By default, flagged words will use the same diagnostic level as general issues. Use this setting to customize them.

    See: [VS Code Diagnostic Severity Level](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity)
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.hideAddToDictionaryCodeActions`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.hideAddToDictionaryCodeActions`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Hide the options to add words to dictionaries or settings.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`false`_
  </dd>
</dl>



---


#### `cSpell.hideIssuesWhileTyping`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.hideIssuesWhileTyping` -- Hide Issues While Typing
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( "Off" | "Word" | "Line" | "Document" )`

    | `Off` | Show issues while typing |
    | `Word` | Hide issues while typing in the current word |
    | `Line` | Hide issues while typing on the line |
    | `Document` | Hide all issues while typing in the document |

  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Control how spelling issues are displayed while typing.
    See: `#cSpell.revealIssuesAfterMS#` to control when issues are revealed.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"Word"`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.maxDuplicateProblems`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.maxDuplicateProblems`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The maximum number of times the same word can be flagged as an error in a file.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`20`_
  </dd>
</dl>



---


#### `cSpell.maxNumberOfProblems`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.maxNumberOfProblems`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Controls the maximum number of spelling errors per document.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`100`_
  </dd>
</dl>



---


#### `cSpell.minWordLength`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.minWordLength`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The minimum length of a word before checking it against a dictionary.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`4`_
  </dd>
</dl>



---


#### `cSpell.numSuggestions`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.numSuggestions`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Controls the number of suggestions shown.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`8`_
  </dd>
</dl>



---


#### `cSpell.revealIssuesAfterDelayMS`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.revealIssuesAfterDelayMS` -- Reveal Issues After a Delay in Milliseconds
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Reveal hidden issues related to `#cSpell.hideIssuesWhileTyping#` after a delay in milliseconds.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`1500`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.showAutocompleteDirectiveSuggestions`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.showAutocompleteDirectiveSuggestions`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    language-overridable
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Show CSpell in-document directives as you type.

    **Note:** VS Code must be restarted for this setting to take effect.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>



---


#### `cSpell.showCommandsInEditorContextMenu`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.showCommandsInEditorContextMenu`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    application
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Show Spell Checker actions in Editor Context Menu
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>



---


#### `cSpell.showStatus`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.showStatus`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    application
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Display the spell checker status on the status bar.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>



---


#### `cSpell.showStatusAlignment`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.showStatusAlignment`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( "Left" | "Right" )`

    | `Left` | Left Side of Statusbar |
    | `Right` | Right Side of Statusbar |

  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    application
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The side of the status bar to display the spell checker status.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"Right"`_
  </dd>
</dl>



---


#### `cSpell.showSuggestionsLinkInEditorContextMenu`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.showSuggestionsLinkInEditorContextMenu`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    application
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Show Spelling Suggestions link in the top level context menu.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>



---


#### `cSpell.suggestionMenuType`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.suggestionMenuType`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( "quickPick" | "quickFix" )`

    | `quickPick` | Suggestions will appear as a drop down at the top of the IDE. (Best choice for Vim Key Bindings) |
    | `quickFix` | Suggestions will appear inline near the word, inside the text editor. |

  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The type of menu used to display spelling suggestions.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"quickPick"`_
  </dd>
</dl>



---


#### `cSpell.suggestionNumChanges`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.suggestionNumChanges`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The maximum number of changes allowed on a word to be considered a suggestions.

    For example, appending an `s` onto `example` -> `examples` is considered 1 change.

    Range: between 1 and 5.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`3`_
  </dd>
</dl>



---


#### `cSpell.validateDirectives`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.validateDirectives`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    window
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Verify that the in-document directives are correct.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
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


#### ~~`cSpell.allowedSchemas`~~

<dl>
  <dt>Name</dt>
  <dd>
    ~~`cSpell.allowedSchemas`~~ -- Define Allowed Schemes
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    window
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Control which file schemes will be checked for spelling (VS Code must be restarted for this setting to take effect).


    Some schemes have special meaning like:
    - `untitled` - Used for new documents that have not yet been saved
    - `vscode-notebook-cell` - Used for validating segments of a Notebook.
    - `vscode-userdata` - Needed to spell check `.code-snippets`
    - `vscode-scm` - Needed to spell check Source Control commit messages.
    - `comment` - Used for new comment editors.
  </dd>
</dl>

<dl>
  <dt>Deprecation Message</dt>
  <dd>
    - Use `#cSpell.enabledSchemes#` instead.
  </dd>
</dl>

<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.checkOnlyEnabledFileTypes`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.checkOnlyEnabledFileTypes` -- Check Only Enabled File Types
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    By default, the spell checker checks only enabled file types. Use `#cSpell.enableFiletypes#`
    to turn on / off various file types.

    When this setting is `false`, all file types are checked except for the ones disabled by `#cSpell.enabledFileTypes#`.
    See `#cSpell.enableFiletypes#` on how to disable a file type.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>



---


#### `cSpell.enabledFileTypes`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.enabledFileTypes` -- Enabled File Types to Check
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Enable / Disable checking file types (languageIds).

    This setting replaces: `#cSpell.enabledLanguageIds#` and `#cSpell.enableFiletypes#`.

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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    code
    ```js
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
  <dt>Name</dt>
  <dd>
    `cSpell.enabledSchemes` -- Specify Allowed Schemes
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    window
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Control which file schemes will be checked for spelling (VS Code must be restarted for this setting to take effect).


    Some schemes have special meaning like:
    - `untitled` - Used for new documents that have not yet been saved
    - `vscode-notebook-cell` - Used for validating segments of a Notebook.
    - `vscode-userdata` - Needed to spell check `.code-snippets`
    - `vscode-scm` - Needed to spell check Source Control commit messages.
    - `comment` - Used for new comment editors.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    code
    ```js
    {
    "comment": true, "file": true, "gist": true, "repo": true, "sftp": true,
    "untitled": true, "vscode-notebook-cell": true, "vscode-scm": true,
    "vscode-userdata": true, "vscode-vfs": true, "vsls": true
    }
    ```

  </dd>
</dl>



---


#### ~~`cSpell.enableFiletypes`~~

<dl>
  <dt>Name</dt>
  <dd>
    ~~`cSpell.enableFiletypes`~~ -- Enable File Types
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Enable / Disable checking file types (languageIds).

    These are in additional to the file types specified by `#cSpell.enabledLanguageIds#`.
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
</dl>

<dl>
  <dt>Deprecation Message</dt>
  <dd>
    - Use `#cSpell.enabledFileTypes#` instead.
  </dd>
</dl>

<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.files`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.files`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Glob patterns of files to be checked.
    Glob patterns are relative to the `#cSpell.globRoot#` of the configuration file that defines them.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.globRoot`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.globRoot`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The root to use for glob patterns found in this configuration.
    Default: The current workspace folder.
    Use `globRoot` to define a different location. `globRoot` can be relative to the location of this configuration file.
    Defining globRoot, does not impact imported configurations.

    Special Values:

    - `${workspaceFolder}` - Default - globs will be relative to the current workspace folder
    - `${workspaceFolder:<name>}` - Where `<name>` is the name of the workspace folder.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.ignorePaths`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.ignorePaths` -- Glob patterns of files to be ignored
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Glob patterns of files to be ignored. The patterns are relative to the `#cSpell.globRoot#` of the configuration file that defines them.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    code
    ```js
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
  <dt>Name</dt>
  <dd>
    `cSpell.import`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Allows this configuration to inherit configuration for one or more other files.

    See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.mergeCSpellSettings`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.mergeCSpellSettings`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Specify if fields from `.vscode/settings.json` are passed to the spell checker.
    This only applies when there is a CSpell configuration file in the workspace.

    The purpose of this setting to help provide a consistent result compared to the
    CSpell spell checker command line tool.

    Values:
    - `true` - all settings will be merged based upon `#cSpell.mergeCSpellSettingsFields#`.
    - `false` - only use `.vscode/settings.json` if a CSpell configuration is not found.

    Note: this setting is used in conjunction with `#cSpell.mergeCSpellSettingsFields#`.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.mergeCSpellSettingsFields`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.mergeCSpellSettingsFields`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Specify which fields from `.vscode/settings.json` are passed to the spell checker.
    This only applies when there is a CSpell configuration file in the workspace and
    `#cSpell.mergeCSpellSettings#` is `true`.

    Values:
    - `{ flagWords: true, userWords: false }` - Always allow `flagWords`, but never allow `userWords`.

    Example:
    ```json5
    "cSpell.mergeCSpellSettingsFields": { "userWords": false }
    ```
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    code
    ```js
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
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.noConfigSearch`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.noConfigSearch`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Prevents searching for local configuration when checking individual documents.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.spellCheckOnlyWorkspaceFiles`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.spellCheckOnlyWorkspaceFiles` -- Spell Check Only Workspace Files
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    window
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Only spell check files that are in the currently open workspace.
    This same effect can be achieved using the `#cSpell.files#` setting.


    ```js
    "cSpell.files": ["/**"]
    ```
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`false`_
  </dd>
</dl>



---


#### `cSpell.useGitignore`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.useGitignore`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>



---


#### `cSpell.usePnP`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.usePnP`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
    packages stored in the repository.

    When true, the spell checker will search up the directory structure for the existence
    of a PnP file and load it.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.workspaceRootPath`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.workspaceRootPath` -- Workspace Root Folder Path
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Define the path to the workspace root folder in a multi-root workspace.
    By default it is the first folder.

    This is used to find the `cspell.json` file for the workspace.


    **Example: use the `client` folder**
    ```
    ${workspaceFolder:client}
    ```
  </dd>
</dl>



<dl>
  <dt>Default</dt>
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
  <dt>Name</dt>
  <dd>
    `cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    language-overridable
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The maximum average length of chunks of text without word breaks.


    A chunk is the characters between absolute word breaks.
    Absolute word breaks match: `/[\s,{}[\]]/`


    **Error Message:** _Average Word Size is Too High._


    If you are seeing this message, it means that the file contains mostly long lines
    without many word breaks.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`80`_
  </dd>
</dl>



---


#### `cSpell.blockCheckingWhenLineLengthGreaterThan`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.blockCheckingWhenLineLengthGreaterThan`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    language-overridable
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The maximum line length.


    Block spell checking if lines are longer than the value given.
    This is used to prevent spell checking generated files.


    **Error Message:** _Lines are too long._
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`10000`_
  </dd>
</dl>



---


#### `cSpell.blockCheckingWhenTextChunkSizeGreaterThan`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.blockCheckingWhenTextChunkSizeGreaterThan`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    language-overridable
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The maximum length of a chunk of text without word breaks.


    It is used to prevent spell checking of generated files.


    A chunk is the characters between absolute word breaks.
    Absolute word breaks match: `/[\s,{}[\]]/`, i.e. spaces or braces.


    **Error Message:** _Maximum Word Length is Too High._


    If you are seeing this message, it means that the file contains a very long line
    without many word breaks.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`500`_
  </dd>
</dl>



---


#### `cSpell.checkLimit`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.checkLimit`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Set the maximum number of bocks of text to check.
    Each block is 1024 characters.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`500`_
  </dd>
</dl>



---


#### `cSpell.spellCheckDelayMs`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.spellCheckDelayMs`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    application
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Delay in ms after a document has changed before checking it for spelling errors.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`50`_
  </dd>
</dl>



---


#### `cSpell.suggestionsTimeout`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.suggestionsTimeout`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `number`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The maximum amount of time in milliseconds to generate suggestions for a word.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`400`_
  </dd>
</dl>



---




## CSpell


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.ignoreRegExpList`](#cspellignoreregexplist) | resource | List of regular expressions or Pattern names (defined in `#cSpell.patterns#`) to exclude from… |
| [`cSpell.includeRegExpList`](#cspellincluderegexplist) | resource | List of regular expression patterns or defined pattern names to match for spell checking. |
| [`cSpell.languageStatusFields`](#cspelllanguagestatusfields) | machine | Select which fields to display in the language status bar. |
| [`cSpell.overrides`](#cspelloverrides) | resource | Overrides are used to apply settings for specific files in your project. |
| [`cSpell.patterns`](#cspellpatterns) | resource | Defines a list of patterns that can be used with the `#cSpell.ignoreRegExpList#` and `#cSpell.includeRegExpList#`… |
| [`cSpell.useLocallyInstalledCSpellDictionaries`](#cspelluselocallyinstalledcspelldictionaries) | resource | Search for `@cspell/cspell-bundled-dicts` in the workspace folder and use it if found. |


### Definitions


#### `cSpell.ignoreRegExpList`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.ignoreRegExpList`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    List of regular expressions or Pattern names (defined in `#cSpell.patterns#`) to exclude from spell checking.

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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.includeRegExpList`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.includeRegExpList`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    List of regular expression patterns or defined pattern names to match for spell checking.

    If this property is defined, only text matching the included patterns will be checked.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.languageStatusFields`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.languageStatusFields`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Select which fields to display in the language status bar.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`{"fileType":true,"issues":true,"scheme":true}`_
  </dd>
</dl>



---


#### `cSpell.overrides`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.overrides`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.patterns`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.patterns`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Defines a list of patterns that can be used with the `#cSpell.ignoreRegExpList#` and
    `#cSpell.includeRegExpList#` options.

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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.useLocallyInstalledCSpellDictionaries`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.useLocallyInstalledCSpellDictionaries`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Search for `@cspell/cspell-bundled-dicts` in the workspace folder and use it if found.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---




## Appearance


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.dark`](#cspelldark) | machine | Decoration for dark themes. |
| [`cSpell.doNotUseCustomDecorationForScheme`](#cspelldonotusecustomdecorationforscheme) | machine | Use VS Code to Render Spelling Issues |
| [`cSpell.light`](#cspelllight) | machine | Decoration for light themes. |
| [`cSpell.overviewRulerColor`](#cspelloverviewrulercolor) | machine | The CSS color used to show issues in the ruler. |
| [`cSpell.textDecoration`](#cspelltextdecoration) | machine | The CSS Style used to decorate spelling issues. Depends upon `#cSpell.useCustomDecorations#`. |
| [`cSpell.textDecorationColor`](#cspelltextdecorationcolor) | machine | The decoration color for normal spelling issues. |
| [`cSpell.textDecorationColorFlagged`](#cspelltextdecorationcolorflagged) | machine | The decoration color for flagged issues. |
| [`cSpell.textDecorationLine`](#cspelltextdecorationline) | machine | The CSS line type used to decorate issues. |
| [`cSpell.textDecorationStyle`](#cspelltextdecorationstyle) | machine | The CSS line style used to decorate issues. |
| [`cSpell.textDecorationThickness`](#cspelltextdecorationthickness) | machine | The CSS line thickness used to decorate issues. |
| [`cSpell.useCustomDecorations`](#cspellusecustomdecorations) | machine | Draw custom decorations on Spelling Issues. |


### Definitions


#### `cSpell.dark`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.dark`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Decoration for dark themes.

    See:
    - `#cSpell.overviewRulerColor#`
    - `#cSpell.textDecoration#`
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.doNotUseCustomDecorationForScheme`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.doNotUseCustomDecorationForScheme` -- Use VS Code to Render Spelling Issues
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Use the VS Code Diagnostic Collection to render spelling issues.

    With some edit boxes, like the source control message box, the custom decorations do not show up.
    This setting allows the use of the VS Code Diagnostic Collection to render spelling issues.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`{"vscode-scm":true}`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.light`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.light`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `object`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Decoration for light themes.

    See:
    - `#cSpell.overviewRulerColor#`
    - `#cSpell.textDecoration#`
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.overviewRulerColor`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.overviewRulerColor`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"#fc4c"`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.textDecoration`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.textDecoration`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The CSS Style used to decorate spelling issues. Depends upon `#cSpell.useCustomDecorations#`.

    This setting is used to manually configure the text decoration. If it is not set, the following settings are used:
    - `#cSpell.textDecorationLine#` to pick the line type
    - `#cSpell.textDecorationStyle#` to pick the style
    - `#cSpell.textDecorationColor#` to set the color
    - `#cSpell.textDecorationThickness#` to set the thickness.

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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.textDecorationColor`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.textDecorationColor`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The decoration color for normal spelling issues.

    See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
    - color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

    Examples:
    - `green`
    - `yellow`
    - `#ff0c`
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"#fc4"`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.textDecorationColorFlagged`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.textDecorationColorFlagged`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The decoration color for flagged issues.

    See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
    - color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

    Examples:
    - `green`
    - `yellow`
    - `#ff0c`
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"#f44"`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.textDecorationLine`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.textDecorationLine`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( "underline" | "overline" | "line-through" )`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The CSS line type used to decorate issues.

    See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
    - line - `underline`, `overline`, see: [text-decoration-line, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"underline"`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.textDecorationStyle`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.textDecorationStyle`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( "solid" | "wavy" | "dotted" | "dashed" | "double" )`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    The CSS line style used to decorate issues.

    See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
    - style - `solid`, `wavy`, `dotted`, see: [text-decoration-style, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"wavy"`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.textDecorationThickness`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.textDecorationThickness`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
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
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"auto"`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
  <dd>
    4.0.0
  </dd>
</dl>

---


#### `cSpell.useCustomDecorations`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.useCustomDecorations`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    machine
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Draw custom decorations on Spelling Issues.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
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
  <dt>Name</dt>
  <dd>
    `cSpell.advanced.feature.useReferenceProviderRemove` -- Remove Matching Characters Before Rename
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    language-overridable
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Used to work around bugs in Reference Providers and Rename Providers.
    Anything matching the provided Regular Expression will be removed from the text
    before sending it to the Rename Provider.

    See: [Markdown: Fixing spelling issues in Header sections changes the entire line · Issue #1987](https://github.com/streetsidesoftware/vscode-spell-checker/issues/1987)

    It is unlikely that you would need to edit this setting. If you need to, please open an issue at
    [Spell Checker Issues](https://github.com/streetsidesoftware/vscode-spell-checker/issues)

    This feature is used in connection with `#cSpell.advanced.feature.useReferenceProviderWithRename#`
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.advanced.feature.useReferenceProviderWithRename`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.advanced.feature.useReferenceProviderWithRename` -- Use Reference Provider During Rename
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    language-overridable
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Use the Reference Provider when fixing spelling issues with the Rename Provider.
    This feature is used in connection with `#cSpell.fixSpellingWithRenameProvider#`
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`false`_
  </dd>
</dl>



---


#### `cSpell.fixSpellingWithRenameProvider`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.fixSpellingWithRenameProvider`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    language-overridable
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Use Rename Provider when fixing spelling issues.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>



---


#### `cSpell.logFile`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.logFile` -- Write Logs to a File
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    window
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Have the logs written to a file instead of to VS Code.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### `cSpell.logLevel`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.logLevel` -- Set Logging Level
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( "None" | "Error" | "Warning" | "Information" | "Debug" )`

    | `None` | Do not log |
    | `Error` | Log only errors |
    | `Warning` | Log errors and warnings |
    | `Information` | Log errors, warnings, and info |
    | `Debug` | Log everything (noisy) |

  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    window
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Set the Debug Level for logging messages.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`"Error"`_
  </dd>
</dl>



---


#### `cSpell.trustedWorkspace`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.trustedWorkspace`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    window
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Enable loading JavaScript CSpell configuration files.

    This setting is automatically set to `true` in a trusted workspace. It is possible to override the setting to `false` in a trusted workspace,
    but a setting of `true` in an untrusted workspace will be ignored.

    See:
    - [Visual Studio Code Workspace Trust security](https://code.visualstudio.com/docs/editor/workspace-trust)
    - [Workspace Trust Extension Guide -- Visual Studio Code Extension API](https://code.visualstudio.com/api/extension-guides/workspace-trust)
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`true`_
  </dd>
</dl>

<dl>
  <dt>Since Version</dt>
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


### Definitions


#### `cSpell.experimental.enableRegexpView`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.experimental.enableRegexpView`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    application
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Show Regular Expression Explorer
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`false`_
  </dd>
</dl>



---


#### `cSpell.experimental.enableSettingsViewerV2`

<dl>
  <dt>Name</dt>
  <dd>
    `cSpell.experimental.enableSettingsViewerV2`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    application
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Enable the Settings Viewer V2 Extension
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`false`_
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
  <dt>Name</dt>
  <dd>
    `cSpell.allowCompoundWords`
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `boolean`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Enable / Disable allowing word compounds.
    - `true` means `arraylength` would be ok
    - `false` means it would not pass.

    Note: this can also cause many misspelled words to seem correct.
  </dd>
</dl>



<dl>
  <dt>Default</dt>
  <dd>
    _`false`_
  </dd>
</dl>



---


#### ~~`cSpell.customFolderDictionaries`~~

<dl>
  <dt>Name</dt>
  <dd>
    ~~`cSpell.customFolderDictionaries`~~ -- Custom Folder Dictionaries
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( object | string )[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Define custom dictionaries to be included by default for the folder.
    If `addWords` is `true` words will be added to this dictionary.
  </dd>
</dl>

<dl>
  <dt>Deprecation Message</dt>
  <dd>
    - Use `#cSpell.customDictionaries#` instead.
  </dd>
</dl>

<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### ~~`cSpell.customUserDictionaries`~~

<dl>
  <dt>Name</dt>
  <dd>
    ~~`cSpell.customUserDictionaries`~~ -- Custom User Dictionaries
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( object | string )[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    application
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Define custom dictionaries to be included by default for the user.
    If `addWords` is `true` words will be added to this dictionary.
  </dd>
</dl>

<dl>
  <dt>Deprecation Message</dt>
  <dd>
    - Use `#cSpell.customDictionaries#` instead.
  </dd>
</dl>

<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### ~~`cSpell.customWorkspaceDictionaries`~~

<dl>
  <dt>Name</dt>
  <dd>
    ~~`cSpell.customWorkspaceDictionaries`~~ -- Custom Workspace Dictionaries
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `( object | string )[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Define custom dictionaries to be included by default for the workspace.
    If `addWords` is `true` words will be added to this dictionary.
  </dd>
</dl>

<dl>
  <dt>Deprecation Message</dt>
  <dd>
    - Use `#cSpell.customDictionaries#` instead.
  </dd>
</dl>

<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---


#### ~~`cSpell.enabledLanguageIds`~~

<dl>
  <dt>Name</dt>
  <dd>
    ~~`cSpell.enabledLanguageIds`~~ -- Enabled Language Ids
  </dd>
</dl>

<dl>
  <dt>Type</dt>
  <dd>
    `string[]`
  </dd>
</dl>

<dl>
  <dt>Scope</dt>
  <dd>
    resource
  </dd>
</dl>

<dl>
  <dt>Description</dt>
  <dd>
    Specify a list of file types to spell check. It is better to use `#cSpell.enabledFileTypes#` to Enable / Disable checking files types.
  </dd>
</dl>

<dl>
  <dt>Deprecation Message</dt>
  <dd>
    - Use `#cSpell.enabledFileTypes#` instead.
  </dd>
</dl>

<dl>
  <dt>Default</dt>
  <dd>
    _- none -_
  </dd>
</dl>



---





