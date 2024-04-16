import { describe, expect, test, vi } from 'vitest';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

import { hasWorkspaceLocation } from './settings.mjs';

describe('Validate settings.ts', () => {
    test('hasWorkspaceLocation', () => {
        expect(hasWorkspaceLocation()).toBe(false);
    });
});
