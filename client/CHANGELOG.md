# Release Notes:

## 0.17.2
* Update README to indicate that LaTex by default.

## 0.17.1
* Reduce the size of the extension by not including cspell twice.
* Removed unused packages.

## 0.17.0
* Minnor changes to fix issues introduced by VS Code 1.9

## 0.16.0
* The spell checking engine was moved to its own repository [cspell](https://github.com/Jason3S/cspell)
  * [#58](https://github.com/Jason-Rev/vscode-spell-checker/issues/58) Provide npm package with CLI
  * [#34](https://github.com/Jason-Rev/vscode-spell-checker/issues/34) grunt plugin or a new library repository
* Added LaTex support [#65](https://github.com/Jason-Rev/vscode-spell-checker/issues/65)
* Migrate from rxjs 4 to rxjs 5.
* Greatly extended the Typescript / Javascript dictionaries.
* Added a dictionary of file types to avoid common file types from being marked as spelling errors.
* Extend the *node* dictionary.

## 0.15.0
* Fix some issues with the spell checker info viewer
* Fix [#51](https://github.com/Jason-Rev/vscode-spell-checker/issues/51)
* Fix an issue finding the cSpell.json file.
* Add some terms to the dictionaries.

## 0.14.9
* Add a dictionary for C# and for .Net [#62](https://github.com/Jason-Rev/vscode-spell-checker/issues/62)
* Turn on .json by default [#63](https://github.com/Jason-Rev/vscode-spell-checker/issues/63)

## 0.14.8
* Fix an issue with the displaying the spell checker info.

## 0.14.7
* Enabled language pug [#60](https://github.com/Jason-Rev/vscode-spell-checker/issues/60)
* As a stop-gap for csharp, use the typescript dictionary. Issue [#62](https://github.com/Jason-Rev/vscode-spell-checker/issues/62)
* Add a dictionary for popular npm libraries
* Make sure most languages can be enabled / disabled without the need to restart vscode.
* Added a command to show an information page about the Spell Checker.
  It can be triggered by clicking on the statusbar or by `F1` `Show Spell Checker Configuration Info`

## 0.14.6
* Updates to documentation
* Fix #55 - Have the exclude globs check the path relative to the workspace instead of the entire path.

## 0.14.5
* Minor fix to README.md

## 0.14.4
* Moved the default location for `cSpell.json` to the workspace root instead of *.vscode*.
  This makes it easier to have `cSpell.json` files checked into git.
  The spell checker will look for both `./vscode/cSpell.json` and `./cSpell.json` in the workspace.
* Fix #54 - Spell checking problems should be removed from the diagnostic window when the editor tab is closed.

## 0.14.3
* Turn on C and CPP by default.
* Improve the CPP dictionary.
* Compress dictionaries
* Speed up dictionary load

## 0.14.2
* Fix #49
* Add support for CPP and C files.

## 0.14.1
* Fix #47

## 0.14.0
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

## 0.13.3
* Fix for #40 and #44 - manually load the cSpell.json file and merge it will any project settings.

## 0.13.1
* Fix for #42 - cSpell will not load on case sensitive file systems.

## 0.13.0
* Fix for #39 - cSpell.flagWords Unknown configuration setting
* Added a list of fonts to the spelling words.  Font favorites like Webdings and Verdana
  will pass the spell checker.


## 0.12.2
* Minor fix to hex test.

## 0.12.1
* Ignore anything that looks like a hex value: 0xBADC0FFEE
* In-document disable / enable the spell checker.

## 0.12.0
* Greatly reduce the amount of time it takes to load this extension
* Add the ability to change the time delay for checking document changes.  See Issue #28.

## 0.11.5
* Add Python support -- Special Thanks to @wheerd
* Move the "Add to Dictionary" suggestion back down to the bottom.
* Add some terms to the dictionary

## 0.11.4
* Hot fix for #25.

## 0.11.2
* Updated Extension Icon
* Implemented #16 -- Files that are excluded in search.exclude, will not be spellchecked.
* Glob support for the ignorePaths has been improved
* Adding words to the dictionary via command (F1 Add Word) will default to the currently selected text in the editor.
* By default, words are now added to the User Settings.
  At the bottom of the list of suggestions is the ability to add the word to the workspace.
  We are waiting for VS Code 1.7 to release to fix the suggestions list.
* The spellchecker can be enabled / disabled at the workspace level.
* Added information to the status bar (this can be hidden using settings.json).

## 0.10.13
* Fix issue #21. Words added when editing a stand alone file, are now added to the user's words.
* Due to a change in the way vscode reads config files, it will no longer find your ~/.vscode/cSpell.json file.
  To keep the words you added, you need to copy them to your user settings file and add them to cSpell.userWords.

## 0.10.12
* Hot fix issue #20.  The latest release of Visual Studio Code broke suggestions.

## 0.10.9
* Fix issue #15: Windows users can now add words though the UI.

## 0.10.7
* Added all words from en_US Hunspell English Dictionary
* *GO* - 1.7 words added -- Special thanks to: @AlekSi
* Ignore Chinese/Japanese characters -- Issue: #17

## 0.10.6
* Added support for contractions like wasn't, hasn't, could've.

## 0.10.5
* *GO* - keywords and library words added -- Special thanks to: @AlekSi
* *PHP* - many keywords and library functions added to word list.
* Word Lists now support CamelCase words.

## 0.10.1 and 0.10.2
* Minor bug fixes

## 0.10.0
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
