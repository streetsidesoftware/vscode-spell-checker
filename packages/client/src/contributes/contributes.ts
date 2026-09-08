import type { IExtensionContributions } from '../vscode/types.ts';
import { commands } from './commands.ts';
import { menus, submenus } from './menus.ts';
import { views, viewsContainers, viewsWelcome } from './views.ts';

export type { IExtensionContributions } from '../vscode/types.ts';

export const contributes: IExtensionContributions = {
    commands,
    menus,
    submenus,
    views,
    viewsContainers,
    viewsWelcome,
    icons: {
        'cspell-issues': {
            description: 'cspell-issues lightbulb icon',
            default: 'lightbulb',
        },
    },
    languages: [
        {
            id: 'jsonc',
            extensions: ['cspell-ext.json', 'cspell-default.json', 'cspell.json', 'cspell.config.json', 'cSpell.json'],
        },
    ],
    jsonValidation: [
        {
            fileMatch: [
                '.cspell.config.json',
                '.cspell.config.jsonc',
                '.cspell.json',
                '.cspell.jsonc',
                'cspell-default.json',
                'cspell-ext.json',
                'cspell-import.json',
                'cspell-imports.json',
                'cspell-include.json',
                'cspell-includes.json',
                'cspell.config.json',
                'cspell.config.jsonc',
                'cspell.json',
                'cspell.jsonc',
                'cSpell.json',
            ],
            url: './node_modules/@cspell/cspell-types/cspell.schema.json',
        },
    ],
    configurationDefaults: {
        '[markdown]': {
            'cSpell.fixSpellingWithRenameProvider': true,
            'cSpell.advanced.feature.useReferenceProviderWithRename': true,
            'cSpell.advanced.feature.useReferenceProviderRemove': '/^#+\\s/',
        },
        '[scss]': {
            'cSpell.fixSpellingWithRenameProvider': false,
        },
        '[css]': {
            'cSpell.fixSpellingWithRenameProvider': false,
        },
        '[scminput]': {
            'cSpell.fixSpellingWithRenameProvider': false,
        },
    },
    terminal: {
        profiles: [
            {
                title: 'Spell Checker REPL',
                id: 'cSpell.terminal-profile',
            },
        ],
    },
};
