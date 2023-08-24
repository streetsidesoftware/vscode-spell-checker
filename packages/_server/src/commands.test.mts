import { describe, expect, test } from 'vitest';

import { clientCommands } from './commands.mjs';

describe('Validate Commands', () => {
    test('clientCommands', () => {
        // Place holder test.
        expect(clientCommands).toBeDefined();
    });

    test('clientCommands.addWordsToConfigFileFromServer', () => {
        expect(
            clientCommands.addWordsToConfigFileFromServer('Add to CSpell', ['one', 'two'], 'file:///document.ts', {
                uri: 'file:///cspell.json',
                name: 'Workspace Config',
            }),
        ).toMatchSnapshot();
    });

    test('clientCommands.addWordsToDictionaryFileFromServer', () => {
        expect(
            clientCommands.addWordsToDictionaryFileFromServer('Add to dictionary', ['one', 'two'], 'file:///document.ts', {
                uri: 'file:///dictionary.txt',
                name: 'Custom Terms',
            }),
        ).toMatchSnapshot();
    });

    test('clientCommands.addWordsToVSCodeSettingsFromServer', () => {
        expect(
            clientCommands.addWordsToVSCodeSettingsFromServer('Add to VS Code', ['one', 'two'], 'file:///document.ts', 'workspace'),
        ).toMatchSnapshot();
    });
});
