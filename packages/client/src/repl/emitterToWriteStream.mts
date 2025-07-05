/* eslint-disable @typescript-eslint/unified-signatures */
import type { Socket } from 'node:net';
import stream from 'node:stream';
import type { Direction, WriteStream as TTYWriteStream } from 'node:tty';

import type * as vscode from 'vscode';

import { clearDown, clearLine, cursorTo, moveCursor } from './ansiUtils.mjs';

interface WriteStream extends stream.Writable, Omit<TTYWriteStream, keyof Socket> {}

const debug = false;
const consoleDebug = debug ? console.debug : () => {};

export function emitterToWriteStream(emitter: vscode.EventEmitter<string>): WriteableEmitter {
    return new WriteableEmitter(emitter);
}

const allowedEncodings: Readonly<Record<string, true>> = {
    ascii: true,
    utf8: true,
    utf16le: true,
    ucs2: true,
    base64: true,
    base64url: true,
    latin1: true,
    binary: true,
    hex: true,
    'utf-8': true, // Alias of 'utf8'
    'ucs-2': true, // Alias of 'usc2'
    'utf-16le': true, // Alias of 'utf16le'
} as const satisfies Readonly<Record<BufferEncoding, true>>;

class WriteableEmitter extends stream.Writable implements WriteStream {
    #dimensions: vscode.TerminalDimensions = { columns: 80, rows: 24 };
    constructor(emitter: vscode.EventEmitter<string>) {
        super({
            write: (chunk: Buffer, encoding, callback) => {
                const enc = encoding in allowedEncodings ? encoding : undefined;
                const str: string = chunk.toString(enc);
                consoleDebug('write: %o', mapAnsiSequence(str));
                emitter.fire(str);
                setTimeout(callback, 0);
            },
        });
    }

    get dimensions() {
        return this.#dimensions;
    }

    set dimensions(value) {
        this.#dimensions = value;
    }

    /**
     * `writeStream.clearLine()` clears the current line of this `WriteStream` in a
     * direction identified by `dir`.
     * @since v0.7.7
     * @param callback Invoked once the operation completes.
     * @return `false` if the stream wishes for the calling code to wait for the `'drain'` event to be
     * emitted before continuing to write additional data; otherwise `true`.
     */
    clearLine(dir: Direction, callback?: () => void): boolean {
        consoleDebug('clearLine: %o', dir);
        return this.write(clearLine(dir), callback);
    }

    /**
     * `writeStream.clearScreenDown()` clears this `WriteStream` from the current
     * cursor down.
     * @since v0.7.7
     * @param callback Invoked once the operation completes.
     * @return `false` if the stream wishes for the calling code to wait for the `'drain'` event to be
     * emitted before continuing to write additional data; otherwise `true`.
     */
    clearScreenDown(callback?: () => void): boolean {
        consoleDebug('clearScreenDown');
        return this.write(clearDown(), callback);
    }

    /**
     * `writeStream.cursorTo()` moves this `WriteStream`'s cursor to the specified
     * position.
     * @since v0.7.7
     * @param callback Invoked once the operation completes.
     * @return `false` if the stream wishes for the calling code to wait for the `'drain'` event to be
     * emitted before continuing to write additional data; otherwise `true`.
     */
    cursorTo(x: number, y?: number, callback?: () => void): boolean;
    cursorTo(x: number, callback: () => void): boolean;
    cursorTo(x: number, y?: number | (() => void), callback?: () => void): boolean {
        consoleDebug('cursorTo: %o, %o', x, y);
        callback = typeof y === 'function' ? y : callback;
        y = typeof y === 'number' ? y : undefined;
        return this.write(cursorTo(x, y), callback);
    }

    /**
     * `writeStream.moveCursor()` moves this `WriteStream`'s cursor _relative_ to its
     * current position.
     * @since v0.7.7
     * @param callback Invoked once the operation completes.
     * @return `false` if the stream wishes for the calling code to wait for the `'drain'` event to be
     * emitted before continuing to write additional data; otherwise `true`.
     */
    moveCursor(dx: number, dy: number, callback?: () => void): boolean {
        consoleDebug('moveCursor: %o, %o', dx, dy);
        return this.write(moveCursor(dx, dy), callback);
    }

