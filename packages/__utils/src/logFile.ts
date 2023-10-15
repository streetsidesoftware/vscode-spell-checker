import { promises as fs } from 'fs';

import type { LoggerConnection } from './logger.js';

type Level = 'ERR' | 'INF' | 'WRN' | 'LOG';
type Console = LoggerConnection['console'];

export class LogFile implements Console {
    private fh: fs.FileHandle | undefined;
    private pfh: Promise<fs.FileHandle | undefined>;
    private _error: unknown | undefined;
    private _buffer: string[] = [];
    private _pending: Promise<void> | undefined;
    constructor(readonly filename: string) {
        this.pfh = fs
            .open(filename, 'a')
            .then((fh) => (this.fh = fh))
            .catch((e) => (console.error((this._error = e)), undefined));
    }

    onReady(): Promise<boolean> {
        return this.pfh.then((fh) => !!(fh && this.fh)).catch(() => false);
    }

    getError(): unknown | undefined {
        return this._error;
    }

    isReady(): boolean {
        return !!this.fh;
    }

    log(message: string): this {
        this._log('LOG', message);
        return this;
    }

    info(message: string): this {
        this._log('INF', message);
        return this;
    }

    warn(message: string): this {
        this._log('WRN', message);
        return this;
    }

    error(message: string): this {
        this._log('ERR', message);
        return this;
    }

    close(): Promise<void> {
        this.fh = undefined;
        return this.pfh.then((fh) => fh?.close()).catch((e) => console.error(e));
    }

    private _log(level: Level, message: string) {
        const prefix = `${new Date().toISOString()} ${level}: `;
        const padding = ' '.repeat(prefix.length);
        const lines = message.split('\n').join('\n' + padding);
        this._buffer.push(`${prefix}${lines}\n`);
        this.process();
    }

    private process() {
        if (this._pending) return;
        this._pending = this._processAsync();
    }

    private async _processAsync() {
        const fh = await this.pfh;
        for (let buffer = this._buffer; buffer.length; buffer = this._buffer) {
            this._buffer = [];
            try {
                await fh?.writeFile(buffer.join(''));
            } catch (e) {
                this._error = e;
            }
        }
        this._pending = undefined;
    }
}

export class LogFileConnection implements LoggerConnection {
    readonly console: LogFile;
    private onExitHandlers: (() => void)[] = [];

    constructor(readonly filename: string) {
        this.console = new LogFile(filename);
    }

    onExit(handler: () => void): void {
        this.onExitHandlers.push(handler);
    }

    async close(): Promise<void> {
        this.notifyOnExit();
        await this.console.close();
    }

    private notifyOnExit() {
        for (const fn of this.onExitHandlers) {
            try {
                fn();
            } catch (e) {
                console.error(e);
            }
        }
    }
}
