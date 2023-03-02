import { log, logDebug, logError, logger, logInfo, setWorkspaceFolders } from './log';

describe('Validate Util Functions', () => {
    test('Logging', () => {
        setWorkspaceFolders([__dirname, __dirname]);
        log('log', __filename);
        logError('error');
        logDebug('debug');
        logInfo('info');

        expect(logger.getPendingEntries().map((e) => e.msg)).toEqual([
            expect.stringContaining('setWorkspaceFolders'),
            expect.stringContaining('setWorkspaceBase'),
            expect.stringMatching(/log\s+.*log.test.ts/),
            expect.stringContaining('error'),
            expect.stringContaining('debug'),
            expect.stringContaining('info'),
        ]);
    });
});
