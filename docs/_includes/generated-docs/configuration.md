<!--- AUTO-GENERATED ALL CHANGES WILL BE LOST --->

# Configuration Settings

## Settings in VS Code

| Command                                                                                                        | Description                                                                                                |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`cSpell.allowCompoundWords`](#cspellallowcompoundwords)                                                       | Enable / Disable allowing word compounds. `true` means `arraylength` would be ok, `false` means...         |
| [`cSpell.allowedSchemas`](#cspellallowedschemas)                                                               | Control which file schemas will be checked for spelling (VS Code must be restarted for this...             |
| [`cSpell.blockCheckingWhenAverageChunkSizeGreatherThan`](#cspellblockcheckingwhenaveragechunksizegreatherthan) | The maximum average chunk of text size. A chunk is the characters between absolute word breaks....         |
| [`cSpell.blockCheckingWhenLineLengthGreaterThan`](#cspellblockcheckingwhenlinelengthgreaterthan)               | The maximum line length                                                                                    |
| [`cSpell.blockCheckingWhenTextChunkSizeGreaterThan`](#cspellblockcheckingwhentextchunksizegreaterthan)         | The maximum size of text chunks                                                                            |
| [`cSpell.caseSensitive`](#cspellcasesensitive)                                                                 | Words must match case rules.                                                                               |
| [`cSpell.checkLimit`](#cspellchecklimit)                                                                       | The limit in K-Characters to be checked in a file.                                                         |
| [`cSpell.customDictionaries`](#cspellcustomdictionaries)                                                       | Custom Dictionaries                                                                                        |
| [`cSpell.diagnosticLevel`](#cspelldiagnosticlevel)                                                             | Issues found by the spell checker are marked with a Diagnostic Severity Level. This affects...             |
| [`cSpell.dictionaries`](#cspelldictionaries)                                                                   | Optional list of dictionaries to use. Each entry should match the name of the dictionary. To...            |
| [`cSpell.dictionaryDefinitions`](#cspelldictionarydefinitions)                                                 | Define additional available dictionaries                                                                   |
| [`cSpell.enabled`](#cspellenabled)                                                                             | Enable / Disable the spell checker.                                                                        |
| [`cSpell.enabledLanguageIds`](#cspellenabledlanguageids)                                                       | Enabled Language Ids                                                                                       |
| [`cSpell.enableFiletypes`](#cspellenablefiletypes)                                                             | File Types to Check                                                                                        |
| [`cSpell.experimental.enableRegexpView`](#cspellexperimentalenableregexpview)                                  | Show Regular Expression Explorer                                                                           |
| [`cSpell.files`](#cspellfiles)                                                                                 | Glob patterns of files to be checked. Glob patterns are relative to the `globRoot` of the configuration... |
| [`cSpell.fixSpellingWithRenameProvider`](#cspellfixspellingwithrenameprovider)                                 | Use Rename when fixing spelling issues.                                                                    |
| [`cSpell.flagWords`](#cspellflagwords)                                                                         | list of words to always be considered incorrect.                                                           |
| [`cSpell.globRoot`](#cspellglobroot)                                                                           | The root to use for glop patterns found in this configuration. Default: The current workspace...           |
| [`cSpell.ignorePaths`](#cspellignorepaths)                                                                     | Glob patterns of files to be ignored                                                                       |
| [`cSpell.ignoreRegExpList`](#cspellignoreregexplist)                                                           | List of RegExp patterns or Pattern names to exclude from spell checking.                                   |
| [`cSpell.ignoreWords`](#cspellignorewords)                                                                     | A list of words to be ignored by the spell checker.                                                        |
| [`cSpell.import`](#cspellimport)                                                                               | Other settings files to be included                                                                        |
| [`cSpell.includeRegExpList`](#cspellincluderegexplist)                                                         | List of RegExp patterns or defined Pattern names to define the text to be included for spell...            |
| [`cSpell.language`](#cspelllanguage)                                                                           | Current active spelling language.                                                                          |
| [`cSpell.languageSettings`](#cspelllanguagesettings)                                                           | Additional settings for individual languages.                                                              |
| [`cSpell.logLevel`](#cspellloglevel)                                                                           | Set the Debug Level for logging messages.                                                                  |
| [`cSpell.maxDuplicateProblems`](#cspellmaxduplicateproblems)                                                   | The maximum number of times the same word can be flagged as an error in a file.                            |
| [`cSpell.maxNumberOfProblems`](#cspellmaxnumberofproblems)                                                     | Controls the maximum number of spelling errors per document.                                               |
| [`cSpell.minWordLength`](#cspellminwordlength)                                                                 | The minimum length of a word before checking it against a dictionary.                                      |
| [`cSpell.noConfigSearch`](#cspellnoconfigsearch)                                                               | Prevents searching for local configuration when checking individual documents.                             |
| [`cSpell.noSuggestDictionaries`](#cspellnosuggestdictionaries)                                                 | Optional list of dictionaries that will not be used for suggestions. Words in these dictionaries...        |
| [`cSpell.numSuggestions`](#cspellnumsuggestions)                                                               | Controls the number of suggestions shown.                                                                  |
| [`cSpell.overrides`](#cspelloverrides)                                                                         | Overrides to apply based upon the file path.                                                               |
| [`cSpell.patterns`](#cspellpatterns)                                                                           | Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList                      |
| [`cSpell.showCommandsInEditorContextMenu`](#cspellshowcommandsineditorcontextmenu)                             | Show Spell Checker actions in Editor Context Menu                                                          |
| [`cSpell.showStatus`](#cspellshowstatus)                                                                       | Display the spell checker status on the status bar.                                                        |
| [`cSpell.showStatusAlignment`](#cspellshowstatusalignment)                                                     | The side of the status bar to display the spell checker status.                                            |
| [`cSpell.spellCheckDelayMs`](#cspellspellcheckdelayms)                                                         | Delay in ms after a document has changed before checking it for spelling errors.                           |
| [`cSpell.spellCheckOnlyWorkspaceFiles`](#cspellspellcheckonlyworkspacefiles)                                   | Spell Check Only Workspace Files                                                                           |
| [`cSpell.suggestionMenuType`](#cspellsuggestionmenutype)                                                       | The type of menu used to display spelling suggestions.                                                     |
| [`cSpell.usePnP`](#cspellusepnp)                                                                               | Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading packages stored in...             |
| [`cSpell.userWords`](#cspelluserwords)                                                                         | Words to add to global dictionary -- should only be in the user config file.                               |
| [`cSpell.words`](#cspellwords)                                                                                 | list of words to be always considered correct                                                              |
| [`cSpell.workspaceRootPath`](#cspellworkspacerootpath)                                                         | Workspace Root Folder Path                                                                                 |

## Definitions

### `cSpell.allowCompoundWords`

Name
: `cSpell.allowCompoundWords`

Type
: boolean

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

Description
: Control which file schemas will be checked for spelling (VS Code must be restarted for this setting to take effect).

Default
: [ _`"file"`_, _`"gist"`_, _`"sftp"`_, _`"untitled"`_ ]

---

### `cSpell.blockCheckingWhenAverageChunkSizeGreatherThan`

Name
: `cSpell.blockCheckingWhenAverageChunkSizeGreatherThan`

Type
: number

Description
: The maximum average chunk of text size. A chunk is the characters between absolute word breaks. Absolute word breaks match: `/[\s,{}[\]]/`

Default
: _`40`_

---

### `cSpell.blockCheckingWhenLineLengthGreaterThan`

Name
: `cSpell.blockCheckingWhenLineLengthGreaterThan`

Type
: number

Description
: The maximum line length

Default
: _`1000`_

---

### `cSpell.blockCheckingWhenTextChunkSizeGreaterThan`

Name
: `cSpell.blockCheckingWhenTextChunkSizeGreaterThan`

Type
: number

Description
: The maximum size of text chunks

Default
: _`200`_

---

### `cSpell.caseSensitive`

Name
: `cSpell.caseSensitive`

Type
: boolean

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

Description
: Define custom dictionaries to be included by default for the folder.
If `addWords` is `true` words will be added to this dictionary.

    **Example:**

    ```js
    customDictionaries: {
      "project-words": {
        "name": "project-words",
        "path": "${workspaceRoot}/project-words.txt",
        "description": "Words used in this project",
        "addWords": true
      }
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

Description
: Define additional available dictionaries

Default
: _- none -_

---

### `cSpell.enabled`

Name
: `cSpell.enabled`

Type
: boolean

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

Description
: Specify a list of file types to spell check. It is better to use `cSpell.enableFiletypes` to Enable / Disable checking files types.

Default
: [ _`"asciidoc"`_, _`"c"`_, _`"cpp"`_, _`"csharp"`_, _`"css"`_, _`"git-commit"`_, _`"go"`_, _`"graphql"`_, _`"handlebars"`_, _`"haskell"`_, _`"html"`_, _`"jade"`_, _`"java"`_, _`"javascript"`_, _`"javascriptreact"`_, _`"json"`_, _`"jsonc"`_, _`"latex"`_, _`"less"`_, _`"markdown"`_, _`"php"`_, _`"plaintext"`_, _`"python"`_, _`"pug"`_, _`"restructuredtext"`_, _`"rust"`_, _`"scala"`_, _`"scss"`_, _`"text"`_, _`"typescript"`_, _`"typescriptreact"`_, _`"yaml"`_, _`"yml"`_ ]

---

### `cSpell.enableFiletypes`

Name
: `cSpell.enableFiletypes` -- File Types to Check

Type
: string[]

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

Description
: list of words to always be considered incorrect.

Default
: _- none -_

---

### `cSpell.globRoot`

Name
: `cSpell.globRoot`

Type
: string

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

Description
: List of RegExp patterns or Pattern names to exclude from spell checking.

    Example: ["href"] - to exclude html href

Default
: _- none -_

---

### `cSpell.ignoreWords`

Name
: `cSpell.ignoreWords`

Type
: string[]

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

Description
: Other settings files to be included

Default
: _- none -_

---

### `cSpell.includeRegExpList`

Name
: `cSpell.includeRegExpList`

Type
: string[]

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

Description
: Additional settings for individual languages.

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

Description
: Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList

Default
: _- none -_

---

### `cSpell.showCommandsInEditorContextMenu`

Name
: `cSpell.showCommandsInEditorContextMenu`

Type
: boolean

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

Description
: Only spell check files that are in the currently open workspace.
This same effect can be achieved using the `files` setting.

    ```
    "cSpell.files": ["**", "**/.*", "**/.*/**"]
    ```

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

Description
: The type of menu used to display spelling suggestions.

Default
: _`"quickPick"`_

---

### `cSpell.usePnP`

Name
: `cSpell.usePnP`

Type
: boolean

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

Description
: list of words to be always considered correct

Default
: _- none -_

---

### `cSpell.workspaceRootPath`

Name
: `cSpell.workspaceRootPath` -- Workspace Root Folder Path

Type
: string

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
