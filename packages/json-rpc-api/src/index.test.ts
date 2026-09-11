import { describe, expect, test } from 'vitest';

import { createClientApi, createServerApi } from './index.js';

describe('index', () => {
    test('createClientApi should be defined', () => {
        expect(createClientApi).toBeDefined();
        expect(typeof createClientApi).toBe('function');
    });

    test('createServerApi should be defined', () => {
        expect(createServerApi).toBeDefined();
        expect(typeof createServerApi).toBe('function');
    });
});
