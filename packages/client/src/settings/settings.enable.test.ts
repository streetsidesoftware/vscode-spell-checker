import { describe, expect, test, vi } from 'vitest';

import { setEnableSpellChecking, toggleEnableSpellChecker } from './settings.enable';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

describe('settings.enable', () => {
    test('toggleEnableSpellChecker empty', async () => {
        await expect(toggleEnableSpellChecker({ targets: [], scopes: [] })).resolves.toBe(undefined);
    });

    test('setEnableSpellChecking empty', async () => {
        await expect(setEnableSpellChecking({ targets: [], scopes: [] }, true)).rejects.toEqual(
            new Error('No matching configuration found.'),
        );
    });
});
