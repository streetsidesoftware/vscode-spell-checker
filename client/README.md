# Spelling Checker for Visual Studio Code
[![Current Version](http://vsmarketplacebadge.apphb.com/version/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
[![Install Count](http://vsmarketplacebadge.apphb.com/installs/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
[![Open Issues](http://vsmarketplacebadge.apphb.com/rating/streetsidesoftware.code-spell-checker.svg) ](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

A basic spell checker that works well with camelCase code.

## Functionality

Load a Typescript, Javascript, Text, etc.. file.  Words not in the dictionary files will have
a squiggly underline.

#### Example
![Example](https://raw.githubusercontent.com/Jason-Rev/vscode-spell-checker/master/client/images/example.gif)

#### Suggestions
![Example](https://raw.githubusercontent.com/Jason-Rev/vscode-spell-checker/master/client/images/suggestions.gif)


## Install

Open up VS Code and hit `F1` and type `ext` select install and type `code-spell-checker` hit enter and reload window to enable.

## Supported Languages

* English

## Enabled File Types
* Typescript
* Javascript
* Text
* Markdown
* C#
* Go
* PHP
* Python

## How it works with camelCase

The concept is simple, split camelCase words before checking them against a list of known English words.
* camelCase -> camel case
* HTMLInput -> html input
* srcCode -> src code
* snake_case_words -> snake case words
* camel2snake -> camel snake -- (the 2 is ignored)

## Things to note

* This spellchecker is case insensitive.  It will not catch errors like english which should be English.
* The spellchecker uses a local word dictionary.  It does not send anything outside your machine.
* The words in the dictionary can and do contain errors.
* There are missing words.
* Only words longer than 3 characters are checked.  "jsj" is ok, while "jsja" is not.
* All symbols and punctuation are ignored.

## In Document Settings

It is possible to add spell check settings into your source code.
This is to help with file specific issues that may not be applicable to the entire project.

All settings are prefixed with `cSpell:` or `spell-checker:`.

* `disable` -- turn off the spell checker for a section of code.
* `enable` -- turn the spell checker back on after it has been turned off.
* `ignore` -- specify a list of words to be ignored.
* `words` -- specify a list of words to be considered correct and will appear in the suggestions list.
* `ignoreRegExp` -- Any text matching the regular expression will NOT be checked for spelling.
* `includeRegExp` -- Only text matching the collection of includeRegExp will be checked.
* `enableCompoundWords` / `disableCompoundWords` -- Allow / disallow words like: "stringlength".

### Enable / Disable checking sections of code
It is possible to disable / enable the spell checker by adding comments to your code.

#### Disable Checking
* `/* cSpell:disable */`
* `/* spell-checker: disable */`
* `/* spellchecker: disable */`
<!--- cSpell:enable -->


#### Enable Checking
* `/* cSpell:enable */`
* `/* spell-checker: enable */`
* `/* spellchecker: enable */`

#### Example

```javascript

// cSpell:disable
const wackyWord = ['zaallano', 'wooorrdd', 'zzooommmmmmmm'];
/* cSpell:enable */

// Nest disable / enable is not Supported

// spell-checker:disable
// It is now disabled.

var liep = 1;

/* cspell:disable */
// It is still disabled

// cSpell:enable
// It is now enabled

const str = "goededag";  // <- will be flagged as an error.

// spell-checker:enable <- doesn't do anything

// cSPELL:DISABLE <-- also works.

// if there isn't an enable, spelling is disabled till the end of the file.
const str = "goedemorgen";  // <- will NOT be flagged as an error.

```
<!--- cSpell:enable -->

### Ignore

Ignore allows you the specify a list of words you want to ignore within the document.

```javascript
// cSpell:ignore zaallano, wooorrdd
// cSpell:ignore zzooommmmmmmm
const wackyWord = ['zaallano', 'wooorrdd', 'zzooommmmmmmm'];
```

**Note:** words defined with `ignore` will be ignored for the entire file.

### Words

The words list allows you to add words that will be considered correct and will be used as suggestions.

```javascript
// cSpell:words woorxs sweeetbeat
const companyName = 'woorxs sweeetbeat';
```

**Note:** words defined with `words` will be used for the entire file.

### Enable / Disable compound words

In some programing language it is common to glue words together.

```c
// cSpell:enableCompoundWords
char * errormessage;  // Is ok with cSpell:enableCompoundWords
int    errornumber;   // Is also ok.
```

**Note:** Compound word checking cannot be turned on / off in the same file.
The last setting in the file determines the value for the entire file.

### Excluding and Including Text to be checked.

By default, the entire document is checked for spelling.
`cSpell:disable`/`cSpell:enable` above allows you to block off sections of the document.
`ignoreRegExp` and `includeRegExp` give you the ability to ignore or include patterns of text.
By default the flags `gim` are added if no flags are given.

The spell checker works in the following way:
1. Find all text matching `includeRegExp`
2. Remove any text matching `excludeRegExp`
3. Check the remaining text.

#### Exclude Example

```javascript
// cSpell:ignoreRegExp 0x[0-9a-f]+     -- will ignore c style hex numbers
// cSpell:ignoreRegExp /0x[0-9A-F]+/g  -- will ignore upper case c style hex numbers.
// cSpell:ignoreRegExp g{5} h{5}       -- will only match ggggg, but not hhhhh or 'ggggg hhhhh'
// cSpell:ignoreRegExp g{5}|h{5}       -- will match both ggggg and hhhhh
// cSpell:ignoreRegExp /g{5} h{5}/     -- will match 'ggggg hhhhh'
/* cSpell:ignoreRegExp /n{5}/          -- will NOT work as expected because of the ending comment -> */
/*
   cSpell:ignoreRegExp /q{5}/          -- will match qqqqq just fine but NOT QQQQQ
*/
// cSpell:ignoreRegExp /[^\s]{40,}/    -- will ignore long strings with no spaces.
// cSpell:ignoreRegExp Email           -- this will ignore email like patterns -- see Predefined RegExp expressions
var encodedImage = 'HR+cPzr7XGAOJNurPL0G8I2kU0UhKcqFssoKvFTR7z0T3VJfK37vS025uKroHfJ9nA6WWbHZ/ASn...';
var email1 = 'emailaddress@myfancynewcompany.com';
var email2 = '<emailaddress@myfancynewcompany.com>';
```

**Note:** ignoreRegExp and includeRegExp are applied to the entire file.  They do not start and stop.

#### Include Example

In general you should not need to use `includeRegExp`. But if you are mixing languages then it could come in helpful.

<!--- cSpell:ignore variabele alinea -->
```Python
# cSpell:includeRegExp #.*
# cSpell:includeRegExp ("""|''')[^\1]*\1
# only comments and block strings will be checked for spelling.
def sum_it(self, seq):
    """This is checked for spelling"""
    variabele = 0
    alinea = 'this is not checked'
    for num in seq:
        # The local state of 'value' will be retained between iterations
        variabele += num
        yield variabele
```


## Predefined RegExp expressions

### Exclude patterns
* `Urls`<sup>1</sup> -- Matches urls
* `HexDigits` -- Matches hex digits: `/^x?[0-1a-f]+$/i`
* `HexValues` -- Matches common hex format like #aaa, 0xfeef, \\u0134
* `EscapeCharacters`<sup>1</sup> -- matches special characters: '\\n', '\\t' etc.
* `Base64`<sup>1</sup> -- matches base64 blocks of text longer than 40 characters.
* `Email` -- matches most email addresses.

### Include Patterns
* `Everything`<sup>1</sup> -- By default we match an entire document and remove the excludes.
* `string` -- This matches common string formats like '...', "...", and \`...\`
* `CStyleComment` -- These are C Style comments /* */ and //
* `PhpHereDoc` -- This matches PHPHereDoc strings.

<sup>1.</sup> These patterns are part of the default include/exclude list for every file.

## Customization

### Adding words to the Workspace Dictionary

You have the option to add you own words to the workspace dictionary.  The easiest, is to put your cursor
on the word you wish to add, when you light-bulb shows up, hit `Ctrl+.` (windows) / `Cmd+.` (Mac).  You will get a list
of suggestions and the option to add the word.

You can also type in a word you want to add to the dictionary: `F1` `add word` -- select `Add Word to Dictionary` and type in the word you wish to add.

### cSpell.json

Words added to the dictionary are placed in the `cSpell.json` file in the `.vscode` folder found in the _workspace_.
Note, the settings in cSpell.json will override the equivalent cSpell settings in settings.json.

#### Example _cSpell.json_ file
<!--- cSpell:ignore mkdirp githubusercontent streetsidesoftware vsmarketplacebadge visualstudio -->
```javascript
// cSpell Settings
{
    // Version of the setting file.  Always 0.1
    "version": "0.1",
    // language - current active spelling language
    "language": "en",
    // words - list of words to be always considered correct
    "words": [
        "mkdirp",
        "tsmerge",
        "githubusercontent",
        "streetsidesoftware",
        "vsmarketplacebadge",
        "visualstudio"
    ],
    // flagWords - list of words to be always considered incorrect
    // This is useful for offensive words and common spelling errors.
    // For example "hte" should be "the"
    "flagWords": [
        "hte"
    ]
}
```

### Configuration Settings

```javascript
    //-------- Code Spell Checker Configuration --------

    // Controls the maximum number of spelling errors per document.
    "cSpell.maxNumberOfProblems": 100,

    // Controls the number of suggestions shown.
    "cSpell.numSuggestions": 8,

    // The minimum length of a word before checking it against a dictionary.
    "cSpell.minWordLength": 4,

    // Specify file types to spell check.
    "cSpell.enabledLanguageIds": [
        "csharp",
        "go",
        "javascript",
        "javascriptreact",
        "markdown",
        "php",
        "plaintext",
        "text",
        "typescript",
        "typescriptreact",
        "yml"
    ],

    // Enable / Disable the spell checker.
    "cSpell.enabled": true,

    // Display the spell checker status on the status bar.
    "cSpell.showStatus": true,

    // Words to add to dictionary for a workspace.
    "cSpell.words": [],

    // Enable / Disable compound words like 'errormessage'
    "cSpell.allowCompoundWords": false,

    // Words to be ignored and not suggested.
    "cSpell.ignoreWords": ["behaviour"],

    // User words to add to dictionary.  Should only be in the user settings.
    "cSpell.userWords": [],

    // Specify paths/files to ignore.
    "cSpell.ignorePaths": [
        "node_modules",        // this will ignore anything the node_modules directory
        "**/node_modules",     // the same for this one
        "**/node_modules/**",  // the same for this one
        "node_modules/**",     // Doesn't currently work due to how the current working directory is determined.
        "vscode-extension",    //
        ".git",                // Ignore the .git directory
        "*.dll",               // Ignore all .dll files.
        "**/*.dll"             // Ignore all .dll files
    ],

    // flagWords - list of words to be always considered incorrect
    // This is useful for offensive words and common spelling errors.
    // For example "hte" should be "the"`
    "cSpell.flagWords": ["hte"],

    // Set the delay before spell checking the document. Default is 50.
    "cSpell.spellCheckDelayMs": 50,
```

## Dictionaries

The spell checker includes a set of default dictionaries.

### General Dictionaries

* **wordsEn** - Derived from Hunspell US English words.
* **companies** - List of well known companies
* **softwareTerms** - Software Terms and concepts like "coroutine", "debounce", "tree", etc.
* **node** - terms related to using nodejs.

### Programming Language Dictionaries

* **typescript** - keywords for Typescript and Javascript
* **php** - *php* keywords and library methods
* **go** - *go* keywords and library methods
* **python** - *python* keywords
* **powershell** - *powershell* keywords
* **html** - *html* related keywords
* **css** - *css*, *less*, and *scss* related keywords

### Miscellaneous Dictionaries
* **fonts** - long list of fonts - to assist with *css*

Based upon the programming language, different dictionaries will be loaded.

Here are the default rules: "*" matches any language.

```javascript
{
"cSpell.languageSettings": [
    { languageId: "*",                                   dictionaries: ["wordsEn", "companies", "softwareTerms", "misc"], },
    { languageId: "python", allowCompoundWords: true,    dictionaries: ["python"]},
    { languageId: "go",     allowCompoundWords: true,    dictionaries: ["go"], },
    { languageId: "javascript",                          dictionaries: ["typescript", "node"] },
    { languageId: "javascriptreact",                     dictionaries: ["typescript", "node"] },
    { languageId: "typescript",                          dictionaries: ["typescript", "node"] },
    { languageId: "typescriptreact",                     dictionaries: ["typescript", "node"] },
    { languageId: "html",                                dictionaries: ["html", "fonts", "typescript", "css"] },
    { languageId: "php",                                 dictionaries: ["php", "html", "fonts", "css", "typescript"] },
    { languageId: "css",                                 dictionaries: ["fonts", "css"] },
    { languageId: "less",                                dictionaries: ["fonts", "css"] },
    { languageId: "scss",                                dictionaries: ["fonts", "css"] },
];
}
```

## Release Notes

### 0.14.3
* Turn on C and CPP by default.
* Improve the CPP dictionary.
* Compress dictionaries
* Speed up dictionary load

### 0.14.2
* Fix #49
* Add support for CPP and C files.

### 0.14.1
* Fix #47

### 0.14.0
* This release includes a large amount of refactoring in order to support greater flexability with the configuration.
* Ability to add file level settings:
    * ignore -- list of words to ignore
    * words -- list of words to consider correct
    * compound words -- can now turn on / off compound word checking.
    * disable / enable the spell checker
    * control which text in a file is checked.
* Ability to add new Dictionary files
* Per programming language level settings.
    * the ability to control which dictionaries are used.
    * enable / disable compound words
    * define `ignoreRegExpList` / `includeRegExpList` per language.
    * ability to define per language patterns
* Ability to define reusable patterns to be used with RegExpLists.
* Fixes #7, #31 -- String with escape characters like, "\nmessage", would be flagged as an error.
* Addresses #3 -- Option to spell check only string and comments
* Addresses #27 -- Regexp Ignore
* Addresses #45 -- Adding custom dictionaries
* Fix issue $44 -- Settings in cSpell.json were not being applied without a reload.

### 0.13.3
* Fix for #40 and #44 - manually load the cSpell.json file and merge it will any project settings.

### 0.13.1
* Fix for #42 - cSpell will not load on case sensitive file systems.

### 0.13.0
* Fix for #39 - cSpell.flagWords Unknown configuration setting
* Added a list of fonts to the spelling words.  Font favorites like Webdings and Verdana
  will pass the spell checker.


### 0.12.2
* Minor fix to hex test.

### 0.12.1
* Ignore anything that looks like a hex value: 0xBADC0FFEE
* In-document disable / enable the spell checker.

### 0.12.0
* Greatly reduce the amount of time it takes to load this extension
* Add the ability to change the time delay for checking document changes.  See Issue #28.

### 0.11.5
* Add Python support -- Special Thanks to @wheerd
* Move the "Add to Dictionary" suggestion back down to the bottom.
* Add some terms to the dictionary

### 0.11.4
* Hot fix for #25.

### 0.11.2
* Updated Extension Icon
* Implemented #16 -- Files that are excluded in search.exclude, will not be spellchecked.
* Glob support for the ignorePaths has been improved
* Adding words to the dictionary via command (F1 Add Word) will default to the currently selected text in the editor.
* By default, words are now added to the User Settings.
  At the bottom of the list of suggestions is the ability to add the word to the workspace.
  We are waiting for VS Code 1.7 to release to fix the suggestions list.
* The spellchecker can be enabled / disabled at the workspace level.
* Added information to the status bar (this can be hidden using settings.json).

### 0.10.13
* Fix issue #21. Words added when editing a stand alone file, are now added to the user's words.
* Due to a change in the way vscode reads config files, it will no longer find your ~/.vscode/cSpell.json file.
  To keep the words you added, you need to copy them to your user settings file and add them to cSpell.userWords.

### 0.10.12
* Hot fix issue #20.  The latest release of Visual Studio Code broke suggestions.

### 0.10.9
* Fix issue #15: Windows users can now add words though the UI.

### 0.10.7
* Added all words from en_US Hunspell English Dictionary
* *GO* - 1.7 words added -- Special thanks to: @AlekSi
* Ignore Chinese/Japanese characters -- Issue: #17

### 0.10.6
* Added support for contractions like wasn't, hasn't, could've.

### 0.10.5
* *GO* - keywords and library words added -- Special thanks to: @AlekSi
* *PHP* - many keywords and library functions added to word list.
* Word Lists now support CamelCase words.

### 0.10.1 and 0.10.2
* Minor bug fixes

### 0.10.0
* Feature: Suggestions
* Feature: Add to Dictionary

<!---
    These are at the bottom because the VSCode Marketplace leaves a bit space at the top

    cSpell:ignore jsja goededag alek wheerd behaviour tsmerge QQQQQ
    cSpell:enableCompoundWords
    cSpell:includeRegExp Everything
    cSpell:ignore hte
    cSpell:words Verdana
-->
