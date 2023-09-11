import { readDefaults } from '../test/schema';
import { languageIds } from './languageIds';

describe('settings/index', () => {
    test('Default languageIds', async () => {
        const defaultSettings = await readDefaults();
        const enabled = defaultSettings.get('cSpell.enabledLanguageIds');
        await expect([...languageIds].sort()).toEqual((Array.isArray(enabled) ? [...enabled] : [enabled]).sort());
    });
});
