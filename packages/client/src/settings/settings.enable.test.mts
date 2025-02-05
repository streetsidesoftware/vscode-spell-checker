import { describe, expect, test, vi } from 'vitest';

import { UnableToFindTarget } from './configTargetHelper.mjs';
import { setEnableSpellChecking, toggleEnableSpellChecker } from './settings.enable.mjs';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

describe('settings.enable', () => {
    test('toggleEnableSpellChecker empty', async () => {
        await expect(toggleEnableSpellChecker({ targets: [], scopes: [] })).resolves.toBe(undefined);
    });

    test('setEnableSpellChecking empty', async () => {
        await expect(setEnableSpellChecking({ targets: [], scopes: [] }, true)).rejects.toEqual(
            new UnableToFindTarget('No matching configuration found.'),
        );
    });
});
