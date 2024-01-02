export function groupByField<T, K extends keyof T>(items: T[], field: K): Map<T[K], T[]> {
    const map = new Map<T[K], T[]>();
    for (const item of items) {
        const k = item[field];
        const a = map.get(k) || [];
        a.push(item);
        map.set(k, a);
    }
    return map;
}
