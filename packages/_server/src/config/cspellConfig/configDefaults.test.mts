import { describe, expect, test } from 'vitest';

import { readSchemaDefaults } from '../../test/schemaDefaults.mjs';
import { configDefaults } from './configDefaults.mjs';

describe('configDefaults', () => {
    test('should have default values', () => {
        expect(configDefaults).toBeDefined();
        expect(configDefaults.autocorrect).toBe(false);
        expect(configDefaults.autoFormatConfigFile).toBe(false);
        expect(configDefaults.checkLimit).toBe(500);
        expect(configDefaults.diagnosticLevel).toBe('Information');
        expect(configDefaults.logLevel).toBe('Error');
        expect(configDefaults.showStatus).toBe(true);
        expect(configDefaults.showStatusAlignment).toBe('Right');
        expect(configDefaults.showAutocompleteDirectiveSuggestions).toBe(true);
        expect(configDefaults.spellCheckDelayMs).toBe(50);
        expect(configDefaults.fixSpellingWithRenameProvider).toBe(true);
        expect(configDefaults.spellCheckOnlyWorkspaceFiles).toBe(false);
        expect(configDefaults.mergeCSpellSettings).toBe(true);
        expect(configDefaults.useLocallyInstalledCSpellDictionaries).toBe(true);
        expect(configDefaults.trustedWorkspace).toBe(true);
    });

    test('should match the defaults in spell-checker-config.schema.json', async () => {
        const schemaDefaults = await readSchemaDefaults();

        for (const [key, value] of Object.entries(configDefaults)) {
            expect(schemaDefaults, key).toHaveProperty(key);
            expect(schemaDefaults[key], key).toEqual(value);
        }

        expect(configDefaults).toEqual(schemaDefaults);
    });
});
