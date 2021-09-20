import { toggleEnableSpellChecker, setEnableSpellChecking } from './settings.enable';

describe('settings.enable', () => {
    test('toggleEnableSpellChecker empty', async () => {
        await expect(toggleEnableSpellChecker({ targets: [], scopes: [] })).resolves.toBe(undefined);
    });

    test('setEnableSpellChecking empty', async () => {
        await expect(setEnableSpellChecking({ targets: [], scopes: [] }, true)).rejects.toEqual(
            new Error('No matching configuration found.')
        );
    });
});
