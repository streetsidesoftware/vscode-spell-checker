# Spelling Checker for Visual Studio Code
[![Current Version](http://vsmarketplacebadge.apphb.com/version/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
[![Install Count](http://vsmarketplacebadge.apphb.com/installs/streetsidesoftware.code-spell-checker.svg)](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
[![Open Issues](http://vsmarketplacebadge.apphb.com/rating/streetsidesoftware.code-spell-checker.svg) ](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

A basic spell checker that works well with camelCase code.

## Functionality

Load a Typescript, Javascript, Text or Markdown file.  Words not in the dictionary files will have
a squiggly underline.

![Example](https://raw.githubusercontent.com/Jason-Rev/vscode-spell-checker/master/client/images/example.gif)

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

### Configuration Settings

```javascript
    //-------- Code Spell Checker Configuration --------

    // Controls the maximum number of spelling errors per document.
    "cSpell.maxNumberOfProblems": 100,

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
        "node_modules"
    ],
```
