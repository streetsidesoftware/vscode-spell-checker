import { afterEach, describe, expect, test, vi } from 'vitest';

import { catchPromise } from './catchPromise.mjs';

describe('catchPromise', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    test('catchPromise', async () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        await expect(catchPromise(Promise.reject('error'))).resolves.toBe(undefined);
        expect(err).toHaveBeenCalledWith('error');
    });

    test('catchPromise with context', async () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        await expect(catchPromise(Promise.reject(Error('test')), 'Testing')).resolves.toBe(undefined);
        expect(err).toHaveBeenCalledWith(expect.stringContaining(`Testing: `));
    });

    test('catchPromise custom handler', async () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        await expect(catchPromise(Promise.reject('error'), () => 23)).resolves.toBe(undefined);
        expect(err).not.toHaveBeenCalled();
    });

    test('catchPromise resolve', async () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        await expect(catchPromise(Promise.resolve('msg'))).resolves.toBe(undefined);
        expect(err).not.toHaveBeenCalled();
    });
});
