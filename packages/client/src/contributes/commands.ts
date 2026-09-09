import type { ICommand } from '../vscode/types.ts';
import { whenClause } from './whenClause.ts';

const ts = whenClause;

export const commands: ICommand[] = [
    {
        command: 'cSpell.addWordToWorkspaceDictionary',
        category: 'Spell',
        title: 'Add Word(s) to Workspace Dictionary',
    },
    {
        command: 'cSpell.addWordToFolderDictionary',
        category: 'Spell',
        title: 'Add Word(s) to Folder Dictionary',
    },
    {
        command: 'cSpell.addWordToUserDictionary',
        category: 'Spell',
        title: 'Add Word(s) to User Dictionary',
    },
    {
        command: 'cSpell.addWordToWorkspaceSettings',
        category: 'Spell',
        title: 'Add Word(s) to Workspace Settings',
    },
    {
        command: 'cSpell.addWordToFolderSettings',
        category: 'Spell',
        title: 'Add Word(s) to Folder Settings',
    },
    {
        command: 'cSpell.addWordToUserSettings',
        category: 'Spell',
        title: 'Add Word(s) to User Settings',
    },
    {
        command: 'cSpell.enableForWorkspace',
        category: 'Spell',
        title: 'Enable Spell Checking For Workspace',
    },
    {
        command: 'cSpell.disableForWorkspace',
        category: 'Spell',
        title: 'Disable Spell Checking For Workspace',
    },
    {
        command: 'cSpell.enableForGlobal',
        category: 'Spell',
        title: 'Enable Spell Checking by Default',
    },
    {
        command: 'cSpell.disableForGlobal',
        category: 'Spell',
        title: 'Disable Spell Checking by Default',
    },
    {
        command: 'cSpell.enableCurrentLanguage',
        category: 'Spell',
        title: 'Enable Spell Checking Document Type',
        enablement: ts`
            cSpell.showLegacyCommands.enableCurrentLanguage
        `,
    },
    {
        command: 'cSpell.disableCurrentLanguage',
        category: 'Spell',
        title: 'Disable Spell Checking Document Type',
        enablement: ts`
            cSpell.showLegacyCommands.disableCurrentLanguage
        `,
    },
    {
        command: 'cSpell.enableCurrentFileType',
        category: 'Spell',
        title: 'Enable Spell Checking File Type',
        shortTitle: 'Enable File Type',
    },
    {
        command: 'cSpell.disableCurrentFileType',
        category: 'Spell',
        title: 'Disable Spell Checking File Type',
        shortTitle: 'Disable File Type',
    },
    {
        command: 'cSpell.displayCSpellInfo',
        category: 'Spell',
        title: 'Show Spell Checker Configuration Info',
    },
    {
        command: 'cSpell.hideCSpellInfo',
        category: 'Spell',
        title: 'Hide Spell Checker Configuration Info',
    },
    {
        command: 'cSpell.toggleEnableForGlobal',
        category: 'Spell',
        title: 'Toggle Spell Checking in User Settings',
    },
    {
        command: 'cSpell.toggleEnableForWorkspace',
        category: 'Spell',
        title: 'Toggle Spell Checking for Workspace',
    },
    {
        command: 'cSpell.toggleEnableSpellChecker',
        category: 'Spell',
        title: 'Toggle Spell Checking',
    },
    {
        command: 'cSpell.removeWordFromFolderDictionary',
        category: 'Spell',
        title: 'Remove Word(s) from the Folder Dictionary',
    },
    {
        command: 'cSpell.removeWordFromWorkspaceDictionary',
        category: 'Spell',
        title: 'Remove Word(s) from the Workspace Dictionaries',
    },
    {
        command: 'cSpell.removeWordFromUserDictionary',
        category: 'Spell',
        title: 'Remove Word(s) from the Global Dictionary',
    },
    {
        command: 'cSpell.logPerfTimeline',
        category: 'Spell',
        title: 'Log CSpell performance times to console',
    },
    {
        command: 'cSpell.addIgnoreWord',
        category: 'Spell',
        title: 'Ignore Word(s)',
    },
    {
        command: 'cSpell.addIgnoreWordsToFolder',
        category: 'Spell',
        title: 'Ignore Word in Folder Settings',
    },
    {
        command: 'cSpell.addIgnoreWordsToWorkspace',
        category: 'Spell',
        title: 'Ignore Word(s) in Workspace Settings',
    },
    {
        command: 'cSpell.addIgnoreWordsToUser',
        category: 'Spell',
        title: 'Ignore Word(s) in User Settings',
    },
    {
        command: 'cSpell.addWordToDictionary',
        category: 'Spell',
        title: 'Add Word(s) to Dictionary',
        icon: '$(book)',
    },
    {
        command: 'cSpell.addWordToCSpellConfig',
        category: 'Spell',
        title: 'Add Word(s) to CSpell Configuration',
    },
    {
        command: 'cSpell.addIssuesToDictionary',
        category: 'Spell',
        title: 'Add All Spelling Issues to Dictionary',
    },
    {
        command: 'cSpell.createCustomDictionary',
        category: 'Spell',
        title: 'Create a Custom Dictionary File',
    },
    {
        command: 'cSpell.createCSpellConfig',
        category: 'Spell',
        title: 'Create a CSpell Configuration File',
    },
    {
        command: 'cSpell.suggestSpellingCorrections',
        enablement: ts`
            editorTextFocus && cSpell.editorMenuContext.showSuggestions
        `,
        category: 'Spell',
        title: 'Spelling Suggestions...',
    },
    {
        command: 'cSpell.goToNextSpellingIssue',
        category: 'Spell',
        title: 'Go to Next Spelling Issue',
    },
    {
        command: 'cSpell.goToPreviousSpellingIssue',
        category: 'Spell',
        title: 'Go to Previous Spelling Issue',
    },
    {
        command: 'cSpell.goToNextSpellingIssueAndSuggest',
        category: 'Spell',
        title: 'Go to Next Spelling Issue and Suggest',
    },
    {
        command: 'cSpell.goToPreviousSpellingIssueAndSuggest',
        category: 'Spell',
        title: 'Go to Previous Spelling Issue and Suggest',
    },
    {
        command: 'cSpellRegExpTester.testRegExp',
        title: 'Test a Regular Expression on the current document',
        enablement: ts`
            config.cSpell.experimental.enableRegexpView
        `,
    },
    {
        command: 'cSpellRegExpTester.editRegExp',
        title: 'Edit',
        icon: '$(edit)',
        enablement: ts`
            config.cSpell.experimental.enableRegexpView
        `,
    },
    {
        command: 'cSpell.experimental.executeDocumentSymbolProvider',
        title: 'Execute Document Symbol Provider on the current document',
        icon: '$(code)',
        enablement: ts`
            config.cSpell.experimental.symbols
        `,
    },
    {
        command: 'cSpell.autoFixSpellingIssues',
        title: 'Fix all issues with a preferred suggestion in the current document',
        icon: '$(lightbulb-autofix)',
    },
    {
        command: 'cSpell.issueViewer.item.openSuggestionsForIssue',
        title: 'Show Suggestions',
        icon: '$(list-unordered)',
        enablement: ts`
            view == cSpellIssuesViewByIssue
        `,
    },
    {
        command: 'cSpell.issueViewer.item.autoFixSpellingIssues',
        title: 'Fix issue with preferred suggestion in the current document',
        icon: '$(lightbulb-autofix)',
        enablement: ts`
            view == cSpellIssuesViewByIssue
        `,
    },
    {
        command: 'cSpell.issueViewer.item.addWordToDictionary',
        category: 'Spell',
        title: 'Add Word to Dictionary',
        icon: '$(book)',
        enablement: ts`
            view == cSpellIssuesViewByIssue
        `,
    },
    {
        command: 'cSpell.issuesViewByFile.item.autoFixSpellingIssues',
        title: 'Fix issue with preferred suggestion in the current document',
        icon: '$(lightbulb-autofix)',
        enablement: ts`
            view == cSpellIssuesViewByFile
        `,
    },
    {
        command: 'cSpell.issuesViewByFile.item.addWordToDictionary',
        category: 'Spell',
        title: 'Add Word to Dictionary',
        icon: '$(book)',
        enablement: ts`
            view == cSpellIssuesViewByFile
        `,
    },
    {
        command: 'cSpell.insertDisableNextLineDirective',
        category: 'Spell',
        title: 'Insert Disable Next Line Directive',
        icon: '$(comment-discussion)',
    },
    {
        command: 'cSpell.insertDisableLineDirective',
        category: 'Spell',
        title: 'Insert Disable Current Line Directive',
        icon: '$(comment-discussion)',
    },
    {
        command: 'cSpell.insertIgnoreWordsDirective',
        category: 'Spell',
        title: 'Insert Ignore Word(s) Directive',
        icon: '$(comment-discussion)',
    },
    {
        command: 'cSpell.insertWordsDirective',
        category: 'Spell',
        title: 'Insert Words Directive',
        icon: '$(comment-discussion)',
    },
    {
        command: 'cSpell.toggleVisible',
        category: 'Spell',
        title: 'Toggle Show Spelling Issues',
        shortTitle: 'Toggle Spelling Issues',
        icon: '$(eye)',
    },
    {
        command: 'cSpell.show',
        category: 'Spell',
        title: 'Show Spelling Issues',
        shortTitle: 'Show',
        icon: '$(eye)',
    },
    {
        command: 'cSpell.hide',
        category: 'Spell',
        title: 'Hide Spelling Issues',
        shortTitle: 'Hide',
        icon: '$(eye-closed)',
    },
    {
        command: 'cSpell.toggleTraceMode',
        category: 'Spell',
        title: 'Toggle Trace Mode',
        icon: '$(search)',
    },
    {
        command: 'cSpell.createCSpellTerminal',
        category: 'Spell',
        title: 'Open a new CSpell REPL Terminal',
        icon: '$(terminal)',
    },
    {
        command: 'cSpell.openIssuesPanel',
        category: 'Spell',
        title: 'Open Spell Checker Issues Panel',
        shortTitle: 'Open Spelling Issues',
        icon: '$(eye)',
    },
    {
        command: 'cSpell.openFileInfoView',
        category: 'Spell',
        title: 'Open Spell Checker File Information View',
        shortTitle: 'Open File Info',
        icon: '$(eye)',
    },
    {
        command: 'cSpell.reload',
        category: 'Spell',
        title: 'Reload Spell Checker Configuration and Dictionaries',
        shortTitle: 'Reload Config & Dictionaries',
        icon: '$(sync)',
    },
    {
        command: 'cSpell.restart',
        category: 'Spell',
        title: 'Restart Spell Checker Server',
        shortTitle: 'Restart Spell Checker',
        icon: '$(sync)',
    },
    {
        command: 'cspell.showActionsMenu', // Note the lowercase 's' in 'cspell' to match the command registration
        category: 'Spell',
        title: 'Show Spell Checker Actions Menu',
        shortTitle: 'Spell Checker Actions',
        icon: '$(list-unordered)',
    },
    {
        command: 'cSpell.supportRequest',
        enablement: ts`
            config.cSpell.command.enableSupportRequest
        `,
        category: 'Spell',
        title: 'Request Support with the Spell Checker',
        icon: '$(github)',
    },
    {
        command: 'cSpell.reportIssue',
        enablement: ts`
            config.cSpell.command.reportIssue
        `,
        category: 'Spell',
        title: 'Report an Issue with the Spell Checker',
        icon: '$(github)',
    },
    {
        command: 'cSpell.about',
        enablement: ts`
            config.cSpell.command.about
        `,
        category: 'Spell',
        title: 'About the Spell Checker',
        icon: '$(home)',
    },
    {
        command: 'cSpell.releaseNotes',
        enablement: ts`
            config.cSpell.command.releaseNotes
        `,
        category: 'Spell',
        title: 'Show Spell Checker Release Notes',
        icon: '$(heart)',
    },
    {
        command: 'cSpell.sponsor',
        enablement: ts`
            config.cSpell.command.sponsor
        `,
        category: 'Spell',
        title: 'Sponsor the Spell Checker',
        icon: '$(heart)',
    },
    {
        command: 'cSpell.rateTheSpellChecker',
        category: 'Spell',
        title: 'Rate the Spell Checker',
        icon: '$(star)',
    },
    {
        command: 'cSpell.openSettings',
        category: 'Spell',
        title: 'Open Spell Checker Settings',
        icon: '$(gear)',
    },
];
