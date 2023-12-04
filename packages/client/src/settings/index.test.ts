import { describe, expect, test, vi } from 'vitest';

import * as index from './index';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

describe('settings/index', () => {
    test('index', () => {
        expect(typeof index.enableLocaleForTarget).toBe('function');
    });
});
