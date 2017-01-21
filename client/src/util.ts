
export function unique<T>(values: T[]): T[] {
    return [...(new Set<T>(values))];
}

export function freqCount<T>(values: T[]): [T, number][] {
    const map = new Map<T, number>();
    values.forEach(v => map.set(v, (map.get(v) || 0) + 1));
    return [...map.entries()];
}