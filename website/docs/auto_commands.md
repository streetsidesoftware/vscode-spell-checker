---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-commands.mts`
title: Commands
id: commands
---

# Commands

## Running Commands

To run a command, use the following:

| OS.     | Command |
| ------- | ------- |
| All OS  | `F1` `<command>` |
| MacOS   | `Shift-Cmd-P` `<command>` |
| Windows | `Ctrl-Shift-P` `<command>` |

## Commands


| Command | Title |
| ------- | ----- |
| `cSpell.addIgnoreWord` |  Ignore Word |
| `cSpell.addIgnoreWordsToFolder` |  Ignore Word in Folder Settings |
| `cSpell.addIgnoreWordsToUser` |  Ignore Word in User Settings |
| `cSpell.addIgnoreWordsToWorkspace` |  Ignore Word in Workspace Settings |
| `cSpell.addIssuesToDictionary` |  Add All Spelling Issues to Dictionary |
| `cSpell.addWordToCSpellConfig` |  Add Word to CSpell Configuration |
| `cSpell.addWordToDictionary` |  Add Word to Dictionary |
| `cSpell.addWordToFolderDictionary` |  Add Word to Folder Dictionary |
| `cSpell.addWordToFolderSettings` |  Add Word to Folder Settings |
| `cSpell.addWordToUserDictionary` |  Add Word to User Dictionary |
| `cSpell.addWordToUserSettings` |  Add Word to User Settings |
| `cSpell.addWordToWorkspaceDictionary` |  Add Word to Workspace Dictionary |
| `cSpell.addWordToWorkspaceSettings` |  Add Word to Workspace Settings |
| `cSpell.autoFixSpellingIssues` |  Fix all issues with a preferred suggestion in the current document |
| `cSpell.createCSpellConfig` |  Create a CSpell Configuration File |
| `cSpell.createCSpellTerminal` |  Open a new CSpell REPL Terminal |
| `cSpell.createCustomDictionary` |  Create a Custom Dictionary File |
| `cSpell.disableCurrentFileType` |  Disable Spell Checking File Type |
| `cSpell.disableForGlobal` |  Disable Spell Checking by Default |
| `cSpell.disableForWorkspace` |  Disable Spell Checking For Workspace |
| `cSpell.displayCSpellInfo` |  Show Spell Checker Configuration Info |
| `cSpell.enableCurrentFileType` |  Enable Spell Checking File Type |
| `cSpell.enableForGlobal` |  Enable Spell Checking by Default |
| `cSpell.enableForWorkspace` |  Enable Spell Checking For Workspace |
| `cSpell.goToNextSpellingIssue` |  Go to Next Spelling Issue |
| `cSpell.goToNextSpellingIssueAndSuggest` |  Go to Next Spelling Issue and Suggest |
| `cSpell.goToPreviousSpellingIssue` |  Go to Previous Spelling Issue |
| `cSpell.goToPreviousSpellingIssueAndSuggest` |  Go to Previous Spelling Issue and Suggest |
| `cSpell.hide` |  Hide Spelling Issues |
| `cSpell.hideCSpellInfo` |  Hide Spell Checker Configuration Info |
| `cSpell.insertDisableLineDirective` |  Insert Disable Current Line Directive |
| `cSpell.insertDisableNextLineDirective` |  Insert Disable Next Line Directive |
| `cSpell.insertIgnoreWordsDirective` |  Insert Ignore Words Directive |
| `cSpell.insertWordsDirective` |  Insert Words Directive |
| `cSpell.logPerfTimeline` |  Log CSpell performance times to console |
| `cSpell.openFileInfoView` |  Open Spell Checker File Information View |
| `cSpell.openIssuesPanel` |  Open Spell Checker Issues Panel |
| `cSpell.openSettings` |  Open Spell Checker Settings |
| `cSpell.rateTheSpellChecker` |  Rate the Spell Checker |
| `cSpell.reload` |  Reload Spell Checker Configuration and Dictionaries |
| `cSpell.removeWordFromFolderDictionary` |  Remove Word from the Folder Dictionary |
| `cSpell.removeWordFromUserDictionary` |  Remove Word from the Global Dictionary |
| `cSpell.removeWordFromWorkspaceDictionary` |  Remove Word from the Workspace Dictionaries |
| `cSpell.restart` |  Restart Spell Checker Server |
| `cSpell.show` |  Show Spelling Issues |
| `cSpell.toggleEnableForGlobal` |  Toggle Spell Checking in User Settings |
| `cSpell.toggleEnableForWorkspace` |  Toggle Spell Checking for Workspace |
| `cSpell.toggleEnableSpellChecker` |  Toggle Spell Checking |
| `cSpell.toggleTraceMode` |  Toggle Trace Mode |
| `cSpell.toggleVisible` |  Toggle Show Spelling Issues |


## Conditional Commands

These commands are not part of the default command palette and are only available under certain conditions.


| Command | Title |
| ------- | ----- |
| `cSpell.about` |  About the Spell Checker<br />**When:**<br />  `config.cSpell.command.about` |
| `cSpell.disableCurrentLanguage` |  Disable Spell Checking Document Type<br />**When:**<br />  `cSpell.showLegacyCommands.disableCurrentLanguage` |
| `cSpell.enableCurrentLanguage` |  Enable Spell Checking Document Type<br />**When:**<br />  `cSpell.showLegacyCommands.enableCurrentLanguage` |
| `cSpell.experimental.executeDocumentSymbolProvider` |  Execute Document Symbol Provider on the current document<br />**When:**<br />  `config.cSpell.experimental.symbols` |
| `cSpell.issuesViewByFile.item.addWordToDictionary` |  Add Word to Dictionary<br />**When:**<br />  `view == cSpellIssuesViewByFile` |
| `cSpell.issuesViewByFile.item.autoFixSpellingIssues` |  Fix issue with preferred suggestion in the current document<br />**When:**<br />  `view == cSpellIssuesViewByFile` |
| `cSpell.issueViewer.item.addWordToDictionary` |  Add Word to Dictionary<br />**When:**<br />  `view == cSpellIssuesViewByIssue` |
| `cSpell.issueViewer.item.autoFixSpellingIssues` |  Fix issue with preferred suggestion in the current document<br />**When:**<br />  `view == cSpellIssuesViewByIssue` |
| `cSpell.issueViewer.item.openSuggestionsForIssue` |  Show Suggestions<br />**When:**<br />  `view == cSpellIssuesViewByIssue` |
| `cSpell.releaseNotes` |  Show Spell Checker Release Notes<br />**When:**<br />  `config.cSpell.command.releaseNotes` |
| `cSpell.reportIssue` |  Report an Issue with the Spell Checker<br />**When:**<br />  `config.cSpell.command.reportIssue` |
| `cSpell.sponsor` |  Sponsor the Spell Checker<br />**When:**<br />  `config.cSpell.command.sponsor` |
| `cSpell.suggestSpellingCorrections` |  Spelling Suggestions...<br />**When:**<br />  `editorTextFocus && cSpell.editorMenuContext.showSuggestions` |
| `cSpell.supportRequest` |  Request Support with the Spell Checker<br />**When:**<br />  `config.cSpell.command.enableSupportRequest` |



