import { describe, expect, test } from 'vitest';

import { changesHaveTriggerCharacters, getSpellCheckDelayMs, run } from './server.mjs';

describe('Validate Server', () => {
    test('run', () => {
        // place holder
        expect(run).toBeDefined();
    });

    test('delays letter-only edits when trigger characters are configured', () => {
        expect(changesHaveTriggerCharacters([{ text: 'a' }], [' ', '\n'])).toBe(false);
        expect(getSpellCheckDelayMs([{ text: 'a' }], [' ', '\n'], 250)).toBe(250);
    });

    test('does not delay a space edit', () => {
        expect(changesHaveTriggerCharacters([{ text: 'word ' }], [' ', '\n'])).toBe(true);
        expect(getSpellCheckDelayMs([{ text: 'word ' }], [' ', '\n'], 250)).toBe(0);
    });

    test('does not delay a newline edit', () => {
        expect(changesHaveTriggerCharacters([{ text: '\n' }], [' ', '\n'])).toBe(true);
        expect(getSpellCheckDelayMs([{ text: '\n' }], [' ', '\n'], 250)).toBe(0);
    });

    test('checks all changes in a multi-change edit', () => {
        expect(changesHaveTriggerCharacters([{ text: ' ' }, { text: 'word' }], [' ', '\n'])).toBe(true);
        expect(getSpellCheckDelayMs([{ text: ' ' }, { text: 'word' }], [' ', '\n'], 250)).toBe(0);
    });

    test('does not delay validation requests without content changes', () => {
        expect(changesHaveTriggerCharacters(undefined, [' ', '\n'])).toBe(false);
        expect(getSpellCheckDelayMs(undefined, [' ', '\n'], 250)).toBe(0);
    });

    test('an empty trigger list preserves the configured delay', () => {
        expect(changesHaveTriggerCharacters([{ text: 'a' }], [])).toBe(false);
        expect(getSpellCheckDelayMs([{ text: 'a' }], [], 250)).toBe(250);
    });
});
