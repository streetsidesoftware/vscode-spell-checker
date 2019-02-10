import {
    IConnection,
} from 'vscode-languageserver';


export enum LogLevel {
    NONE = 0,
    ERROR,
    WARNING,
    INFO,
    DEBUG,
}

type LoggerFunction = (msg: string) => void;

interface LoggerFunctionMap {
    [index: number]: LoggerFunction;
}

export interface LogEntry {
    seq: number;
    level: LogLevel;
    ts: Date;
    msg: string;
}

const logLevels: [string, LogLevel][] = [
    [LogLevel[LogLevel.NONE], LogLevel.NONE],
    [LogLevel[LogLevel.ERROR], LogLevel.ERROR],
    [LogLevel[LogLevel.WARNING], LogLevel.WARNING],
    [LogLevel[LogLevel.INFO], LogLevel.INFO],
    [LogLevel[LogLevel.DEBUG], LogLevel.DEBUG],
    ['INFORMATION', LogLevel.INFO],
];

const levelMap = new Map<string, LogLevel>(logLevels);

const stub = () => { };

export class Logger {
    private seq = 0;
    private logs: LogEntry[] = [];
    private loggers: LoggerFunctionMap = {
        [LogLevel.NONE]: stub,
        [LogLevel.ERROR]: stub,
        [LogLevel.WARNING]: stub,
        [LogLevel.INFO]: stub,
        [LogLevel.DEBUG]: stub,
    };

    constructor(
        private logLevel = LogLevel.DEBUG,
        private connection?: IConnection,
    ) {
    }

    private writeLog(entry: LogEntry) {
        if (!this.connection) {
            this.logs.push(entry);
        } else {
            if (entry.level > this.logLevel) {
                return;
            }
            const message = `${entry.seq}\t${entry.ts.toISOString()}\t${entry.msg}`;
            const logger = this.loggers[entry.level];
            if (logger) {
                // console.log(message);
                logger(message);
            } else {
                console.error(`Unknown log level: ${entry.level}; msg: ${entry.msg}`);
            }
        }
    }

    logMessage(level: LogLevel, msg: string) {
        const seq = ++this.seq;
        const entry: LogEntry = {
            seq,
            level,
            ts: new Date(),
            msg
        };
        this.writeLog(entry);
    }

    set level(level: LogLevel | string) {
        this.logLevel = toLogLevel(level);
    }

    get level() {
        return this.logLevel;
    }

    setConnection(connection: IConnection) {
        this.connection = connection;
        this.connection.onExit(() => {
            this.connection = undefined;
            this.loggers[LogLevel.ERROR] = stub;
            this.loggers[LogLevel.WARNING] = stub;
            this.loggers[LogLevel.INFO] = stub;
            this.loggers[LogLevel.DEBUG] = stub;
        });
        this.loggers[LogLevel.ERROR] = (msg: string) => { connection.console.error(msg); };
        this.loggers[LogLevel.WARNING] = (msg: string) => { connection.console.warn(msg); };
        this.loggers[LogLevel.INFO] = (msg: string) => { connection.console.info(msg); };
        this.loggers[LogLevel.DEBUG] = (msg: string) => { connection.console.log(msg); };

        this.logs.forEach(log => this.writeLog(log));
        this.logs.length = 0;
    }

    error(msg: string) {
        this.logMessage(LogLevel.ERROR, msg);
    }

    warn(msg: string) {
        this.logMessage(LogLevel.WARNING, msg);
    }

    info(msg: string) {
        this.logMessage(LogLevel.INFO, msg);
    }

    debug(msg: string) {
        this.logMessage(LogLevel.DEBUG, msg);
    }

    log(msg: string) {
        this.debug(msg);
    }

    getPendingEntries(): LogEntry[] {
        return this.logs;
    }
}

function toLogLevel(level: string | LogLevel) {
    const lvl = typeof level === 'string'
        ? levelMap.get(level.toUpperCase()) || LogLevel.NONE
        : level;
    return typeof lvl !== 'number' || lvl < LogLevel.NONE || lvl > LogLevel.DEBUG
        ? LogLevel.DEBUG
        : lvl;
}
