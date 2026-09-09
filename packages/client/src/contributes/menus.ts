import type { ISubmenu, Menus } from '../vscode/types.ts';
import { whenClause } from './whenClause.ts';

const ts = whenClause;

export const menus: Menus = {
    'editor/context': [
        {
            command: 'cSpell.suggestSpellingCorrections',
            when: ts`
                !editorReadonly
                && editorTextFocus
                && config.cSpell.showSuggestionsLinkInEditorContextMenu
                && cSpell.editorMenuContext.showSuggestions
                && cSpell.context.showDecorations
                && config.cSpell.menuItemsOnEditorContextMenu.suggestSpellingCorrections
            `,
            group: 'A_cspell@000',
        },
        {
            submenu: 'cSpell.spelling',
            group: 'A_cspell@001',
            when: ts`
                !editorReadonly
                && editorTextFocus
                && config.cSpell.showCommandsInEditorContextMenu
                && config.cSpell.menuItemsOnEditorContextMenu.spellingContextMenu
            `,
        },
        {
            command: 'cSpell.show',
            when: ts`
                editorTextFocus
                && config.cSpell.showCommandsInEditorContextMenu
                && cSpell.editorMenuContext.hasIssues
                && !cSpell.context.showDecorations
                && config.cSpell.menuItemsOnEditorContextMenu.showIssues
            `,
            group: 'A_cspell@002',
        },
        {
            command: 'cSpell.hide',
            when: ts`
                editorTextFocus
                && config.cSpell.showCommandsInEditorContextMenu
                && cSpell.editorMenuContext.hasIssues
                && cSpell.context.showDecorations
                && config.cSpell.menuItemsOnEditorContextMenu.hideIssues
            `,
            group: 'A_cspell@002',
        },
    ],
    'cSpell.spelling': [
        {
            command: 'cSpell.suggestSpellingCorrections',
            when: ts`
                editorTextFocus
                && !config.cSpell.showSuggestionsLinkInEditorContextMenu
                && cSpell.editorMenuContext.showSuggestions
                && config.cSpell.menuItemsOnSpellingContextMenu.suggestSpellingCorrections
            `,
            group: 'A_cspell@001',
        },
        {
            command: 'cSpell.addWordToDictionary',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.addWordToDictionary
                && config.cSpell.menuItemsOnSpellingContextMenu.addWordToDictionary
            `,
            group: 'A_cspell@010',
        },
        {
            command: 'cSpell.addWordToFolderDictionary',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.addWordToFolderDictionary
                && config.cSpell.menuItemsOnSpellingContextMenu.addWordToFolderDictionary
            `,
            group: 'A_cspell@020',
        },
        {
            command: 'cSpell.addWordToWorkspaceDictionary',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.addWordToWorkspaceDictionary
                && config.cSpell.menuItemsOnSpellingContextMenu.addWordToWorkspaceDictionary
            `,
            group: 'A_cspell@030',
        },
        {
            command: 'cSpell.addWordToCSpellConfig',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.addWordToCSpellConfig
                && config.cSpell.menuItemsOnSpellingContextMenu.addWordToCSpellConfig
            `,
            group: 'A_cspell@050',
        },
        {
            command: 'cSpell.addWordToFolderSettings',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.addWordToFolderSettings
                && config.cSpell.menuItemsOnSpellingContextMenu.addWordToFolderSettings
            `,
            group: 'A_cspell@051',
        },
        {
            command: 'cSpell.addWordToWorkspaceSettings',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.addWordToWorkspaceSettings
                && config.cSpell.menuItemsOnSpellingContextMenu.addWordToWorkspaceSettings
            `,
            group: 'A_cspell@052',
        },
        {
            command: 'cSpell.addWordToUserDictionary',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.addWordToUserDictionary
                && config.cSpell.menuItemsOnSpellingContextMenu.addWordToUserDictionary
            `,
            group: 'A_cspell@055',
        },
        {
            command: 'cSpell.addWordToUserSettings',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.addWordToUserSettings
                && config.cSpell.menuItemsOnSpellingContextMenu.addWordToUserSettings
            `,
            group: 'A_cspell@056',
        },
        {
            command: 'cSpell.addIssuesToDictionary',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.addIssuesToDictionary
                && config.cSpell.menuItemsOnSpellingContextMenu.addIssuesToDictionary
            `,
            group: 'A_cspell@060',
        },
        {
            command: 'cSpell.addIgnoreWord',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.addIgnoreWord
                && config.cSpell.menuItemsOnSpellingContextMenu.addIgnoreWord
            `,
            group: 'A_cspell@090',
        },
        {
            command: 'cSpell.createCSpellConfig',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.createCSpellConfig
                && config.cSpell.menuItemsOnSpellingContextMenu.createCSpellConfig
            `,
            group: 'B_cspell@010',
        },
        {
            command: 'cSpell.createCustomDictionary',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.createCustomDictionary
                && config.cSpell.menuItemsOnSpellingContextMenu.createCustomDictionary
            `,
            group: 'B_cspell@020',
        },
    ],
    'cSpell.configMenu': [
        {
            command: 'cSpell.createCSpellConfig',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.createCSpellConfig
                && cSpell.menuItemsOnCSpellConfigMenu.createCSpellConfig
            `,
            group: 'A_cspell@010',
        },
        {
            command: 'cSpell.createCustomDictionary',
            when: ts`
                editorTextFocus
                && cSpell.editorMenuContext.createCustomDictionary
                && cSpell.menuItemsOnCSpellConfigMenu.createCustomDictionary
            `,
            group: 'A_cspell@070',
        },
    ],
    commandPalette: [
        {
            command: 'cSpellRegExpTester.testRegExp',
            when: ts`
                config.cSpell.experimental.enableRegexpView
            `,
        },
        {
            command: 'cSpellRegExpTester.editRegExp',
            when: ts`
                view == cSpellRegExpView
            `,
        },
    ],
    'view/title': [
        {
            command: 'cSpell.show',
            when: ts`
                !cSpell.context.showDecorations && view == cSpellIssuesViewByFile
            `,
            group: 'navigation',
        },
        {
            command: 'cSpell.hide',
            when: ts`
                cSpell.context.showDecorations && view == cSpellIssuesViewByFile
            `,
            group: 'navigation',
        },
    ],
    'view/item/context': [
        {
            command: 'cSpellRegExpTester.editRegExp',
            when: ts`
                view == cSpellRegExpView && viewItem == regexp
            `,
            group: 'inline',
        },
        {
            command: 'cSpell.issueViewer.item.autoFixSpellingIssues',
            when: ts`
                view == cSpellIssuesViewByIssue && viewItem == issue.hasPreferred
            `,
            group: 'inline',
        },
        {
            command: 'cSpell.issueViewer.item.addWordToDictionary',
            when: ts`
                view == cSpellIssuesViewByIssue && viewItem == issue
            `,
            group: 'inline',
        },
        {
            command: 'cSpell.issuesViewByFile.item.autoFixSpellingIssues',
            when: ts`
                view == cSpellIssuesViewByFile && viewItem == issue.FileWithIssuesTreeItem.hasPreferred
            `,
            group: 'inline',
        },
        {
            command: 'cSpell.issuesViewByFile.item.addWordToDictionary',
            when: ts`
                view == cSpellIssuesViewByFile && viewItem == issue.FileIssueTreeItem
            `,
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
