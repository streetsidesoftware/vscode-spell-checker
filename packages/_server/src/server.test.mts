import { describe, expect, test } from 'vitest';

import { getSpellCheckDelayMs, run, shouldTriggerSpellCheck } from './server.mjs';

describe('Validate Server', () => {
    test('run', () => {
        // place holder
        expect(run).toBeDefined();
    });

    test('does not trigger for letter-only edits', () => {
        expect(shouldTriggerSpellCheck([{ text: 'a' }], [' ', '\n'])).toBe(false);
    });

    test('triggers for a space edit', () => {
        expect(shouldTriggerSpellCheck([{ text: 'word ' }], [' ', '\n'])).toBe(true);
    });

    test('triggers for a newline edit', () => {
        expect(shouldTriggerSpellCheck([{ text: '\n' }], [' ', '\n'])).toBe(true);
    });

    test('checks all changes in a multi-change edit', () => {
        expect(shouldTriggerSpellCheck([{ text: ' ' }, { text: 'word' }], [' ', '\n'])).toBe(true);
    });

    test('an empty trigger list preserves the configured delay', () => {
        expect(shouldTriggerSpellCheck([{ text: 'a' }], [])).toBe(true);
        expect(getSpellCheckDelayMs([{ text: 'a' }], [], 250)).toBe(250);
    });
});
