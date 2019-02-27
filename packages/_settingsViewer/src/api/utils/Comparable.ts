export type Comparable = number | string;
export type CompareArg<T> = (keyof T) | ((t: T) => Comparable);
export type CompareFn<T> = (a: T, b: T) => number;

export function compareBy<T>(extract: CompareArg<T>, ...extractors: CompareArg<T>[]): CompareFn<T>;
export function compareBy<T>(extract: CompareArg<T>): CompareFn<T>;
export function compareBy<T>(extract1: CompareArg<T>, extract2: CompareArg<T>): CompareFn<T>;
export function compareBy<T>(extract1: CompareArg<T>, extract2: CompareArg<T>, extract3: CompareArg<T>): CompareFn<T>;
export function compareBy<T>(extract: CompareArg<T>, ...extractors: CompareArg<T>[]): CompareFn<T> {
    const compareFns: CompareFn<T>[] = [extract, ...extractors]
        .map(ex => (typeof ex === 'function' ? ex : (t: T) => t[ex]))
        .map(ex => ((a: T, b: T) => compare(ex(a), ex(b))));
    return compareEach(...compareFns);
}

export function compareByRev<T>(extract: CompareArg<T>, ...extractors: CompareArg<T>[]): CompareFn<T>;
export function compareByRev<T>(extract: CompareArg<T>): CompareFn<T>;
export function compareByRev<T>(extract1: CompareArg<T>, extract2: CompareArg<T>): CompareFn<T>;
export function compareByRev<T>(extract1: CompareArg<T>, extract2: CompareArg<T>, extract3: CompareArg<T>): CompareFn<T>;
export function compareByRev<T>(extract: CompareArg<T>, ...extractors: CompareArg<T>[]): CompareFn<T> {
    return reverse(compareBy(extract, ...extractors));
}

export function compareEach<T>(...compareFn: CompareFn<T>[]): CompareFn<T> {
    return (a: T, b: T) => {
        for (const fn of compareFn) {
            const r = fn(a, b);
            if (r) {
                return r;
            }
        }
        return 0;
    };
}

export function compare(a: any, b: any): number {
    if (a === b) return 0;
    if (a < b) return -1;
    if (a > b) return 1;
    // Have undefined and null sort after real values. This matches the behavior of `Array.sort`.
    if (a === undefined) return 1;
    if (a === null) return 1;
    return 0;
}

export function reverse<T>(fn: CompareFn<T>): CompareFn<T> {
    return (a: T, b: T) => { const r = fn(a, b); return r ? -r : 0 };
}
