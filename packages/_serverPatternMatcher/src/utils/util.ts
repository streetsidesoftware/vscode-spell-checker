export function uniqueFilter<T>(): (v: T) => boolean;
export function uniqueFilter<T, U>(extractFn: (v: T) => U): (v: T) => boolean;
export function uniqueFilter<T>(extractFn?: (v: T) => T): (v: T) => boolean {
    const values = new Set<T>();
    const extractor = extractFn || ((a) => a);
    return (v: T) => {
        const vv = extractor(v);
        const ret = !values.has(vv);
        values.add(vv);
        return ret;
    };
}

export function isDefined<T>(v: T | undefined | null): v is T {
    return v !== undefined && v !== null;
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
