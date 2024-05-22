import { describe, expect, test } from 'vitest';

import { readDefaults } from '../test/schema.mjs';
import { languageIds } from './languageIds.js';

describe('settings/index', () => {
    test('Default languageIds', async () => {
        const defaultSettings = await readDefaults();
        const enabledLanguageIds = defaultSettings.get('cSpell.enabledLanguageIds');
        const enabledFileTypes = defaultSettings.get('cSpell.enabledFileTypes');
        const enabled = Object.entries(enabledFileTypes || {})
            .filter(([, enabled]) => enabled)
            .map(([lang]) => lang)
            .sort();
        expect([...languageIds].sort()).toEqual(enabled);
        expect(enabledLanguageIds).toBeUndefined();
    });
});
