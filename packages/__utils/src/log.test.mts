import { describe, expect, test } from 'vitest';

import {
    consoleDebug,
    consoleError,
    consoleInfo,
    consoleLog,
    log,
    logDebug,
    logError,
    logger,
    logInfo,
    setWorkspaceFolders,
} from './log.js';

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
            expect.stringMatching(/^log\s+.*log.test.mts/),
            expect.stringContaining('error'),
            expect.stringContaining('debug'),
            expect.stringContaining('info'),
        ]);
    });

    test('console logging', () => {
        setWorkspaceFolders([__dirname, __dirname]);
        consoleLog('log', __filename);
        consoleError('error');
        consoleDebug('debug');
        consoleInfo('info');

        expect(logger.getPendingEntries().map((e) => e.msg)).toEqual([
            expect.stringContaining('setWorkspaceFolders'),
            expect.stringContaining('setWorkspaceBase'),
            expect.stringMatching(/^log\s+.*log.test.mts/),
            expect.stringContaining('error'),
            expect.stringContaining('debug'),
            expect.stringContaining('info'),
        ]);
    });
});
