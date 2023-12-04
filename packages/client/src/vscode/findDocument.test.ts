import { describe, expect, test, vi } from 'vitest';

import { findMatchingDocument } from './findDocument';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

describe('findDocument', () => {
    test('findMatchingDocument', () => {
        expect(findMatchingDocument).toBeDefined();
    });
});
