import { describe, expect, test } from 'vitest';

import { contributes } from './index.ts';

describe('index', () => {
    test('the contributes object is defined', () => {
        expect(contributes).toBeDefined();
    });
});
