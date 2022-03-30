export function unique<T>(values: T[]): T[] {
    return [...new Set<T>(values)];
}

export function uniqueFilter<T>(): (v: T) => boolean;
export function uniqueFilter<T, U>(extractFn: (v: T) => U): (v: T) => boolean;
export function uniqueFilter<T>(extractFn?: (v: T) => T): (v: T) => boolean {
    const seen = new Set<T>();

    if (!extractFn) {
        return (v: T) => !seen.has(v) && (seen.add(v), true);
    }

    return (v: T) => {
        const vv = extractFn(v);
        return !seen.has(vv) && (seen.add(vv), true);
    };
}

export function freqCount<T>(values: T[]): [T, number][] {
    const map = new Map<T, number>();
    values.forEach((v) => map.set(v, (map.get(v) || 0) + 1));
    return [...map.entries()];
}

export type Maybe<T> = T | undefined;

export function isDefined<T>(t: T | undefined | null): t is T {
    return t !== undefined && t !== null;
}

export function mustBeDefined<T>(t: T | undefined | null): T {
    if (isDefined(t)) return t;
    throw new Error('Value must be defined.');
}

/**
 * Escape a string so it can be used in a RegExp.
 * @param s - string to escape
 */
export function escapeRegExp(s: string): string {
    return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}

/**
 * Breaks a string along word boundaries and removes an non-words.
 * @param text - text to split
 * @returns array of words
 */
export function textToWords(text: string): string[] {
    const isWord = /^[\p{L}\w'-]+$/u;
    const regExpWordBreaks = /(?<![\p{L}\w'-])(?=[\p{L}\w'-])|(?<=[\p{L}\w'-])(?![\p{L}\w'-])/gu;
    const split = text.normalize('NFC').split(regExpWordBreaks);
    const words = split.filter((w) => isWord.test(w));
    return words;
}

export function capitalize(text: string): string {
    return text.slice(0, 1).toUpperCase() + text.slice(1);
}

/**
 * Pick out fields from an Object.
 * @param src - source object
 * @param keys - keys to use
 * @returns a new object with key/values copied from src
 */
export function pick<T, K extends keyof T>(src: T, keys: readonly K[]): Pick<T, K> {
    const r: Partial<T> = {};
    for (const k of keys) {
        r[k] = src[k];
    }
    return r as Pick<T, K>;
}

export function setIfDefined<T, K extends keyof T>(record: T, key: K, value: T[K] | undefined): T {
    if (value !== undefined) {
        record[key] = value;
    }
    return record;
}
