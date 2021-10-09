type FN<K, R> = (key: K) => R;

export function debounce<V, R, K>(fn: FN<V, R>, timeoutMs: number, extractKey: (k: V) => K): FN<V, R>;
export function debounce<V, R>(fn: FN<V, R>, timeoutMs: number, extractKey?: (k: V) => V): FN<V, R>;
/**
 * Simple leading edge debounce function that uses `setTimeout`
 * @param fn - function to debounce
 * @param timeoutMs - how long to keep a value.
 * @returns a function
 */
export function debounce<V, R>(fn: FN<V, R>, timeoutMs: number, extractKey: (k: V) => V = (k) => k): FN<V, R> {
    const m = new Map<V, R>();
    return (value: V) => {
        const key = extractKey(value);
        const v = m.get(key);
        if (v !== undefined || m.has(key)) {
            return v!;
        }
        setTimeout(() => m.delete(key), timeoutMs);
        const r = fn(value);
        m.set(key, r);
        return r;
    };
}
