import { fileURLToPath } from 'url';
import { describe, expect, test, vi } from 'vitest';

import { watchFile } from './watchFile.mjs';

describe('watchFile', () => {
    test('should create a Watcher for a URL', () => {
        const filename = import.meta.url;
        const callback = vi.fn();
        const watcher = watchFile(filename, callback);
        try {
            expect(watcher).toHaveProperty('close');
            expect(watcher.close).toBeInstanceOf(Function);
        } finally {
            watcher.close();
        }
    });

    test('should create a Watcher for a filename', () => {
        const filename = fileURLToPath(import.meta.url);
        const callback = vi.fn();
        const watcher = watchFile(filename, callback);
        try {
            expect(watcher).toHaveProperty('close');
            expect(watcher.close).toBeInstanceOf(Function);
        } finally {
            watcher.close();
        }
    });

    test('should create a Watcher for a https URL', () => {
        const filename = 'https://example.com';
        const callback = vi.fn();
        const watcher = watchFile(filename, callback);
        try {
            expect(watcher).toHaveProperty('close');
            expect(watcher.close).toBeInstanceOf(Function);
        } finally {
            watcher.close();
        }
    });
});