    /**
     * Returns:
     *
     * * `1` for 2,
     * * `4` for 16,
     * * `8` for 256,
     * * `24` for 16,777,216 colors supported.
     *
     * Use this to determine what colors the terminal supports. Due to the nature of
     * colors in terminals it is possible to either have false positives or false
     * negatives. It depends on process information and the environment variables that
     * may lie about what terminal is used.
     * It is possible to pass in an `env` object to simulate the usage of a specific
     * terminal. This can be useful to check how specific environment settings behave.
     *
     * To enforce a specific color support, use one of the below environment settings.
     *
     * * 2 colors: `FORCE_COLOR = 0` (Disables colors)
     * * 16 colors: `FORCE_COLOR = 1`
     * * 256 colors: `FORCE_COLOR = 2`
     * * 16,777,216 colors: `FORCE_COLOR = 3`
     *
     * Disabling color support is also possible by using the `NO_COLOR` and`NODE_DISABLE_COLORS` environment variables.
     * @since v9.9.0
     * @param [env=process.env] An object containing the environment variables to check.
     * This enables simulating the usage of a specific terminal.
     */
    getColorDepth(_env?: object): number {
        consoleDebug('getColorDepth');
        return 256;
    }

    /**
     * Returns `true` if the `writeStream` supports at least as many colors as provided
     * in `count`. Minimum support is 2 (black and white).
     *
     * This has the same false positives and negatives as described in `writeStream.getColorDepth()`.
     *
     * ```js
     * process.stdout.hasColors();
     * // Returns true or false depending on if `stdout` supports at least 16 colors.
     * process.stdout.hasColors(256);
     * // Returns true or false depending on if `stdout` supports at least 256 colors.
     * process.stdout.hasColors({ TMUX: '1' });
     * // Returns true.
     * process.stdout.hasColors(2 ** 24, { TMUX: '1' });
     * // Returns false (the environment setting pretends to support 2 ** 8 colors).
     * ```
     * @since v11.13.0, v10.16.0
     * @param [count=16] The number of colors that are requested (minimum 2).
     * @param [env=process.env] An object containing the environment variables to check.
     * This enables simulating the usage of a specific terminal.
     */
    hasColors(count?: number): boolean;
    hasColors(env?: object): boolean;
    hasColors(count: number, env?: object): boolean;
    hasColors(count?: number | object, _env?: object): boolean {
        consoleDebug('hasColors: %o', count);
        return typeof count !== 'number' || count <= 256;
    }

    /**
     * `writeStream.getWindowSize()` returns the size of the TTY
     * corresponding to this `WriteStream`. The array is of the type`[numColumns, numRows]`
     * where `numColumns` and `numRows` represent the number of columns and rows in the corresponding TTY.
     * @since v0.7.7
     */
    getWindowSize(): [number, number] {
        consoleDebug('getWindowSize: %o', this.#dimensions);
        return [this.#dimensions.columns, this.#dimensions.rows];
    }
    /**
     * A `number` specifying the number of columns the TTY currently has. This property
     * is updated whenever the `'resize'` event is emitted.
     * @since v0.7.7
     */
    get columns(): number {
        consoleDebug('columns: %o', this.#dimensions.columns);
        return this.#dimensions.columns;
    }
    /**
     * A `number` specifying the number of rows the TTY currently has. This property
     * is updated whenever the `'resize'` event is emitted.
     * @since v0.7.7
     */
    get rows(): number {
        consoleDebug('rows: %o', this.#dimensions.rows);
        return this.#dimensions.rows;
    }
    /**
     * A `boolean` that is always `true`.
     * @since v0.5.8
     */
    get isTTY() {
        consoleDebug('isTTY');
        return true;
    }
}

class ReadableEmitter extends stream.Readable {
    private buffer: string[] = [];
    private paused = true;
    private disposable: vscode.Disposable;
    constructor(emitter: vscode.EventEmitter<string>) {
        super({});
        this.disposable = emitter.event((data) => {
            this.buffer.push(data);
            this.pushBuffer();
        });
    }

    override _read() {
        this.paused = false;
        this.pushBuffer();
    }

    override _destroy() {
        this.disposable.dispose();
    }

    private pushBuffer() {
        if (this.paused) return;
        for (let data = this.buffer.shift(); data !== undefined && !this.paused; data = this.buffer.shift()) {
            consoleDebug('read: %o', mapAnsiSequence(data));
            this.push(data);
        }
    }
}

export function emitterToReadStream(emitter: vscode.EventEmitter<string>): stream.Readable {
    return new ReadableEmitter(emitter);
}

const charMap: Record<string, string> = {
    '\x1b': '␛',
    '\n': '↵',
    '\r': '↤',
    '\t': '⇥',
    ' ': '␣',
};

function mapAnsiSequence(seq: string): string {
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    return [...seq].map((char) => charMap[char] || char).join('');
}
