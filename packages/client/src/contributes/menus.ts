import type { ISubmenu, Menus } from '../vscode/types.ts';

export const menus: Menus = {
    'editor/context': [
        {
            command: 'cSpell.suggestSpellingCorrections',
            when: '!editorReadonly && editorTextFocus && config.cSpell.showSuggestionsLinkInEditorContextMenu && cSpell.editorMenuContext.showSuggestions && cSpell.context.showDecorations',
            group: 'A_cspell@000',
        },
        {
            submenu: 'cSpell.spelling',
            group: 'A_cspell@001',
            when: '!editorReadonly && editorTextFocus && config.cSpell.showCommandsInEditorContextMenu',
        },
        {
            command: 'cSpell.show',
            when: 'editorTextFocus && config.cSpell.showCommandsInEditorContextMenu && cSpell.editorMenuContext.hasIssues && !cSpell.context.showDecorations',
            group: 'A_cspell@002',
        },
        {
            command: 'cSpell.hide',
            when: 'editorTextFocus && config.cSpell.showCommandsInEditorContextMenu && cSpell.editorMenuContext.hasIssues && cSpell.context.showDecorations',
            group: 'A_cspell@002',
        },
    ],
    'cSpell.spelling': [
        {
            command: 'cSpell.suggestSpellingCorrections',
            when: 'editorTextFocus && !config.cSpell.showSuggestionsLinkInEditorContextMenu && cSpell.editorMenuContext.showSuggestions',
            group: 'A_cspell@001',
        },
        {
            command: 'cSpell.addWordToDictionary',
            when: 'editorTextFocus && cSpell.editorMenuContext.addWordToDictionary',
            group: 'A_cspell@010',
        },
        {
            command: 'cSpell.addWordToFolderDictionary',
            when: 'editorTextFocus && cSpell.editorMenuContext.addWordToFolderDictionary',
            group: 'A_cspell@020',
        },
        {
            command: 'cSpell.addWordToWorkspaceDictionary',
            when: 'editorTextFocus && cSpell.editorMenuContext.addWordToWorkspaceDictionary',
            group: 'A_cspell@030',
        },
        {
            command: 'cSpell.addWordToCSpellConfig',
            when: 'editorTextFocus && cSpell.editorMenuContext.addWordToCSpellConfig',
            group: 'A_cspell@050',
        },
        {
            command: 'cSpell.addWordToFolderSettings',
            when: 'editorTextFocus && cSpell.editorMenuContext.addWordToFolderSettings',
            group: 'A_cspell@051',
        },
        {
            command: 'cSpell.addWordToWorkspaceSettings',
            when: 'editorTextFocus && cSpell.editorMenuContext.addWordToWorkspaceSettings',
            group: 'A_cspell@052',
        },
        {
            command: 'cSpell.addWordToUserDictionary',
            when: 'editorTextFocus && cSpell.editorMenuContext.addWordToUserDictionary',
            group: 'A_cspell@055',
        },
        {
            command: 'cSpell.addWordToUserSettings',
            when: 'editorTextFocus && cSpell.editorMenuContext.addWordToUserSettings',
            group: 'A_cspell@056',
        },
        {
            command: 'cSpell.addIssuesToDictionary',
            when: 'editorTextFocus && cSpell.editorMenuContext.addIssuesToDictionary',
            group: 'A_cspell@060',
        },
        {
            command: 'cSpell.addIgnoreWord',
            when: 'editorTextFocus && cSpell.editorMenuContext.addIgnoreWord',
            group: 'A_cspell@090',
        },
        {
            command: 'cSpell.createCSpellConfig',
            when: 'editorTextFocus && cSpell.editorMenuContext.createCSpellConfig',
            group: 'B_cspell@010',
        },
        {
            command: 'cSpell.createCustomDictionary',
            when: 'editorTextFocus && cSpell.editorMenuContext.createCustomDictionary',
            group: 'B_cspell@020',
        },
    ],
    'cSpell.configMenu': [
        {
            command: 'cSpell.createCSpellConfig',
            when: 'editorTextFocus && cSpell.editorMenuContext.createCSpellConfig',
            group: 'A_cspell@010',
        },
        {
            command: 'cSpell.createCustomDictionary',
            when: 'editorTextFocus && cSpell.editorMenuContext.createCustomDictionary',
            group: 'A_cspell@070',
        },
    ],
    commandPalette: [
        {
            command: 'cSpellRegExpTester.testRegExp',
            when: 'config.cSpell.experimental.enableRegexpView',
        },
        {
            command: 'cSpellRegExpTester.editRegExp',
            when: 'view == cSpellRegExpView',
        },
    ],
    'view/title': [
        {
            command: 'cSpell.show',
            when: '!cSpell.context.showDecorations && view == cSpellIssuesViewByFile',
            group: 'navigation',
        },
        {
            command: 'cSpell.hide',
            when: 'cSpell.context.showDecorations && view == cSpellIssuesViewByFile',
            group: 'navigation',
        },
    ],
    'view/item/context': [
        {
            command: 'cSpellRegExpTester.editRegExp',
            when: 'view == cSpellRegExpView && viewItem == regexp',
            group: 'inline',
        },
        {
            command: 'cSpell.issueViewer.item.autoFixSpellingIssues',
            when: 'view == cSpellIssuesViewByIssue && viewItem == issue.hasPreferred',
            group: 'inline',
        },
        {
            command: 'cSpell.issueViewer.item.addWordToDictionary',
            when: 'view == cSpellIssuesViewByIssue && viewItem == issue',
            group: 'inline',
        },
        {
            command: 'cSpell.issuesViewByFile.item.autoFixSpellingIssues',
            when: 'view == cSpellIssuesViewByFile && viewItem == issue.FileWithIssuesTreeItem.hasPreferred',
            group: 'inline',
        },
        {
            command: 'cSpell.issuesViewByFile.item.addWordToDictionary',
            when: 'view == cSpellIssuesViewByFile && viewItem == issue.FileIssueTreeItem',
            group: 'inline',
        },
    ],
};

export const submenus: ISubmenu[] = [
    {
        id: 'cSpell.spelling',
        label: 'Spelling',
    },
    {
        id: 'cSpell.configMenu',
        label: 'Spell Checker Configuration',
    },
];
