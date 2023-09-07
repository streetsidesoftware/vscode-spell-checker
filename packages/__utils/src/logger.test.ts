import { Logger, LogLevel } from './logger';

describe('Validate Logger', () => {
    test('Logger Late Binding', () => {
        const logger = new Logger();
        logger.log('log');
        logger.debug('debug');
        logger.info('info');
        logger.warn('warn');
        logger.error('error');
        // late binding
        const connection = makeConnection();
        logger.setConnection(connection);

        expect(connection.exit).not.toEqual(exit);
        // test logging
        expect(connection.console.error.mock.calls.map((a) => a[0])).toEqual([expect.stringContaining('error')]);
        expect(connection.console.warn.mock.calls.map((a) => a[0])).toEqual([expect.stringContaining('warn')]);
        expect(connection.console.info.mock.calls.map((a) => a[0])).toEqual([expect.stringContaining('info')]);
        expect(connection.console.log.mock.calls.map((a) => a[0])).toEqual([
            expect.stringContaining('log'),
            expect.stringContaining('debug'),
        ]);
        // test sequence
        expect(connection.console.error.mock.calls.map((a) => a[0])).toEqual([expect.stringMatching(/^5\b/)]);
        expect(connection.console.warn.mock.calls.map((a) => a[0])).toEqual([expect.stringMatching(/^4\b/)]);
        expect(connection.console.info.mock.calls.map((a) => a[0])).toEqual([expect.stringMatching(/^3\b/)]);
        expect(connection.console.log.mock.calls.map((a) => a[0])).toEqual([expect.stringMatching(/^1\b/), expect.stringMatching(/^2\b/)]);
    });

    test('Logger Early Binding', () => {
        // late binding
        const connection = makeConnection();
        const logger = new Logger(LogLevel.DEBUG, connection);
        logger.log('log');
        logger.debug('debug');
        logger.info('info');
        logger.warn('warn');
        logger.error('error');

        expect(connection.exit).not.toEqual(exit);
        // test logging
        expect(connection.console.error.mock.calls.map((a) => a[0])).toEqual([expect.stringContaining('error')]);
        expect(connection.console.warn.mock.calls.map((a) => a[0])).toEqual([expect.stringContaining('warn')]);
        expect(connection.console.info.mock.calls.map((a) => a[0])).toEqual([expect.stringContaining('info')]);
        expect(connection.console.log.mock.calls.map((a) => a[0])).toEqual([
            expect.stringContaining('log'),
            expect.stringContaining('debug'),
        ]);
        // test sequence
        expect(connection.console.error.mock.calls.map((a) => a[0])).toEqual([expect.stringMatching(/^5\b/)]);
        expect(connection.console.warn.mock.calls.map((a) => a[0])).toEqual([expect.stringMatching(/^4\b/)]);
        expect(connection.console.info.mock.calls.map((a) => a[0])).toEqual([expect.stringMatching(/^3\b/)]);
        expect(connection.console.log.mock.calls.map((a) => a[0])).toEqual([expect.stringMatching(/^1\b/), expect.stringMatching(/^2\b/)]);
    });

    test('Logger onExit', () => {
        // late binding
        const connection = makeConnection();
        const logger = new Logger(LogLevel.DEBUG, connection);
        expect(connection.exit).not.toEqual(exit);

        logger.log('log');
        logger.debug('debug');
        logger.info('info');
        logger.warn('warn');

        // exit before the last log.
        connection.exit();
        logger.error('error');

        // test logging
        expect(connection.console.error.mock.calls.length).toEqual(0);
        expect(connection.console.warn.mock.calls.length).toEqual(1);
        expect(connection.console.info.mock.calls.length).toEqual(1);
        expect(connection.console.log.mock.calls.length).toEqual(2);

        // re-attach
        logger.setConnection(connection);
        expect(connection.console.error.mock.calls.length).toEqual(1);
        expect(connection.console.warn.mock.calls.length).toEqual(1);
        expect(connection.console.info.mock.calls.length).toEqual(1);
        expect(connection.console.log.mock.calls.length).toEqual(2);
    });

    test('Logger log level', () => {
        // late binding
        const connection = makeConnection();
        const logger = new Logger(LogLevel.WARNING, connection);
        expect(connection.exit).not.toEqual(exit);

        logger.log('log');
        logger.debug('debug');
        logger.info('info');
        logger.warn('warn');
        logger.error('error');

        // test logging
        expect(connection.console.error.mock.calls.length).toEqual(1);
        expect(connection.console.warn.mock.calls.length).toEqual(1);
        expect(connection.console.info.mock.calls.length).toEqual(0);
        expect(connection.console.log.mock.calls.length).toEqual(0);

        expect(logger.level).toBe(LogLevel.WARNING);
        logger.level = 'error';
        expect(logger.level).toBe(LogLevel.ERROR);
        logger.level = 'unknown';
        expect(logger.level).toBe(LogLevel.NONE);

        logger.level = LogLevel.DEBUG;
        logger.log('message');
        expect(connection.console.log.mock.calls.length).toEqual(1);
    });

    test('Logger get pending entries', () => {
        const logger = new Logger();
        logger.log('log');
        logger.debug('debug');
        logger.info('info');
        logger.warn('warn');
        logger.error('error');

        const entries = logger.getPendingEntries();
        expect(entries.map((e) => e.msg)).toEqual(['log', 'debug', 'info', 'warn', 'error']);
    });
});

function exit() {
    return;
}

function makeConnection() {
    const connection = {
        console: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
        },
        onExit: (fn: () => void) => (connection.exit = fn),
        exit,
    };
    return connection;
}
