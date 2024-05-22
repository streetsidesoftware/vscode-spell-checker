import { describe, expect, test, vi } from 'vitest';

import { findMatchingDocument } from './findDocument.mjs';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

describe('findDocument', () => {
    test('findMatchingDocument', () => {
        expect(findMatchingDocument).toBeDefined();
    });
});
