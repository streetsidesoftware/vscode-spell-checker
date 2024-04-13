import { describe, expect, test } from 'vitest';

import { readTextDocument } from './readTextDocument.mjs';

describe('readTextDocument', () => {
    test('readTextDocument', async () => {
        const doc = await readTextDocument(import.meta.url);
        expect(doc.uri).toEqual(import.meta.url);
        expect(doc.getText()).toContain("describe('readTextDocument'");
        expect(doc.languageId).toEqual('typescript');
    });
});
