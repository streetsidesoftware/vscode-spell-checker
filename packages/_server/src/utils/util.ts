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
