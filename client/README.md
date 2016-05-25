# Spelling Checker for Visual Studio Code

A basic spell checker that works well with camelCase code.

## Functionality

Load a Typescript, Javascript, Text or Markdown file.  Words not in the dictionary files will have
a squiggly underline.

![Example](https://raw.githubusercontent.com/Jason-Rev/vscode-spell-checker/master/client/images/example.gif)

## Install

Open up VS Code and hit `F1` and type `ext` select install and type `code-spell-checker` hit enter and reload window to enable.

## Supported Languages

* English

## Supported File Types
* Typescript
* Javascript
* Text
* Markdown

## How it works with camelCase

The concept is simple, split camelCase words before checking them against a list of known English words.
* camelCase -> camel case
* HTMLInput -> html input
* srcCode -> src code
* snake_case_words -> snake case words
* camel2snake -> camel snake -- (the 2 is ignored)

## Things to note

* This spellchecker is case insensitive.  It will not catch errors like english which should be English.
  The main reason for that is case has a different meaning in source code than in standard prose.
* The spellchecker uses a local word dictionary.  It does not send anything outside your machine.
* The words in the dictionary can and do contain errors.
* There are missing words.
* Only words longer than 3 characters are checked.  "jsj" is ok, while "jsja" is not.
* All symbols and punctuation are ignored.
* It currently checks ALL text in a document.