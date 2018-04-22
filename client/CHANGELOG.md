# Release Notes

## [1.6.9]
- [spell checker checks spelling on git version of files #214](https://github.com/Jason-Rev/vscode-spell-checker/issues/214)

## [1.6.8]
- [[Live Share] Restricting language services to local files #209](https://github.com/Jason-Rev/vscode-spell-checker/pull/209)
- Update the cSpell library.

## [1.6.7]
* Fix [cSpell.json overwritten with commented json on word add. #206](https://github.com/Jason-Rev/vscode-spell-checker/issues/206)
- Fix an issue with matching too much text for a url:
  [Misspelled first word after HTML element with absolute URL is not detected #201](https://github.com/Jason-Rev/vscode-spell-checker/issues/201)
- [Better LaTeX support](https://github.com/Jason-Rev/vscode-spell-checker/issues/167#issuecomment-373682530)
- Ignore SHA-1, SHA-256, SHA-512 hashes by default
- Ignore HTML href urls by default.

## [1.6.6]
* Expose the setting to limit the number of repeated problems.

  To set it:
  * In the VS Code settings:

    ```
    "cSpell.maxDuplicateProblems": 5,
    ```

  * In a cspell.json file:

    ```
    "maxDuplicateProblems": 5,
    ```
  See: [Combine repeated unknown words in Problems tab #194](https://github.com/Jason-Rev/vscode-spell-checker/issues/194)

* Turn on support for AsciiDocs by default. See: [Enable AsciiDocs by default](https://github.com/Jason-Rev/vscode-spell-checker/pull/196)
* Update the English Dictionary
* Added a command to remove words added to the user dictionary
   `F1` `Remove Words from `...
   ![image](https://user-images.githubusercontent.com/3740137/38453511-3397299a-3a57-11e8-94af-4f46ecb544dc.png)
   See: [How to remove word from dictionary? #117](https://github.com/Jason-Rev/vscode-spell-checker/issues/117)

## [1.6.5]
* Add support for [Visual Studio Live Share](https://aka.ms/vsls), pull request: [Adding support for Visual Studio Live Share #191](https://github.com/Jason-Rev/vscode-spell-checker/pull/191)

## [1.6.4]
* Add support for Rust
* Improve LaTeX support.

## [1.6.3]
* Improve LaTex support, special thanks to [James Yu](https://github.com/James-yu)
* Add ability to disable checking a line: `cspell:disable-line`
* Add ability to disable the next line: `cspell:disable-next`

## [1.6.2]
* Reduce the size of the extension by excluding automatic test files.

## [1.6.1]
* Fix: [bug: no spell checking when there's no folder opened #162](https://github.com/Jason-Rev/vscode-spell-checker/issues/162)
* Fix: [Incorrectly flagged words #160](https://github.com/Jason-Rev/vscode-spell-checker/issues/160)

## [1.6.0]
* Release of Multi-Root Support
* Fixes to support windows.

## [1.5.1]
* Rollback of Multi-Root support due to issue with Windows.

## [1.5.0]

* Added Multi-Root Support [Support VSCode Multi Root Workspace #145](https://github.com/Jason-Rev/vscode-spell-checker/issues/145)
* Address issue with delay: [cSpell.spellCheckDelayMs seems to be ignored #155](https://github.com/Jason-Rev/vscode-spell-checker/issues/155)

## [1.4.12]

* Speed up suggestions.

## [1.4.11]

* Improve suggests for words with accents.
* Improve spell checking on compound words.

## [1.4.10]

* Allow the diagnostic level to be configured. In reference to [Highlight color #128](https://github.com/Jason-Rev/vscode-spell-checker/issues/128) and [disable scrollbar annotations #144](https://github.com/Jason-Rev/vscode-spell-checker/issues/144)

## [1.4.9]

* Make it easier to add ignore words to the settings. [Option to ignore words #146](https://github.com/Jason-Rev/vscode-spell-checker/issues/146)

## [1.4.8]

* The spell checker will now give reasonable suggestions for compound words. Related to [allowCompoundWords only validates two words #142](https://github.com/Jason-Rev/vscode-spell-checker/issues/142)
* Fixed [Words in the forbidden list are being shown as suggested spelling corrections #89](https://github.com/Jason-Rev/vscode-spell-checker/issues/89)

## [1.4.7]

* Improved the support for compound words with languages like Dutch and German. This is still a work in progress.
* Enable spell checking longer word compounds like: networkerrorexecption. Related to [allowCompoundWords only validates two words #142](https://github.com/Jason-Rev/vscode-spell-checker/issues/142)

## [1.4.6]

* Fix issue [Add all words in the current document to dictionary #59](https://github.com/Jason-Rev/vscode-spell-checker/issues/59)
  This is now possible by selecting the words you want to add and right click to choose which dictionary to add them to.

## [1.4.2 - 1.4.5]

* Patch to fix issue with detecting changes to settings files.
* Fix issue [Spawns too many "find" processes #143](https://github.com/Jason-Rev/vscode-spell-checker/issues/143)
* Possible fix for [CPU usage extremely high, on close memory usage skyrockets #77](https://github.com/Jason-Rev/vscode-spell-checker/issues/77)

## [1.4.1]

* Fix part of issue [#74](https://github.com/Jason-Rev/vscode-spell-checker/issues/74) so flagged words are not shown as suggestions.
* Enhanced the information screen.
* Add a right click option to add a word to the dictionary. If multiple words are selected, all of them will be added.
  This should fix issue [#59](https://github.com/Jason-Rev/vscode-spell-checker/issues/59).
* Improve startup performance by limited the settings watcher.
  This addresses:
  * [#77](https://github.com/Jason-Rev/vscode-spell-checker/issues/77)

## [1.4.0]

* Improved the information screen to make it easier to turn on/off languages.
* Use MDL for the theme of the information screen.

## [1.3.9]

* Fixed and issue with incorrect suggestions when the misspelled word started with a capitol letter.
* Improvements to the Info screen.

## [1.3.8]

* Update `README.md` to make finding suggestions a bit easier.
* Add link to German extension.
* Update cspell to support Python Django Framework.
* Update cspell to support Go 1.9, thanks to @AlekSi

## [1.3.7]

* Add new setting to limit the amount of text checked in a single file. `cSpell.checkLimit` can be used to set the limit in K-Bytes. By default it is 500KB.
* On startup, the spell checker is disabled and will be enabled only after the settings are read.
  This is to prevent the checking of file before all the configuration has been loaded.
* Improvements to the loading process has been to reduce repeated checking of documents during configuration changes.
* Checking of `handlebars` files have been turned on by default.
* Checking of `reStructuredText` files have been turned on by default.

## [1.3.6]

* Update cspell to enabled spelling checking 'untitled' files. See issue: [#99](https://github.com/Jason-Rev/vscode-spell-checker/issues/99)

## [1.3.5]

* Add Extension API functions:
  * registerConfig - Register a cspell.json file to be loaded
  * triggerGetSettings - Causes all settings to be reloaded
  * enableLanguageId - Enables a programming language
  * disableLanguageId - Disables a programming language
  * enableCurrentLanguage - Enables the programming language associated with the active editor.
  * disableCurrentLanguage - Disables the programming language associated with the active editor.
  * addWordToUserDictionary - Adds a word to the User Dictionary
  * addWordToWorkspaceDictionary - Adds a word to the Workspace Dictionary
  * enableLocal - Enable Language Local like "en" or "es". Example: `enableLocal(true, 'es')`
  * disableLocal - Disables a Language Local. Example: `disableLocal(true, 'es')`
  * updateSettings - Update spelling settings by field. Example: `updateSettings(true, { language: "en", enable: true })`

## [1.3.4]

* Minor fix to the spell checking server related to importing settings from other extensions.

## [1.3.3]

* Fix an issue with words still showing up as incorrect after they have been added to user or project dictionary.
* Progress towards enabling Dictionary extensions.

## [1.3.2]

* Fix issue [#80](https://github.com/Jason-Rev/vscode-spell-checker/issues/80)

## 1.3.1

* Fix issue [#112](https://github.com/Jason-Rev/vscode-spell-checker/issues/112)
* Fix issue [#113](https://github.com/Jason-Rev/vscode-spell-checker/issues/113)
* Fix issue [#110](https://github.com/Jason-Rev/vscode-spell-checker/issues/110)

## 1.3.0

* Upgraded to cspell 1.7.1 to get import support and global dictionaries.
* Adding cspell-dicts is now relatively simple.
* Change the delay to be delay after typing finishes. [#90](https://github.com/Jason-Rev/vscode-spell-checker/issues/90)

## 1.2.1

* Fix issue [#96](https://github.com/Jason-Rev/vscode-spell-checker/issues/96)
* Added a FAQ file.
* User word lists are now sorted: [#91](https://github.com/Jason-Rev/vscode-spell-checker/issues/91)
* Add commands to toggle the spell checker with key assignments [#64](https://github.com/Jason-Rev/vscode-spell-checker/issues/64)
* Only use https links in .md files. [#103](https://github.com/Jason-Rev/vscode-spell-checker/issues/103)

## 1.2.0

* Fix an issue with themes
* Update cspell library to support language specific overrides.
* Support Python unicode and byte strings.

## 1.1.0

* Fix Issue with cspell Info pane that prevented it from showing up. [#88](https://github.com/Jason-Rev/vscode-spell-checker/issues/88)

## 1.0.2

* Updated `cspell` to fix an issue where some misspelled words were considered correct even if they were not. See: [#7](https://github.com/Jason3S/cspell/issues/7)

## 1.0.1

* Update Readme and changelog.

## 1.0.0

* Update to the latest version of cspell to handle large dictionary files.

## 0.17.2

* Update README to indicate that LaTex is enabled by default.

## 0.17.1

* Reduce the size of the extension by not including cspell twice.
* Removed unused packages.

## 0.17.0

* Minor changes to fix issues introduced by VS Code 1.9

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

* This release includes a large amount of refactoring in order to support greater flexibility with the configuration.
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

    cSpell:ignore jsja goededag alek wheerd behaviour tsmerge QQQQQ networkerrorexecption scrollbar
    cSpell:includeRegExp Everything
    cSpell:ignore hte
    cSpell:words Verdana
-->
