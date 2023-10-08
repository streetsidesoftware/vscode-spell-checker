import { afterEach, describe, expect, test, vi } from 'vitest';

import type { Logger } from './logger';
import { createLogger, LogLevel, LogLevelMasks, logLevelToLogLevelMask } from './logger';

describe('logger', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });
    test('createLogger', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        const logger = createLogger();
        expect(logger.isMethodEnabled('log')).toBe(true);
        logger.log('hello');
        expect(log).toHaveBeenLastCalledWith('hello');

        logger.enableLog(false);
        expect(logger.isMethodEnabled('log')).toBe(false);
        logger.log('again hello');
        expect(log).toHaveBeenLastCalledWith('hello');

        logger.enableLog(true);
        expect(logger.isMethodEnabled('log')).toBe(true);
        logger.log('again hello');
        expect(log).toHaveBeenLastCalledWith('again hello');

        logger.enableLog(false);
        expect(logger.isMethodEnabled('log')).toBe(false);
        logger.enableLog();
        expect(logger.isMethodEnabled('log')).toBe(true);
    });

    test('createLogger logLevel', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const logger = createLogger();
        logger.setLogLevelMask(logLevelToLogLevelMask(LogLevel.error));
        logger.log('log hello');
        logger.error('error hello');
        expect(log).toHaveBeenCalledTimes(0);
        expect(error).toHaveBeenLastCalledWith('error hello');
        logger.setLogLevelMask(logLevelToLogLevelMask(LogLevel.debug));
        logger.log('hello');
        expect(log).toHaveBeenLastCalledWith('hello');
        logger.setLogLevelMask(logLevelToLogLevelMask(LogLevel.info));
        logger.log('hello again');
        expect(log).toHaveBeenLastCalledWith('hello');

        expect(logger.isMethodEnabled('error')).toBe(true);
        logger.setLogLevelMask(0);
        logger.error('this is an error');
        expect(error).toHaveBeenLastCalledWith('error hello');
        expect(logger.isMethodEnabled('error')).toBe(false);
    });

    test('createLogger with custom logger', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const custom: Logger = {
            log: vi.fn(),
            error: vi.fn(),
            info: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
        };
        const logger = createLogger(custom, LogLevel.none);
        logger.setLogLevelMask(LogLevelMasks.everything);
        logger.log('log hello');
        logger.error('error hello');
        expect(custom.log).toHaveBeenCalledWith('log hello');
        expect(custom.error).toHaveBeenLastCalledWith('error hello');
        expect(log).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
        logger.setLogger(console);
        logger.log('hello');
        expect(log).toHaveBeenCalledWith('hello');
        expect(custom.log).toHaveBeenLastCalledWith('log hello');
    });
});
