import { describe, expect, test } from 'vitest';

import { ConfigFields } from './configFields.mjs';

describe('Validate configFields', () => {
    test('ConfigKeysByField', () => {
        const entries = Object.entries(ConfigFields);
        expect(entries.length).toBeGreaterThan(0);
        for (const [key, value] of entries) {
            expect(value).toBe(key);
        }
    });
});
