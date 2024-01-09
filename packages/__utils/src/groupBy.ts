export function groupByField<T, K extends keyof T>(items: readonly T[], field: K): Map<T[K], T[]> {
    const map = new Map<T[K], T[]>();
    for (const item of items) {
        const k = item[field];
        const a = map.get(k) || [];
        a.push(item);
        map.set(k, a);
    }
    return map;
}

export function groupByKey<T, K>(items: readonly T[], keyFn: (item: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const item of items) {
        const k = keyFn(item);
        const a = map.get(k) || [];
        a.push(item);
        map.set(k, a);
    }
    return map;
}
