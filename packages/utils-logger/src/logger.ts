/* eslint-disable @typescript-eslint/no-explicit-any */

export type LogLevelMask = number;

export enum LogLevelMasks {
    none = 0,
    debug = 1 << 0,
    log = 1 << 1,
    info = 1 << 2,
    warn = 1 << 3,
    error = 1 << 4,
    everything = (1 << 5) - 1,
}

export enum LogLevel {
    none = 0,
    // Everything
    debug = 1,
    // Only log, info, warnings, or Errors,
    log,
    // Only info, warnings, or Errors,
    info,
    // Only warnings and Errors
    warn,
    // Only Errors
    error,
}

export type LogFn = (message?: any, ...optionalParams: any[]) => void;

export interface Logger {
    log: LogFn;
    error: LogFn;
    warn: LogFn;
    info: LogFn;
    debug: LogFn;
}

export type LogMethodName = keyof Logger;

/**
 *
 */
export class LoggerWithLogLevel implements Logger {
    public logLevelMask: LogLevelMask = 0;

    constructor(
        protected logger: Logger,
        logLevel: LogLevel,
    ) {
        this.logLevelMask = logLevelToLogLevelMask(logLevel);
    }

    public log = this.bindLogger('log', LogLevelMasks.log);
    public error = this.bindLogger('error', LogLevelMasks.error);
    public warn = this.bindLogger('warn', LogLevelMasks.warn);
    public info = this.bindLogger('info', LogLevelMasks.info);
    public debug = this.bindLogger('debug', LogLevelMasks.debug);

    public enableLog = this.bindEnable('log');
    public enableError = this.bindEnable('error');
    public enableWarn = this.bindEnable('warn');
    public enableInfo = this.bindEnable('info');
    public enableDebug = this.bindEnable('debug');

    public isMethodEnabled(method: LogMethodName): boolean {
        return !!(LogLevelMasks[method] & this.logLevelMask);
    }

    public setLogger(logger: Logger): this {
        this.logger = logger;
        return this;
    }

    public enableMethod(method: LogMethodName, enable = true) {
        const mask = LogLevelMasks[method];
        if (enable) {
            this.logLevelMask |= mask;
        } else {
            this.logLevelMask &= ~mask;
        }
        return this;
    }

    public setLogLevelMask(mask: number): this {
        this.logLevelMask = mask;
        return this;
    }

    private bindLogger(key: LogMethodName, level: LogLevelMasks): LogFn {
        return (...args) => {
            return (this.logLevelMask & level && this.logger[key](...args)) || undefined;
        };
    }

    private bindEnable(key: LogMethodName) {
        return (enable?: boolean) => this.enableMethod(key, enable);
    }
}

export function logLevelToLogLevelMask(level: LogLevel): LogLevelMask {
    if (!level) return 0;
    return LogLevelMasks.everything & (LogLevelMasks.everything << (level - 1));
}

export function createLogger(logger: Logger = console, level: LogLevel = LogLevel.log): LoggerWithLogLevel {
    return new LoggerWithLogLevel(logger, level);
}
