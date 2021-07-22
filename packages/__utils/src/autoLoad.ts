export interface AutoLoadCache<K, T> {
    (key: K): T;
    get: (key: K) => T;
    clear: () => void;
    has: (key: K) => boolean;
    delete: (key: K) => void;
}

export function createAutoLoadCache<K, T>(loader: (key: K) => T): AutoLoadCache<K, T> {
    const cache = new Map<K, T>();
    const getter = ((key: K) => {
        const found = cache.get(key);
        if (found) return found;
        const value = loader(key);
        cache.set(key, value);
        return value;
    }) as AutoLoadCache<K, T>;
    getter.get = getter;
    getter.has = (key: K) => cache.has(key);
    getter.delete = (key: K) => cache.delete(key);
    getter.clear = () => cache.clear();
    return getter;
}

export interface LazyValue<T> {
    (): T;
    get: () => T;
    clear: () => void;
}

const notSet = Symbol('Value Not Set');

export function createLazyValue<T>(loader: () => T): LazyValue<T> {
    let v: T | symbol = notSet;
    const getter = (() => {
        if (v === notSet) {
            v = loader();
        }
        return v as T;
    }) as LazyValue<T>;

    getter.clear = () => (v = notSet);
    getter.get = getter;
    return getter;
}
