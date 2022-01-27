<!--- AUTO-GENERATED ALL CHANGES WILL BE LOST --->

# Configuration Settings

## Settings in VS Code

| Command                                                                                           | Scope                | Description                                                                                              |
| ------------------------------------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| [`cSpell.allowCompoundWords`](#cspellallowcompoundwords)                                          | resource             | Enable / Disable allowing word compounds. `true` means `arraylength` would be ok, `false` means…         |
| [`cSpell.allowedSchemas`](#cspellallowedschemas)                                                  | window               | Control which file schemas will be checked for spelling (VS Code must be restarted for this…             |
| [`cSpell.blockCheckingWhenAverageChunkSiz…`](#cspellblockcheckingwhenaveragechunksizegreaterthan) | language-overridable | The maximum average length of chunks of text without word breaks.                                        |
| [`cSpell.blockCheckingWhenLineLengthGreat…`](#cspellblockcheckingwhenlinelengthgreaterthan)       | language-overridable | The maximum line length.                                                                                 |
| [`cSpell.blockCheckingWhenTextChunkSizeGr…`](#cspellblockcheckingwhentextchunksizegreaterthan)    | language-overridable | The maximum length of a chunk of text without word breaks.                                               |
| [`cSpell.caseSensitive`](#cspellcasesensitive)                                                    | resource             | Determines if words must match case and accent rules.                                                    |
| [`cSpell.checkLimit`](#cspellchecklimit)                                                          | resource             | The limit in K-Characters to be checked in a file.                                                       |
| [`cSpell.customDictionaries`](#cspellcustomdictionaries)                                          | resource             | Custom Dictionaries                                                                                      |
| [`cSpell.diagnosticLevel`](#cspelldiagnosticlevel)                                                | resource             | Issues found by the spell checker are marked with a Diagnostic Severity Level. This affects…             |
| [`cSpell.dictionaries`](#cspelldictionaries)                                                      | resource             | Optional list of dictionaries to use. Each entry should match the name of the dictionary. To…            |
| [`cSpell.dictionaryDefinitions`](#cspelldictionarydefinitions)                                    | resource             | Define additional available dictionaries.                                                                |
| [`cSpell.enabled`](#cspellenabled)                                                                | resource             | Enable / Disable the spell checker.                                                                      |
| [`cSpell.enabledLanguageIds`](#cspellenabledlanguageids)                                          | resource             | Enabled Language Ids                                                                                     |
| [`cSpell.enableFiletypes`](#cspellenablefiletypes)                                                | resource             | File Types to Check                                                                                      |
| [`cSpell.experimental.enableRegexpView`](#cspellexperimentalenableregexpview)                     | application          | Show Regular Expression Explorer                                                                         |
| [`cSpell.files`](#cspellfiles)                                                                    | resource             | Glob patterns of files to be checked. Glob patterns are relative to the `globRoot` of the configuration… |
| [`cSpell.fixSpellingWithRenameProvider`](#cspellfixspellingwithrenameprovider)                    | language-overridable | Use Rename when fixing spelling issues.                                                                  |
| [`cSpell.flagWords`](#cspellflagwords)                                                            | resource             | List of words to always be considered incorrect.                                                         |
| [`cSpell.globRoot`](#cspellglobroot)                                                              | resource             | The root to use for glop patterns found in this configuration. Default: The current workspace…           |
| [`cSpell.ignorePaths`](#cspellignorepaths)                                                        | resource             | Glob patterns of files to be ignored                                                                     |
| [`cSpell.ignoreRegExpList`](#cspellignoreregexplist)                                              | resource             | List of RegExp patterns or Pattern names to exclude from spell checking.                                 |
| [`cSpell.ignoreWords`](#cspellignorewords)                                                        | resource             | A list of words to be ignored by the spell checker.                                                      |
| [`cSpell.import`](#cspellimport)                                                                  | resource             | Other settings files to be included.                                                                     |
| [`cSpell.includeRegExpList`](#cspellincluderegexplist)                                            | resource             | List of RegExp patterns or defined Pattern names to define the text to be included for spell…            |
| [`cSpell.language`](#cspelllanguage)                                                              | resource             | Current active spelling language.                                                                        |
| [`cSpell.languageSettings`](#cspelllanguagesettings)                                              | resource             | Additional settings for individual programming languages and locales.                                    |
| [`cSpell.logLevel`](#cspellloglevel)                                                              | window               | Set the Debug Level for logging messages.                                                                |
| [`cSpell.maxDuplicateProblems`](#cspellmaxduplicateproblems)                                      | resource             | The maximum number of times the same word can be flagged as an error in a file.                          |
| [`cSpell.maxNumberOfProblems`](#cspellmaxnumberofproblems)                                        | resource             | Controls the maximum number of spelling errors per document.                                             |
| [`cSpell.minWordLength`](#cspellminwordlength)                                                    | resource             | The minimum length of a word before checking it against a dictionary.                                    |
| [`cSpell.noConfigSearch`](#cspellnoconfigsearch)                                                  | resource             | Prevents searching for local configuration when checking individual documents.                           |
| [`cSpell.noSuggestDictionaries`](#cspellnosuggestdictionaries)                                    | resource             | Optional list of dictionaries that will not be used for suggestions. Words in these dictionaries…        |
| [`cSpell.numSuggestions`](#cspellnumsuggestions)                                                  | resource             | Controls the number of suggestions shown.                                                                |
| [`cSpell.overrides`](#cspelloverrides)                                                            | resource             | Overrides to apply based upon the file path.                                                             |
| [`cSpell.patterns`](#cspellpatterns)                                                              | resource             | Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList.                   |
| [`cSpell.showAutocompleteSuggestions`](#cspellshowautocompletesuggestions)                        | language-overridable | Show CSpell in-document directives as you type.                                                          |
| [`cSpell.showCommandsInEditorContextMenu`](#cspellshowcommandsineditorcontextmenu)                | application          | Show Spell Checker actions in Editor Context Menu                                                        |
| [`cSpell.showStatus`](#cspellshowstatus)                                                          | application          | Display the spell checker status on the status bar.                                                      |
| [`cSpell.showStatusAlignment`](#cspellshowstatusalignment)                                        | application          | The side of the status bar to display the spell checker status.                                          |
| [`cSpell.spellCheckDelayMs`](#cspellspellcheckdelayms)                                            | application          | Delay in ms after a document has changed before checking it for spelling errors.                         |
| [`cSpell.spellCheckOnlyWorkspaceFiles`](#cspellspellcheckonlyworkspacefiles)                      | window               | Spell Check Only Workspace Files                                                                         |
| [`cSpell.suggestionMenuType`](#cspellsuggestionmenutype)                                          | resource             | The type of menu used to display spelling suggestions.                                                   |
| [`cSpell.suggestionNumChanges`](#cspellsuggestionnumchanges)                                      | resource             | The maximum number of changes allowed on a word to be considered a suggestions.                          |
| [`cSpell.suggestionsTimeout`](#cspellsuggestionstimeout)                                          | resource             | The maximum amount of time in milliseconds to generate suggestions for a word.                           |
| [`cSpell.useGitignore`](#cspellusegitignore)                                                      | window               | Tells the spell checker to load `.gitignore` files and skip files that match the globs in the…           |
| [`cSpell.usePnP`](#cspellusepnp)                                                                  | resource             | Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading packages stored in…             |
| [`cSpell.userWords`](#cspelluserwords)                                                            | resource             | Words to add to global dictionary -- should only be in the user config file.                             |
| [`cSpell.words`](#cspellwords)                                                                    | resource             | List of words to be always considered correct.                                                           |
| [`cSpell.workspaceRootPath`](#cspellworkspacerootpath)                                            | resource             | Workspace Root Folder Path                                                                               |

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

### `cSpell.allowedSchemas`

Name
: `cSpell.allowedSchemas`

Type
: string[]

Scope
: window

Description
: Control which file schemas will be checked for spelling (VS Code must be restarted for this setting to take effect).

    Some schemas have special meaning like:
    - `untitled` - Used for new documents that have not yet been saved
    - `vscode-notebook-cell` - Used for validating segments of a Notebook.

Default
: [ _`"file"`_, _`"gist"`_, _`"sftp"`_, _`"untitled"`_, _`"vscode-notebook-cell"`_ ]

---

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

### `cSpell.caseSensitive`

Name
: `cSpell.caseSensitive`

Type
: boolean

Scope
: resource

Description
: Turns on case sensitive checking by default

Default
: _- none -_

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
: - Use `customDictionaries` instead.

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
: - Use `customDictionaries` instead.

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
: - Use `customDictionaries` instead.

Default
: _- none -_

---

### `cSpell.diagnosticLevel`

Name
: `cSpell.diagnosticLevel`

Type
: ( `"Error"` \| `"Warning"` \| `"Information"` \| `"Hint"` )

    | `Error` | Report Spelling Issues as Errors |
    | `Warning` | Report Spelling Issues as Warnings |
    | `Information` | Report Spelling Issues as Information |
    | `Hint` | Report Spelling Issues as Hints, will not show up in Problems |

Scope
: resource

Description
: Issues found by the spell checker are marked with a Diagnostic Severity Level. This affects the color of squiggle.

Default
: _`"Information"`_

---

### `cSpell.dictionaries`

Name
: `cSpell.dictionaries`

Type
: string[]

Scope
: resource

Description
: Optional list of dictionaries to use. Each entry should match the name of the dictionary. To remove a dictionary from the list add `!` before the name. i.e. `!typescript` will turn off the dictionary with the name `typescript`.

Default
: _- none -_

---

### `cSpell.dictionaryDefinitions`

Name
: `cSpell.dictionaryDefinitions`

Type
: []

Scope
: resource

Description
: Define additional available dictionaries.

Default
: _- none -_

---

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

### `cSpell.enabledLanguageIds`

Name
: `cSpell.enabledLanguageIds` -- Enabled Language Ids

Type
: string[]

Scope
: resource

Description
: Specify a list of file types to spell check. It is better to use `cSpell.enableFiletypes` to Enable / Disable checking files types.

Default
: [ _`"asciidoc"`_, _`"c"`_, _`"cpp"`_, _`"csharp"`_, _`"css"`_, _`"git-commit"`_, _`"go"`_, _`"graphql"`_, _`"handlebars"`_, _`"haskell"`_, _`"html"`_, _`"jade"`_, _`"java"`_, _`"javascript"`_, _`"javascriptreact"`_, _`"json"`_, _`"jsonc"`_, _`"jupyter"`_, _`"latex"`_, _`"less"`_, _`"markdown"`_, _`"php"`_, _`"plaintext"`_, _`"python"`_, _`"pug"`_, _`"restructuredtext"`_, _`"rust"`_, _`"scala"`_, _`"scss"`_, _`"swift"`_, _`"text"`_, _`"typescript"`_, _`"typescriptreact"`_, _`"vue"`_, _`"yaml"`_, _`"yml"`_ ]

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
These are in additional to the file types specified by `cSpell.enabledLanguageIds`.
To disable a language, prefix with `!` as in `!json`,

    Example:
    ```
    jsonc       // enable checking for jsonc
    !json       // disable checking for json
    kotlin      // enable checking for kotlin
    ```

Default
: _- none -_

---

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

### `cSpell.files`

Name
: `cSpell.files`

Type
: string[]

Scope
: resource

Description
: Glob patterns of files to be checked. Glob patterns are relative to the `globRoot` of the configuration file that defines them.

Default
: _- none -_

---

### `cSpell.fixSpellingWithRenameProvider`

Name
: `cSpell.fixSpellingWithRenameProvider`

Type
: boolean

Scope
: language-overridable

Description
: Use Rename when fixing spelling issues.

Default
: _`true`_

---

### `cSpell.flagWords`

Name
: `cSpell.flagWords`

Type
: string[]

Scope
: resource

Description
: List of words to always be considered incorrect.

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
: The root to use for glop patterns found in this configuration. Default: The current workspace folder. Use `globRoot` to define a different location. `globRoot` can be relative to the location of this configuration file. Defining globRoot, does not impact imported configurations.

    Special Values:

    - `${workspaceFolder}` - Default - globs will be relative to the current workspace folder\n
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
: Glob patterns of files to be ignored. The patterns are relative to the `globRoot` of the configuration file that defines them.

Default
: [ _`"package-lock.json"`_, _`"node_modules"`_, _`"vscode-extension"`_, _`".git/objects"`_, _`".vscode"`_, _`".vscode-insiders"`_ ]

---

### `cSpell.ignoreRegExpList`

Name
: `cSpell.ignoreRegExpList`

Type
: string[]

Scope
: resource

Description
: List of RegExp patterns or Pattern names to exclude from spell checking.

    Example: ["href"] - to exclude html href.

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

### `cSpell.import`

Name
: `cSpell.import`

Type
: string[]

Scope
: resource

Description
: Other settings files to be included.

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
: List of RegExp patterns or defined Pattern names to define the text to be included for spell checking. If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.

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

### `cSpell.logLevel`

Name
: `cSpell.logLevel`

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
: _`5`_

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

### `cSpell.noSuggestDictionaries`

Name
: `cSpell.noSuggestDictionaries`

Type
: string[]

Scope
: resource

Description
: Optional list of dictionaries that will not be used for suggestions. Words in these dictionaries are considered correct, but will not be used when making spell correction suggestions.

    Note: if a word is suggested by another dictionary, but found in one of these dictionaries, it will be removed from the set of possible suggestions.

Default
: _- none -_

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

### `cSpell.overrides`

Name
: `cSpell.overrides`

Type
: object[]

Scope
: resource

Description
: Overrides to apply based upon the file path.

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
: Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList.

Default
: _- none -_

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

### `cSpell.spellCheckOnlyWorkspaceFiles`

Name
: `cSpell.spellCheckOnlyWorkspaceFiles` -- Spell Check Only Workspace Files

Type
: boolean

Scope
: window

Description
: Only spell check files that are in the currently open workspace.
This same effect can be achieved using the `files` setting.

    ```
    "cSpell.files": ["**", "**/.*", "**/.*/**"]
    ```

Default
: _`false`_

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

### `cSpell.useGitignore`

Name
: `cSpell.useGitignore`

Type
: boolean

Scope
: window

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
: Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading packages stored in the repository.

    When true, the spell checker will search up the directory structure for the existence of a PnP file and load it.

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
: List of words to be always considered correct.

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

    Example: use the `client` folder
    ```
    ${workspaceFolder:client}
    ```

Default
: _- none -_

---
