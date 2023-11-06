<!--- AUTO-GENERATED ALL CHANGES WILL BE LOST --->

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

# Code Spell Checker

| Setting                            | Scope    | Description                         |
| ---------------------------------- | -------- | ----------------------------------- |
| [`cSpell.enabled`](#cspellenabled) | resource | Enable / Disable the spell checker. |

## Definitions

### `cSpell.enabled`

Name
: `cSpell.enabled`

Type
: boolean

Scope
: resource

Description
: Enable / Disable the spell checker.

Default
: _`true`_

---

# Languages and Dictionaries

| Setting                                                        | Scope    | Description                                                                                       |
| -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| [`cSpell.caseSensitive`](#cspellcasesensitive)                 | resource | Determines if words must match case and accent rules.                                             |
| [`cSpell.customDictionaries`](#cspellcustomdictionaries)       | resource | Custom Dictionaries                                                                               |
| [`cSpell.dictionaries`](#cspelldictionaries)                   | resource | Optional list of dictionaries to use.                                                             |
| [`cSpell.dictionaryDefinitions`](#cspelldictionarydefinitions) | resource | Dictionary Definitions                                                                            |
| [`cSpell.flagWords`](#cspellflagwords)                         | resource | List of words to always be considered incorrect. Words found in `flagWords` override `words`.     |
| [`cSpell.ignoreWords`](#cspellignorewords)                     | resource | A list of words to be ignored by the spell checker.                                               |
| [`cSpell.language`](#cspelllanguage)                           | resource | Current active spelling language.                                                                 |
| [`cSpell.languageSettings`](#cspelllanguagesettings)           | resource | Additional settings for individual programming languages and locales.                             |
| [`cSpell.noSuggestDictionaries`](#cspellnosuggestdictionaries) | resource | Optional list of dictionaries that will not be used for suggestions. Words in these dictionaries… |
| [`cSpell.suggestWords`](#cspellsuggestwords)                   |          | A list of suggested replacements for words. Suggested words provide a way to make preferred…      |
| [`cSpell.userWords`](#cspelluserwords)                         | resource | Words to add to global dictionary -- should only be in the user config file.                      |
| [`cSpell.words`](#cspellwords)                                 | resource | List of words to be considered correct.                                                           |

## Definitions

### `cSpell.caseSensitive`

Name
: `cSpell.caseSensitive`

Type
: boolean

Scope
: resource

Description
: Determines if words must match case and accent rules.

    - `false` - Case is ignored and accents can be missing on the entire word.
      Incorrect accents or partially missing accents will be marked as incorrect.
      Note: Some languages like Portuguese have case sensitivity turned on by default.
      You must use `#cSpell.languageSettings#` to turn it off.
    - `true` - Case and accents are enforced by default.

Default
: _- none -_

---

### `cSpell.customDictionaries`

Name
: `cSpell.customDictionaries` -- Custom Dictionaries

Type
: object

Scope
: resource

Description
: Define custom dictionaries to be included by default.
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

Default
: _- none -_

---

### `cSpell.dictionaries`

Name
: `cSpell.dictionaries`

Type
: string[]

Scope
: resource

Description
: Optional list of dictionaries to use.

    Each entry should match the name of the dictionary.

    To remove a dictionary from the list add `!` before the name.
    i.e. `!typescript` will turn off the dictionary with the name `typescript`.


    Example:

    ```jsonc
    // Enable `lorem-ipsum` and disable `typescript`
    "cSpell.dictionaries": ["lorem-ipsum", "!typescript"]
    ```

Default
: _- none -_

---

### `cSpell.dictionaryDefinitions`

Name
: `cSpell.dictionaryDefinitions` -- Dictionary Definitions

Type
: []

Scope
: resource

Description
: Define custom dictionaries..
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

Default
: _- none -_

---

### `cSpell.flagWords`

Name
: `cSpell.flagWords`

Type
: string[]

Scope
: resource

Description
: List of words to always be considered incorrect. Words found in `flagWords` override `words`.

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

Default
: _- none -_

---

### `cSpell.ignoreWords`

Name
: `cSpell.ignoreWords`

Type
: string[]

Scope
: resource

Description
: A list of words to be ignored by the spell checker.

Default
: _- none -_

---

### `cSpell.language`

Name
: `cSpell.language`

Type
: string

Scope
: resource

Description
: Current active spelling language.

    Example: "en-GB" for British English

    Example: "en,nl" to enable both English and Dutch

Default
: _`"en"`_

---

### `cSpell.languageSettings`

Name
: `cSpell.languageSettings`

Type
: object[]

Scope
: resource

Description
: Additional settings for individual programming languages and locales.

Default
: _- none -_

---

### `cSpell.noSuggestDictionaries`

Name
: `cSpell.noSuggestDictionaries`

Type
: string[]

Scope
: resource

Description
: Optional list of dictionaries that will not be used for suggestions.
Words in these dictionaries are considered correct, but will not be
used when making spell correction suggestions.

    Note: if a word is suggested by another dictionary, but found in
    one of these dictionaries, it will be removed from the set of
    possible suggestions.

Default
: _- none -_

---

### `cSpell.suggestWords`

Name
: `cSpell.suggestWords`

Type
: string[]

Scope
:

Description
: A list of suggested replacements for words.
Suggested words provide a way to make preferred suggestions on word replacements.
To hint at a preferred change, but not to require it.

    Format of `suggestWords`
    - Single suggestion (possible auto fix)
        - `word: suggestion`
        - `word->suggestion`
    - Multiple suggestions (not auto fixable)
       - `word: first, second, third`
       - `word->first, second, third`

Default
: _- none -_

---

### `cSpell.userWords`

Name
: `cSpell.userWords`

Type
: string[]

Scope
: resource

Description
: Words to add to global dictionary -- should only be in the user config file.

Default
: _- none -_

---

### `cSpell.words`

Name
: `cSpell.words`

Type
: string[]

Scope
: resource

Description
: List of words to be considered correct.

Default
: _- none -_

---

# Reporting and Display

| Setting                                                                                          | Scope                | Description                                                                     |
| ------------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------- |
| [`cSpell.autoFormatConfigFile`](#cspellautoformatconfigfile)                                     | window               | Auto Format Configuration File                                                  |
| [`cSpell.diagnosticLevel`](#cspelldiagnosticlevel)                                               | resource             | Set Diagnostic Reporting Level                                                  |
| [`cSpell.diagnosticLevelFlaggedWords`](#cspelldiagnosticlevelflaggedwords)                       | resource             | Set Diagnostic Reporting Level for Flagged Words                                |
| [`cSpell.diagnosticLevelSCM`](#cspelldiagnosticlevelscm)                                         | resource             | Set Diagnostic Reporting Level in SCM Commit Message                            |
| [`cSpell.hideAddToDictionaryCodeActions`](#cspellhideaddtodictionarycodeactions)                 | resource             | Hide the options to add words to dictionaries or settings.                      |
| [`cSpell.maxDuplicateProblems`](#cspellmaxduplicateproblems)                                     | resource             | The maximum number of times the same word can be flagged as an error in a file. |
| [`cSpell.maxNumberOfProblems`](#cspellmaxnumberofproblems)                                       | resource             | Controls the maximum number of spelling errors per document.                    |
| [`cSpell.minWordLength`](#cspellminwordlength)                                                   | resource             | The minimum length of a word before checking it against a dictionary.           |
| [`cSpell.numSuggestions`](#cspellnumsuggestions)                                                 | resource             | Controls the number of suggestions shown.                                       |
| [`cSpell.showAutocompleteSuggestions`](#cspellshowautocompletesuggestions)                       | language-overridable | Show CSpell in-document directives as you type.                                 |
| [`cSpell.showCommandsInEditorContextMenu`](#cspellshowcommandsineditorcontextmenu)               | application          | Show Spell Checker actions in Editor Context Menu                               |
| [`cSpell.showStatus`](#cspellshowstatus)                                                         | application          | Display the spell checker status on the status bar.                             |
| [`cSpell.showStatusAlignment`](#cspellshowstatusalignment)                                       | application          | The side of the status bar to display the spell checker status.                 |
| [`cSpell.showSuggestionsLinkInEditorContextMenu`](#cspellshowsuggestionslinkineditorcontextmenu) | application          | Show Spelling Suggestions link in the top level context menu.                   |
| [`cSpell.suggestionMenuType`](#cspellsuggestionmenutype)                                         | resource             | The type of menu used to display spelling suggestions.                          |
| [`cSpell.suggestionNumChanges`](#cspellsuggestionnumchanges)                                     | resource             | The maximum number of changes allowed on a word to be considered a suggestions. |
| [`cSpell.validateDirectives`](#cspellvalidatedirectives)                                         | window               | Verify that the in-document directives are correct.                             |

## Definitions

### `cSpell.autoFormatConfigFile`

Name
: `cSpell.autoFormatConfigFile` -- Auto Format Configuration File

Type
: boolean

Scope
: window

Description
: If a `cspell` configuration file is updated, format the configuration file
using the VS Code Format Document Provider. This will cause the configuration
file to be saved prior to being updated.

Default
: _`false`_

---

### `cSpell.diagnosticLevel`

Name
: `cSpell.diagnosticLevel` -- Set Diagnostic Reporting Level

Type
: ( `"Error"` \| `"Warning"` \| `"Information"` \| `"Hint"` )

    | `Error` | Report Spelling Issues as Errors |
    | `Warning` | Report Spelling Issues as Warnings |
    | `Information` | Report Spelling Issues as Information |
    | `Hint` | Report Spelling Issues as Hints, will not show up in Problems |

Scope
: resource

Description
: Issues found by the spell checker are marked with a Diagnostic Severity Level. This affects the color of the squiggle.

Default
: _`"Information"`_

---

### `cSpell.diagnosticLevelFlaggedWords`

Name
: `cSpell.diagnosticLevelFlaggedWords` -- Set Diagnostic Reporting Level for Flagged Words

Type
: ( `"Error"` \| `"Warning"` \| `"Information"` \| `"Hint"` )

    | `Error` | Report Spelling Issues as Errors |
    | `Warning` | Report Spelling Issues as Warnings |
    | `Information` | Report Spelling Issues as Information |
    | `Hint` | Report Spelling Issues as Hints, will not show up in Problems |

Scope
: resource

Description
: Flagged word issues found by the spell checker are marked with a Diagnostic Severity Level. This affects the color of the squiggle.
By default, flagged words will use the same diagnostic level as general issues. Use this setting to customize them.

Default
: _- none -_

Version
: 4.0.0

---

### `cSpell.diagnosticLevelSCM`

Name
: `cSpell.diagnosticLevelSCM` -- Set Diagnostic Reporting Level in SCM Commit Message

Type
: ( `"Error"` \| `"Warning"` \| `"Information"` \| `"Hint"` \| `"Off"` )

    | `Error` | Report Spelling Issues as Errors |
    | `Warning` | Report Spelling Issues as Warnings |
    | `Information` | Report Spelling Issues as Information |
    | `Hint` | Report Spelling Issues as Hints, will not show up in Problems |
    | `Off` | Do not Report Spelling Issues |

Scope
: resource

Description
: Diagnostic level for source control _commit_ messages. Issues found by the spell checker are marked with a Diagnostic Severity Level.
This affects the color of the squiggle.

    By default, this setting will match `#cSpell.diagnosticLevel#`.

Default
: _- none -_

---

### `cSpell.hideAddToDictionaryCodeActions`

Name
: `cSpell.hideAddToDictionaryCodeActions`

Type
: boolean

Scope
: resource

Description
: Hide the options to add words to dictionaries or settings.

Default
: _`false`_

---

### `cSpell.maxDuplicateProblems`

Name
: `cSpell.maxDuplicateProblems`

Type
: number

Scope
: resource

Description
: The maximum number of times the same word can be flagged as an error in a file.

Default
: _`20`_

---

### `cSpell.maxNumberOfProblems`

Name
: `cSpell.maxNumberOfProblems`

Type
: number

Scope
: resource

Description
: Controls the maximum number of spelling errors per document.

Default
: _`100`_

---

### `cSpell.minWordLength`

Name
: `cSpell.minWordLength`

Type
: number

Scope
: resource

Description
: The minimum length of a word before checking it against a dictionary.

Default
: _`4`_

---

### `cSpell.numSuggestions`

Name
: `cSpell.numSuggestions`

Type
: number

Scope
: resource

Description
: Controls the number of suggestions shown.

Default
: _`8`_

---

### `cSpell.showAutocompleteSuggestions`

Name
: `cSpell.showAutocompleteSuggestions`

Type
: boolean

Scope
: language-overridable

Description
: Show CSpell in-document directives as you type.

    **Note:** VS Code must be restarted for this setting to take effect.

Default
: _`false`_

---

### `cSpell.showCommandsInEditorContextMenu`

Name
: `cSpell.showCommandsInEditorContextMenu`

Type
: boolean

Scope
: application

Description
: Show Spell Checker actions in Editor Context Menu

Default
: _`true`_

---

### `cSpell.showStatus`

Name
: `cSpell.showStatus`

Type
: boolean

Scope
: application

Description
: Display the spell checker status on the status bar.

Default
: _`true`_

---

### `cSpell.showStatusAlignment`

Name
: `cSpell.showStatusAlignment`

Type
: ( `"Left"` \| `"Right"` )

    | `Left` | Left Side of Statusbar |
    | `Right` | Right Side of Statusbar |

Scope
: application

Description
: The side of the status bar to display the spell checker status.

Default
: _`"Right"`_

---

### `cSpell.showSuggestionsLinkInEditorContextMenu`

Name
: `cSpell.showSuggestionsLinkInEditorContextMenu`

Type
: boolean

Scope
: application

Description
: Show Spelling Suggestions link in the top level context menu.

Default
: _`true`_

---

### `cSpell.suggestionMenuType`

Name
: `cSpell.suggestionMenuType`

Type
: ( `"quickPick"` \| `"quickFix"` )

    | `quickPick` | Suggestions will appear as a drop down at the top of the IDE. (Best choice for Vim Key Bindings) |
    | `quickFix` | Suggestions will appear inline near the word, inside the text editor. |

Scope
: resource

Description
: The type of menu used to display spelling suggestions.

Default
: _`"quickPick"`_

---

### `cSpell.suggestionNumChanges`

Name
: `cSpell.suggestionNumChanges`

Type
: number

Scope
: resource

Description
: The maximum number of changes allowed on a word to be considered a suggestions.

    For example, appending an `s` onto `example` -> `examples` is considered 1 change.

    Range: between 1 and 5.

Default
: _`3`_

---

### `cSpell.validateDirectives`

Name
: `cSpell.validateDirectives`

Type
: boolean

Scope
: window

Description
: Verify that the in-document directives are correct.

Default
: _- none -_

---

# Files, Folders, and Workspaces

| Setting                                                                      | Scope    | Description                                                                                        |
| ---------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| [`cSpell.allowedSchemas`](#cspellallowedschemas)                             | window   | Define Allowed Schemas                                                                             |
| [`cSpell.checkOnlyEnabledFileTypes`](#cspellcheckonlyenabledfiletypes)       | resource | Check Only Enabled File Types                                                                      |
| [`cSpell.enableFiletypes`](#cspellenablefiletypes)                           | resource | File Types to Check                                                                                |
| [`cSpell.files`](#cspellfiles)                                               | resource | Glob patterns of files to be checked. Glob patterns are relative to the `#cSpell.globRoot#`…       |
| [`cSpell.globRoot`](#cspellglobroot)                                         | resource | The root to use for glob patterns found in this configuration. Default: The current workspace…     |
| [`cSpell.ignorePaths`](#cspellignorepaths)                                   | resource | Glob patterns of files to be ignored                                                               |
| [`cSpell.import`](#cspellimport)                                             | resource | Allows this configuration to inherit configuration for one or more other files.                    |
| [`cSpell.mergeCSpellSettings`](#cspellmergecspellsettings)                   | resource | Specify if fields from `.vscode/settings.json` are passed to the spell checker. This only applies… |
| [`cSpell.mergeCSpellSettingsFields`](#cspellmergecspellsettingsfields)       | resource | Specify which fields from `.vscode/settings.json` are passed to the spell checker. This only…      |
| [`cSpell.noConfigSearch`](#cspellnoconfigsearch)                             | resource | Prevents searching for local configuration when checking individual documents.                     |
| [`cSpell.spellCheckOnlyWorkspaceFiles`](#cspellspellcheckonlyworkspacefiles) | window   | Spell Check Only Workspace Files                                                                   |
| [`cSpell.useGitignore`](#cspellusegitignore)                                 | resource | Tells the spell checker to load `.gitignore` files and skip files that match the globs in the…     |
| [`cSpell.usePnP`](#cspellusepnp)                                             | resource | Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading packages stored in…       |
| [`cSpell.workspaceRootPath`](#cspellworkspacerootpath)                       | resource | Workspace Root Folder Path                                                                         |

## Definitions

### `cSpell.allowedSchemas`

Name
: `cSpell.allowedSchemas` -- Define Allowed Schemas

Type
: string[]

Scope
: window

Description
: Control which file schemas will be checked for spelling (VS Code must be restarted for this setting to take effect).

    Some schemas have special meaning like:
    - `untitled` - Used for new documents that have not yet been saved
    - `vscode-notebook-cell` - Used for validating segments of a Notebook.
    - `vscode-userdata` - Needed to spell check `.code-snippets`
    - `vscode-scm` - Needed to spell check Source Control commit messages.

Default
: [ _`"file"`_, _`"gist"`_, _`"repo"`_, _`"sftp"`_, _`"untitled"`_, _`"vscode-notebook-cell"`_, _`"vscode-scm"`_, _`"vscode-userdata"`_ ]

---

### `cSpell.checkOnlyEnabledFileTypes`

Name
: `cSpell.checkOnlyEnabledFileTypes` -- Check Only Enabled File Types

Type
: boolean

Scope
: resource

Description
: By default, the spell checker checks only enabled file types. Use `#cSpell.enableFiletypes#`
to turn on / off various file types.

    When this setting is `false`, all file types are checked except for the ones disabled by `#cSpell.enableFiletypes#`.
    See `#cSpell.enableFiletypes#` on how to disable a file type.

Default
: _`true`_

---

### `cSpell.enableFiletypes`

Name
: `cSpell.enableFiletypes` -- File Types to Check

Type
: string[]

Scope
: resource

Description
: Enable / Disable checking file types (languageIds).

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

Default
: _- none -_

---

### `cSpell.files`

Name
: `cSpell.files`

Type
: string[]

Scope
: resource

Description
: Glob patterns of files to be checked.
Glob patterns are relative to the `#cSpell.globRoot#` of the configuration file that defines them.

Default
: _- none -_

---

### `cSpell.globRoot`

Name
: `cSpell.globRoot`

Type
: string

Scope
: resource

Description
: The root to use for glob patterns found in this configuration.
Default: The current workspace folder.
Use `globRoot` to define a different location. `globRoot` can be relative to the location of this configuration file.
Defining globRoot, does not impact imported configurations.

    Special Values:

    - `${workspaceFolder}` - Default - globs will be relative to the current workspace folder
    - `${workspaceFolder:<name>}` - Where `<name>` is the name of the workspace folder.

Default
: _- none -_

---

### `cSpell.ignorePaths`

Name
: `cSpell.ignorePaths` -- Glob patterns of files to be ignored

Type
: string[]

Scope
: resource

Description
: Glob patterns of files to be ignored. The patterns are relative to the `#cSpell.globRoot#` of the configuration file that defines them.

Default
: [ _`"package-lock.json"`_, _`"node_modules"`_, _`"vscode-extension"`_, _`".git/objects"`_, _`".vscode"`_, _`".vscode-insiders"`_ ]

---

### `cSpell.import`

Name
: `cSpell.import`

Type
: string[]

Scope
: resource

Description
: Allows this configuration to inherit configuration for one or more other files.

    See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.

Default
: _- none -_

---

### `cSpell.mergeCSpellSettings`

Name
: `cSpell.mergeCSpellSettings`

Type
: boolean

Scope
: resource

Description
: Specify if fields from `.vscode/settings.json` are passed to the spell checker.
This only applies when there is a CSpell configuration file in the workspace.

    The purpose of this setting to help provide a consistent result compared to the
    CSpell spell checker command line tool.

    Values:
    - `true` - all settings will be merged based upon `#cSpell.mergeCSpellSettingsFields#`.
    - `false` - only use `.vscode/settings.json` if a CSpell configuration is not found.

    Note: this setting is used in conjunction with `#cSpell.mergeCSpellSettingsFields#`.

Default
: _`false`_

Version
: 4.0.0

---

### `cSpell.mergeCSpellSettingsFields`

Name
: `cSpell.mergeCSpellSettingsFields`

Type
: object

Scope
: resource

Description
: Specify which fields from `.vscode/settings.json` are passed to the spell checker.
This only applies when there is a CSpell configuration file in the workspace and
`#cSpell.mergeCSpellSettings#` is `true`.

    Values:
    - `{ flagWords: true, userWords: false }` - Always allow `flagWords`, but never allow `userWords`.

    Example:
    ```jsonc
    "cSpell.mergeCSpellSettingsFields": { "userWords": false }
    ```

Default
: _`{"allowCompoundWords":true,"caseSensitive":true,"dictionaries":true,"dictionaryDefinitions":true,"enableGlobDot":true,"features":true,"files":true,"flagWords":true,"gitignoreRoot":true,"globRoot":true,"ignorePaths":true,"ignoreRegExpList":true,"ignoreWords":true,"import":true,"includeRegExpList":true,"language":true,"languageId":true,"languageSettings":true,"loadDefaultConfiguration":true,"minWordLength":true,"noConfigSearch":true,"noSuggestDictionaries":true,"numSuggestions":true,"overrides":true,"patterns":true,"pnpFiles":true,"reporters":true,"suggestWords":true,"useGitignore":true,"usePnP":true,"userWords":true,"validateDirectives":true,"words":true}`_

Version
: 4.0.0

---

### `cSpell.noConfigSearch`

Name
: `cSpell.noConfigSearch`

Type
: boolean

Scope
: resource

Description
: Prevents searching for local configuration when checking individual documents.

Default
: _- none -_

---

### `cSpell.spellCheckOnlyWorkspaceFiles`

Name
: `cSpell.spellCheckOnlyWorkspaceFiles` -- Spell Check Only Workspace Files

Type
: boolean

Scope
: window

Description
: Only spell check files that are in the currently open workspace.
This same effect can be achieved using the `#cSpell.files#` setting.

    ```js
    "cSpell.files": ["/**"]
    ```

Default
: _`false`_

---

### `cSpell.useGitignore`

Name
: `cSpell.useGitignore`

Type
: boolean

Scope
: resource

Description
: Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.

Default
: _`true`_

---

### `cSpell.usePnP`

Name
: `cSpell.usePnP`

Type
: boolean

Scope
: resource

Description
: Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

    When true, the spell checker will search up the directory structure for the existence
    of a PnP file and load it.

Default
: _- none -_

---

### `cSpell.workspaceRootPath`

Name
: `cSpell.workspaceRootPath` -- Workspace Root Folder Path

Type
: string

Scope
: resource

Description
: Define the path to the workspace root folder in a multi-root workspace.
By default it is the first folder.

    This is used to find the `cspell.json` file for the workspace.


    **Example: use the `client` folder**
    ```
    ${workspaceFolder:client}
    ```

Default
: _- none -_

---

# Performance

| Setting                                                                                                      | Scope                | Description                                                                      |
| ------------------------------------------------------------------------------------------------------------ | -------------------- | -------------------------------------------------------------------------------- |
| [`cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`](#cspellblockcheckingwhenaveragechunksizegreaterthan) | language-overridable | The maximum average length of chunks of text without word breaks.                |
| [`cSpell.blockCheckingWhenLineLengthGreaterThan`](#cspellblockcheckingwhenlinelengthgreaterthan)             | language-overridable | The maximum line length.                                                         |
| [`cSpell.blockCheckingWhenTextChunkSizeGreaterThan`](#cspellblockcheckingwhentextchunksizegreaterthan)       | language-overridable | The maximum length of a chunk of text without word breaks.                       |
| [`cSpell.checkLimit`](#cspellchecklimit)                                                                     | resource             | The limit in K-Characters to be checked in a file.                               |
| [`cSpell.spellCheckDelayMs`](#cspellspellcheckdelayms)                                                       | application          | Delay in ms after a document has changed before checking it for spelling errors. |
| [`cSpell.suggestionsTimeout`](#cspellsuggestionstimeout)                                                     | resource             | The maximum amount of time in milliseconds to generate suggestions for a word.   |

## Definitions

### `cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`

Name
: `cSpell.blockCheckingWhenAverageChunkSizeGreaterThan`

Type
: number

Scope
: language-overridable

Description
: The maximum average length of chunks of text without word breaks.

    A chunk is the characters between absolute word breaks.
    Absolute word breaks match: `/[\s,{}[\]]/`


    **Error Message:** _Average Word Size is Too High._


    If you are seeing this message, it means that the file contains mostly long lines
    without many word breaks.

Default
: _`80`_

---

### `cSpell.blockCheckingWhenLineLengthGreaterThan`

Name
: `cSpell.blockCheckingWhenLineLengthGreaterThan`

Type
: number

Scope
: language-overridable

Description
: The maximum line length.

    Block spell checking if lines are longer than the value given.
    This is used to prevent spell checking generated files.


    **Error Message:** _Lines are too long._

Default
: _`10000`_

---

### `cSpell.blockCheckingWhenTextChunkSizeGreaterThan`

Name
: `cSpell.blockCheckingWhenTextChunkSizeGreaterThan`

Type
: number

Scope
: language-overridable

Description
: The maximum length of a chunk of text without word breaks.

    It is used to prevent spell checking of generated files.


    A chunk is the characters between absolute word breaks.
    Absolute word breaks match: `/[\s,{}[\]]/`, i.e. spaces or braces.


    **Error Message:** _Maximum Word Length is Too High._


    If you are seeing this message, it means that the file contains a very long line
    without many word breaks.

Default
: _`500`_

---

### `cSpell.checkLimit`

Name
: `cSpell.checkLimit`

Type
: number

Scope
: resource

Description
: The limit in K-Characters to be checked in a file.

Default
: _`500`_

---

### `cSpell.spellCheckDelayMs`

Name
: `cSpell.spellCheckDelayMs`

Type
: number

Scope
: application

Description
: Delay in ms after a document has changed before checking it for spelling errors.

Default
: _`50`_

---

### `cSpell.suggestionsTimeout`

Name
: `cSpell.suggestionsTimeout`

Type
: number

Scope
: resource

Description
: The maximum amount of time in milliseconds to generate suggestions for a word.

Default
: _`400`_

---

# CSpell

| Setting                                                | Scope    | Description                                                                                                        |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| [`cSpell.ignoreRegExpList`](#cspellignoreregexplist)   | resource | List of regular expressions or Pattern names (defined in `#cSpell.patterns#`) to exclude from…                     |
| [`cSpell.includeRegExpList`](#cspellincluderegexplist) | resource | List of regular expression patterns or defined pattern names to match for spell checking.                          |
| [`cSpell.overrides`](#cspelloverrides)                 | resource | Overrides are used to apply settings for specific files in your project.                                           |
| [`cSpell.patterns`](#cspellpatterns)                   | resource | Defines a list of patterns that can be used with the `#cSpell.ignoreRegExpList#` and `#cSpell.includeRegExpList#`… |

## Definitions

### `cSpell.ignoreRegExpList`

Name
: `cSpell.ignoreRegExpList`

Type
: string[]

Scope
: resource

Description
: List of regular expressions or Pattern names (defined in `#cSpell.patterns#`) to exclude from spell checking.

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

Default
: _- none -_

---

### `cSpell.includeRegExpList`

Name
: `cSpell.includeRegExpList`

Type
: string[]

Scope
: resource

Description
: List of regular expression patterns or defined pattern names to match for spell checking.

    If this property is defined, only text matching the included patterns will be checked.

Default
: _- none -_

---

### `cSpell.overrides`

Name
: `cSpell.overrides`

Type
: object[]

Scope
: resource

Description
: Overrides are used to apply settings for specific files in your project.

    **Example:**

    ```jsonc
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

Default
: _- none -_

---

### `cSpell.patterns`

Name
: `cSpell.patterns`

Type
: object[]

Scope
: resource

Description
: Defines a list of patterns that can be used with the `#cSpell.ignoreRegExpList#` and
`#cSpell.includeRegExpList#` options.

    **Example:**

    ```jsonc
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

Default
: _- none -_

---

# Appearance

| Setting                                                                  | Scope       | Description                                                                               |
| ------------------------------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------- |
| [`cSpell.dark`](#cspelldark)                                             | application | Decoration for dark themes.                                                               |
| [`cSpell.decorateIssues`](#cspelldecorateissues)                         | application | Draw custom decorations on Spelling Issues when the `#cSpell.diagnosticLevel#` is `Hint`. |
| [`cSpell.light`](#cspelllight)                                           | application | Decoration for light themes.                                                              |
| [`cSpell.overviewRulerColor`](#cspelloverviewrulercolor)                 | application | The CSS color used to show issues in the ruler.                                           |
| [`cSpell.textDecoration`](#cspelltextdecoration)                         | application | The CSS Style used to decorate spelling issues. Depends upon `#cSpell.decorateIssues#`.   |
| [`cSpell.textDecorationColor`](#cspelltextdecorationcolor)               | application | The decoration color for normal spelling issues.                                          |
| [`cSpell.textDecorationColorFlagged`](#cspelltextdecorationcolorflagged) | application | The decoration color for flagged issues.                                                  |
| [`cSpell.textDecorationLine`](#cspelltextdecorationline)                 | application | The CSS line type used to decorate issues.                                                |
| [`cSpell.textDecorationStyle`](#cspelltextdecorationstyle)               | application | The CSS line style used to decorate issues.                                               |
| [`cSpell.textDecorationThickness`](#cspelltextdecorationthickness)       | application | The CSS line thickness used to decorate issues.                                           |

## Definitions

### `cSpell.dark`

Name
: `cSpell.dark`

Type
: object

Scope
: application

Description
: Decoration for dark themes.

    See:
    - `#cSpell.overviewRulerColor#`
    - `#cSpell.textDecoration#`

Default
: _- none -_

---

### `cSpell.decorateIssues`

Name
: `cSpell.decorateIssues`

Type
: boolean

Scope
: application

Description
: Draw custom decorations on Spelling Issues when the `#cSpell.diagnosticLevel#` is `Hint`.

Default
: _`false`_

Version
: 4.0.0

---

### `cSpell.light`

Name
: `cSpell.light`

Type
: object

Scope
: application

Description
: Decoration for light themes.

    See:
    - `#cSpell.overviewRulerColor#`
    - `#cSpell.textDecoration#`

Default
: _- none -_

---

### `cSpell.overviewRulerColor`

Name
: `cSpell.overviewRulerColor`

Type
: string

Scope
: application

Description
: The CSS color used to show issues in the ruler.

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

Default
: _`"#fc4c"`_

Version
: 4.0.0

---

### `cSpell.textDecoration`

Name
: `cSpell.textDecoration`

Type
: string

Scope
: application

Description
: The CSS Style used to decorate spelling issues. Depends upon `#cSpell.decorateIssues#`.

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

Default
: _- none -_

Version
: 4.0.0

---

### `cSpell.textDecorationColor`

Name
: `cSpell.textDecorationColor`

Type
: string

Scope
: application

Description
: The decoration color for normal spelling issues.

    See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
    - color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

    Examples:
    - `green`
    - `yellow`
    - `#ff0c`

Default
: _`"#fc4"`_

Version
: 4.0.0

---

### `cSpell.textDecorationColorFlagged`

Name
: `cSpell.textDecorationColorFlagged`

Type
: string

Scope
: application

Description
: The decoration color for flagged issues.

    See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
    - color - see: [text-decoration-color, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)

    Examples:
    - `green`
    - `yellow`
    - `#ff0c`

Default
: _`"#f44"`_

Version
: 4.0.0

---

### `cSpell.textDecorationLine`

Name
: `cSpell.textDecorationLine`

Type
: ( `"underline"` \| `"overline"` \| `"line-through"` )

Scope
: application

Description
: The CSS line type used to decorate issues.

    See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
    - line - `underline`, `overline`, see: [text-decoration-line, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)

Default
: _`"underline"`_

Version
: 4.0.0

---

### `cSpell.textDecorationStyle`

Name
: `cSpell.textDecorationStyle`

Type
: ( `"solid"` \| `"wavy"` \| `"dotted"` \| `"dashed"` \| `"double"` )

Scope
: application

Description
: The CSS line style used to decorate issues.

    See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
    - style - `solid`, `wavy`, `dotted`, see: [text-decoration-style, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)

Default
: _`"wavy"`_

Version
: 4.0.0

---

### `cSpell.textDecorationThickness`

Name
: `cSpell.textDecorationThickness`

Type
: string

Scope
: application

Description
: The CSS line thickness used to decorate issues.

    See: [text-decoration - CSS: Cascading Style Sheets, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
    - thickness - see: [text-decoration-thickness, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness)

    Examples:
    - `auto`
    - `from-font`
    - `0.2rem`
    - `1.5px`
    - `10%`

Default
: _`"auto"`_

Version
: 4.0.0

---

# Advanced

| Setting                                                                                                          | Scope                | Description                                      |
| ---------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------ |
| [`cSpell.advanced.feature.useReferenceProviderRemove`](#cspelladvancedfeatureusereferenceproviderremove)         | language-overridable | Remove Matching Characters Before Rename         |
| [`cSpell.advanced.feature.useReferenceProviderWithRename`](#cspelladvancedfeatureusereferenceproviderwithrename) | language-overridable | Use Reference Provider During Rename             |
| [`cSpell.fixSpellingWithRenameProvider`](#cspellfixspellingwithrenameprovider)                                   | language-overridable | Use Rename Provider when fixing spelling issues. |
| [`cSpell.logFile`](#cspelllogfile)                                                                               | window               | Write Logs to a File                             |
| [`cSpell.logLevel`](#cspellloglevel)                                                                             | window               | Set Logging Level                                |

## Definitions

### `cSpell.advanced.feature.useReferenceProviderRemove`

Name
: `cSpell.advanced.feature.useReferenceProviderRemove` -- Remove Matching Characters Before Rename

Type
: string

Scope
: language-overridable

Description
: Used to work around bugs in Reference Providers and Rename Providers.
Anything matching the provided Regular Expression will be removed from the text
before sending it to the Rename Provider.

    See: [Markdown: Fixing spelling issues in Header sections changes the entire line · Issue #1987](https://github.com/streetsidesoftware/vscode-spell-checker/issues/1987)

    It is unlikely that you would need to edit this setting. If you need to, please open an issue at
    [Spell Checker Issues](https://github.com/streetsidesoftware/vscode-spell-checker/issues)

    This feature is used in connection with `#cSpell.advanced.feature.useReferenceProviderWithRename#`

Default
: _- none -_

---

### `cSpell.advanced.feature.useReferenceProviderWithRename`

Name
: `cSpell.advanced.feature.useReferenceProviderWithRename` -- Use Reference Provider During Rename

Type
: boolean

Scope
: language-overridable

Description
: Use the Reference Provider when fixing spelling issues with the Rename Provider.
This feature is used in connection with `#cSpell.fixSpellingWithRenameProvider#`

Default
: _`false`_

---

### `cSpell.fixSpellingWithRenameProvider`

Name
: `cSpell.fixSpellingWithRenameProvider`

Type
: boolean

Scope
: language-overridable

Description
: Use Rename Provider when fixing spelling issues.

Default
: _`true`_

---

### `cSpell.logFile`

Name
: `cSpell.logFile` -- Write Logs to a File

Type
: string

Scope
: window

Description
: Have the logs written to a file instead of to VS Code.

Default
: _- none -_

---

### `cSpell.logLevel`

Name
: `cSpell.logLevel` -- Set Logging Level

Type
: ( `"None"` \| `"Error"` \| `"Warning"` \| `"Information"` \| `"Debug"` )

    | `None` | Do not log |
    | `Error` | Log only errors |
    | `Warning` | Log errors and warnings |
    | `Information` | Log errors, warnings, and info |
    | `Debug` | Log everything (noisy) |

Scope
: window

Description
: Set the Debug Level for logging messages.

Default
: _`"Error"`_

---

# Experimental

| Setting                                                                                   | Scope       | Description                             |
| ----------------------------------------------------------------------------------------- | ----------- | --------------------------------------- |
| [`cSpell.experimental.enableRegexpView`](#cspellexperimentalenableregexpview)             | application | Show Regular Expression Explorer        |
| [`cSpell.experimental.enableSettingsViewerV2`](#cspellexperimentalenablesettingsviewerv2) | application | Enable the Settings Viewer V2 Extension |

## Definitions

### `cSpell.experimental.enableRegexpView`

Name
: `cSpell.experimental.enableRegexpView`

Type
: boolean

Scope
: application

Description
: Show Regular Expression Explorer

Default
: _`false`_

---

### `cSpell.experimental.enableSettingsViewerV2`

Name
: `cSpell.experimental.enableSettingsViewerV2`

Type
: boolean

Scope
: application

Description
: Enable the Settings Viewer V2 Extension

Default
: _`false`_

---

# Legacy

| Setting                                                  | Scope    | Description                               |
| -------------------------------------------------------- | -------- | ----------------------------------------- |
| [`cSpell.allowCompoundWords`](#cspellallowcompoundwords) | resource | Enable / Disable allowing word compounds. |
| [`cSpell.enabledLanguageIds`](#cspellenabledlanguageids) | resource | Enabled Language Ids                      |

## Definitions

### `cSpell.allowCompoundWords`

Name
: `cSpell.allowCompoundWords`

Type
: boolean

Scope
: resource

Description
: Enable / Disable allowing word compounds. - `true` means `arraylength` would be ok - `false` means it would not pass.

    Note: this can also cause many misspelled words to seem correct.

Default
: _`false`_

---

### ~~`cSpell.customFolderDictionaries`~~

Name
: ~~`cSpell.customFolderDictionaries`~~ -- Custom Folder Dictionaries

Type
: []

Scope
: resource

Description
: Define custom dictionaries to be included by default for the folder.
If `addWords` is `true` words will be added to this dictionary.

Deprecation Message
: - Use `#cSpell.customDictionaries#` instead.

Default
: _- none -_

---

### ~~`cSpell.customUserDictionaries`~~

Name
: ~~`cSpell.customUserDictionaries`~~ -- Custom User Dictionaries

Type
: []

Scope
: application

Description
: Define custom dictionaries to be included by default for the user.
If `addWords` is `true` words will be added to this dictionary.

Deprecation Message
: - Use `#cSpell.customDictionaries#` instead.

Default
: _- none -_

---

### ~~`cSpell.customWorkspaceDictionaries`~~

Name
: ~~`cSpell.customWorkspaceDictionaries`~~ -- Custom Workspace Dictionaries

Type
: []

Scope
: resource

Description
: Define custom dictionaries to be included by default for the workspace.
If `addWords` is `true` words will be added to this dictionary.

Deprecation Message
: - Use `#cSpell.customDictionaries#` instead.

Default
: _- none -_

---

### `cSpell.enabledLanguageIds`

Name
: `cSpell.enabledLanguageIds` -- Enabled Language Ids

Type
: string[]

Scope
: resource

Description
: Specify a list of file types to spell check. It is better to use `#cSpell.enableFiletypes#` to Enable / Disable checking files types.

Default
: [ _`"asciidoc"`_, _`"bat"`_, _`"c"`_, _`"clojure"`_, _`"coffeescript"`_, _`"cpp"`_, _`"csharp"`_, _`"css"`_, _`"dart"`_, _`"diff"`_, _`"dockerfile"`_, _`"elixir"`_, _`"erlang"`_, _`"fsharp"`_, _`"git-commit"`_, _`"git-rebase"`_, _`"github-actions-workflow"`_, _`"go"`_, _`"graphql"`_, _`"groovy"`_, _`"handlebars"`_, _`"haskell"`_, _`"html"`_, _`"ini"`_, _`"jade"`_, _`"java"`_, _`"javascript"`_, _`"javascriptreact"`_, _`"json"`_, _`"jsonc"`_, _`"julia"`_, _`"jupyter"`_, _`"latex"`_, _`"less"`_, _`"lua"`_, _`"makefile"`_, _`"markdown"`_, _`"objective-c"`_, _`"perl"`_, _`"perl6"`_, _`"php"`_, _`"plaintext"`_, _`"powershell"`_, _`"properties"`_, _`"pug"`_, _`"python"`_, _`"r"`_, _`"razor"`_, _`"restructuredtext"`_, _`"ruby"`_, _`"rust"`_, _`"scala"`_, _`"scminput"`_, _`"scss"`_, _`"shaderlab"`_, _`"shellscript"`_, _`"sql"`_, _`"swift"`_, _`"text"`_, _`"typescript"`_, _`"typescriptreact"`_, _`"vb"`_, _`"vue"`_, _`"xml"`_, _`"xsl"`_, _`"yaml"`_ ]

---
