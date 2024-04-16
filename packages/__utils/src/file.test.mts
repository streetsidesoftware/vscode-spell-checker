import { describe, expect, test } from 'vitest';
import { URI as Uri } from 'vscode-uri';

import { fileExists } from './file.js';

describe('Validate file', () => {
    test('fileExists', async () => {
        await expect(fileExists(Uri.parse(import.meta.url))).resolves.toBe(true);
        await expect(fileExists(Uri.file(__filename + '.not.found'))).resolves.toBe(false);
    });
});
