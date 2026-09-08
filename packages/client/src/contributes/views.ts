import type { IViewWelcome, ViewContainers, Views } from '../vscode/types.ts';

export const viewsContainers: ViewContainers = {
    activitybar: [
        {
            id: 'cspell-info-explorer',
            title: 'Spell Checker Info',
            icon: 'resources/dark/check_circle.svg',
        },
        {
            id: 'cspell-regexp-explorer',
            title: 'Regular Expressions',
            contextualTitle: 'Spell Checker',
            icon: 'resources/dark/check_circle.svg',
        },
    ],
    panel: [
        {
            id: 'cspellPanel',
            title: 'Spell Checker',
            icon: 'resources/dark/check_circle.svg',
        },
    ],
};

export const views: Views = {
    'cspell-info-explorer': [
        {
            type: 'webview',
            id: 'cSpellInfoView',
            when: 'cSpell.context.displayCSpellInfo',
            icon: '$(lightbulb)',
            name: 'Spell Checker',
        },
    ],
    'cspell-regexp-explorer': [
        {
            id: 'cSpellRegExpView',
            name: 'Regular Expressions',
            icon: '$(code)',
            when: 'config.cSpell.experimental.enableRegexpView',
        },
    ],
    cspellPanel: [
        {
            type: 'tree',
            id: 'cSpellIssuesViewByFile',
            name: 'File Issues',
            contextualTitle: 'Spell Checker issues by file',
            icon: '$(lightbulb)',
            initialSize: 4,
            visibility: 'visible',
        },
        {
            type: 'tree',
            id: 'cSpellIssuesViewByIssue',
            name: 'Issues',
            contextualTitle: 'Spell Checker Issues',
            icon: '$(lightbulb)',
            initialSize: 1,
            visibility: 'visible',
        },
    ],
};

export const viewsWelcome: IViewWelcome[] = [];
