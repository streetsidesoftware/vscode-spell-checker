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
* It currently checks ALL text in a document.

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

    // Words to add to dictionary for a workspace.
    "cSpell.words": [],

    // User words to add to dictionary.  Should only be in the user settings.
    "cSpell.userWords": [],

    // Specify paths/files to ignore.
    "cSpell.ignorePaths": [
        "node_modules",
        "vscode-extension",
        ".git"
    ],

    // flagWords - list of words to be always considered incorrect
    // This is useful for offensive words and common spelling errors.
    // For example "hte" should be "the"`
    "cSpell.flagWords": ['hte'],
```

## Release Notes

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
* *GO* - 1.7 words added -- Special thanks to: AlekSi
* Ignore Chinese/Japanese characters -- Issue: #17

### 0.10.6
* Added support for contractions like wasn't, hasn't, could've.

### 0.10.5
* *GO* - keywords and library words added -- Special thanks to: AlekSi
* *PHP* - many keywords and library functions added to word list.
* Word Lists now support CamelCase words.

### 0.10.1 and 0.10.2
* Minor bug fixes

### 0.10.0
* Feature: Suggestions
* Feature: Add to Dictionary
