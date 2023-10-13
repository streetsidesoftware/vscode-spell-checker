import { describe, expect, test } from 'vitest';
import type { ConfigTarget } from 'webview-api';

import { configTargetOrder, configTargetToIndex, isConfigTarget } from './settingsHelper';

describe('Validate settings', () => {
    test('config order matches index', () => {
        configTargetOrder.forEach((target, index) => expect(index).toBe(configTargetToIndex[target]));
    });
    test('config order matches index', () => {
        expect(configTargetOrder.length).toBe(Object.entries(configTargetToIndex).length);
    });
    test('config order is immutable', () => {
        const order = configTargetOrder as ConfigTarget[];
        expect(() => order.push('user')).toThrow();
    });
    test('isConfigTarget', () => {
        expect(isConfigTarget('hello')).toBe(false);
        expect(isConfigTarget('user')).toBe(true);
    });
});
