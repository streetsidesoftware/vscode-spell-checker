
export function unique<T>(values: T[]): T[] {
    return [...(new Set<T>(values))];
}

export function uniqueFilter<T>() {
    const seen = new Set<T>();
    return (v: T) => !!(!seen.has(v) && seen.add(v));
}

export function freqCount<T>(values: T[]): [T, number][] {
    const map = new Map<T, number>();
    values.forEach(v => map.set(v, (map.get(v) || 0) + 1));
    return [...map.entries()];
}

export type Maybe<T> = T | undefined;
