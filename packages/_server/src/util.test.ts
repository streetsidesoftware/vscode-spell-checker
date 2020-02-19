import { logError, log, logDebug, logInfo, setWorkspaceFolders, logger, uniqueFilter } from './util';

describe('Validate Util Functions', () => {
    test('Logging', () => {
        setWorkspaceFolders([__dirname, __dirname]);
        log('log', __filename);
        logError('error');
        logDebug('debug');
        logInfo('info');

        expect(logger.getPendingEntries().map(e => e.msg)).toEqual([
            expect.stringContaining('setWorkspaceFolders'),
            expect.stringContaining('setWorkspaceBase'),
            expect.stringMatching(/log\s+.*util.test.ts/),
            expect.stringContaining('error'),
            expect.stringContaining('debug'),
            expect.stringContaining('info'),
        ]);
    });

    test('Unique filter', () => {
        expect([].filter(uniqueFilter())).toEqual([]);
        expect([1, 2, 3].filter(uniqueFilter())).toEqual([1, 2, 3]);
        expect([1, 2, 3, 3, 2, 1].filter(uniqueFilter())).toEqual([1, 2, 3]);
        const a = { id: 'a', v: 1 };
        const b = { id: 'b', v: 1 };
        const aa = { id: 'a', v: 2 };
        expect([a, a, b, aa, b].filter(uniqueFilter())).toEqual([a, b, aa]);
        expect([a, a, b, aa, b, aa].filter(uniqueFilter(a => a.id))).toEqual([a, b]);
    });
});
