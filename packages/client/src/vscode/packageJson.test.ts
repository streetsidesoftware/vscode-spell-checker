import type * as pkg from './packageJson';

describe('Validate Package Types', () => {
    test('api', () => {
        const pkgJson: pkg.PackageJson = {
            ...sample,
        };

        expect(pkgJson.contributes?.commands).toBeDefined();
        expect(pkgJson.contributes?.menus?.['editor/context']).toBeDefined();
    });
});

const sample = {
    name: 'code-spell-checker',
    description: 'Spelling checker for source code',
    displayName: 'Code Spell Checker',
    main: './packages/client/dist/extension.js',
    contributes: {
        menus: {
            'editor/context': [
                {
                    command: 'cSpell.addWordToFolderDictionary',
                    when: 'editorTextFocus && config.cSpell.showCommandsInEditorContextMenu && workspaceFolderCount != 0 && workspaceFolderCount != 1',
                    group: 'A_cspell@1',
                },
                {
                    command: 'cSpell.addWordToCSpellConfig',
                    when: 'editorTextFocus && cSpell.documentConfigContext.usesConfigFile',
                    group: 'A_cspell@5',
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
        },
        commands: [
            {
                command: 'cSpell.addWordToWorkspaceDictionary',
                category: 'Spell',
                title: 'Add Word to Workspace Dictionaries',
            },
            {
                command: 'cSpell.addWordToFolderDictionary',
                category: 'Spell',
                title: 'Add Word to Folder Dictionary',
            },
            {
                command: 'cSpellRegExpTester.editRegExp',
                title: 'Edit',
                icon: {
                    dark: 'resources/dark/edit.svg',
                    light: 'resources/light/edit.svg',
                },
            },
        ],
    },
};
