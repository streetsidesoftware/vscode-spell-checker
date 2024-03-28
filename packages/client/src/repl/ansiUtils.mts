import type { Direction } from 'node:tty';

import ansiEscapes from 'ansi-escapes';
import styles from 'ansi-styles';

export function green(text: string): string {
    return styles.green.open + text + styles.green.close;
}

export function red(text: string): string {
    return styles.red.open + text + styles.red.close;
}

export function yellow(text: string): string {
    return styles.yellow.open + text + styles.yellow.close;
}

export function crlf(text: string): string {
    return text.replace(/\n/g, '\r\n').replace(/\r+\r/g, '\r');
}

export function dim(text: string): string {
    return styles.dim.open + text + styles.dim.close;
}

export type ColorFn = (text: string) => string;

export function combine(fn: ColorFn, ...fns: ColorFn[]): ColorFn {
    return (text) => fns.reduce((acc, f) => f(acc), fn(text));
}

export function clearScreen() {
    return ansiEscapes.clearScreen;
}

export function clearLine(dir: Direction) {
    return dir > 0 ? ansiEscapes.eraseEndLine : dir < 0 ? ansiEscapes.eraseStartLine : ansiEscapes.eraseLine;
}

export function clearDown() {
    return ansiEscapes.eraseDown;
}

export function moveCursor(dx: number, dy?: number | undefined) {
    return ansiEscapes.cursorMove(dx, dy);
}

export function cursorTo(x: number, y?: number | undefined) {
    return ansiEscapes.cursorTo(x, y);
}
