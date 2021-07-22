export type Comparable = number | string | boolean | undefined | null | Date;
export type ComparableFilter<T> = T extends Comparable ? T : never;
export type ComparablePropertyNames<T> = { [K in keyof T]: T[K] extends Comparable ? K : never }[keyof T];
export type ComparableProperties<T> = Pick<T, ComparablePropertyNames<T>>;
export type CompareArg<T> = ComparablePropertyNames<T> | ((t: T) => Comparable);
export type CompareFn<T> = (a: T, b: T) => number;

export function compareBy<T>(extract: CompareArg<T>, ...extractors: CompareArg<T>[]): CompareFn<T>;
export function compareBy<T>(extract: CompareArg<T>): CompareFn<T>;
export function compareBy<T>(extract1: CompareArg<T>, extract2: CompareArg<T>): CompareFn<T>;
export function compareBy<T>(extract1: CompareArg<T>, extract2: CompareArg<T>, extract3: CompareArg<T>): CompareFn<T>;
export function compareBy<T>(extract: CompareArg<T>, ...extractors: CompareArg<T>[]): CompareFn<T> {
    const compareFns: CompareFn<T>[] = [extract, ...extractors]
        .map((ex) => (typeof ex === 'function' ? ex : (t: T) => t[ex]))
        .map((ex) => (a: T, b: T) => _compare(ex(a), ex(b)));
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

function _compare<T>(a: T, b: T): number {
    if (a === b) return 0;
    if (a === undefined) return 1;
    if (b === undefined) return -1;
    if (a === null) return 1;
    if (b === null) return -1;
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

export function compare<T>(a: ComparableFilter<T>, b: ComparableFilter<T>): number {
    return _compare(a, b);
}

export function reverse<T>(fn: CompareFn<T>): CompareFn<T> {
    return (a: T, b: T) => {
        const r = fn(a, b);
        return r ? -r : 0;
    };
}
