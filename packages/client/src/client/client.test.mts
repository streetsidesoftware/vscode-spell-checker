import { describe, expect, test, vi } from 'vitest';

import * as client from './index.mjs';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

describe('vscode-languageclient', () => {
    test('client', () => {
        expect(client).toBeDefined();
    });
});
