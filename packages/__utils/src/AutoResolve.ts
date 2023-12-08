interface IDisposable {
    dispose(): void;
}

export function autoResolve<K, V>(map: Map<K, V>, key: K, resolve: (k: K) => V): V {
    const found = map.get(key);
    if (found !== undefined || map.has(key)) return found as V;
    const value = resolve(key);
    map.set(key, value);
    return value;
}

export interface CacheStats {
    hits: number;
    misses: number;
    resolved: number;
    deletes: number;
    sets: number;
    clears: number;
    disposals: number;
}

export type AutoResolveCacheStats = Readonly<CacheStats>;

class CacheStatsTracker implements CacheStats {
    hits: number = 0;
    misses: number = 0;
    resolved: number = 0;
    deletes: number = 0;
    sets: number = 0;
    clears: number = 0;
    disposals: number = 0;

    stats(): AutoResolveCacheStats {
        return {
            hits: this.hits,
            misses: this.misses,
            resolved: this.resolved,
            deletes: this.deletes,
            sets: this.sets,
            clears: this.clears,
            disposals: this.disposals,
        };
    }

    clear(): void {
        this.hits = 0;
        this.misses = 0;
        this.resolved = 0;
        this.deletes = 0;
        this.sets = 0;
        ++this.clears;
    }
}

export class AutoResolveCache<K, V> implements IDisposable {
    readonly map = new Map<K, V>();

    get(k: K): V | undefined;
    get(k: K, resolve: (k: K) => V): V;
    get(k: K, resolve?: (k: K) => V): V | undefined;
    get(k: K, resolve?: (k: K) => V): V | undefined {
        return resolve ? autoResolve(this.map, k, resolve) : this.map.get(k);
    }

    has(k: K): boolean {
        return this.map.has(k);
    }

    set(k: K, v: V): this {
        this.map.set(k, v);
        return this;
    }

    delete(k: K): boolean {
        return this.map.delete(k);
    }

    clear(): void {
        this.map.clear();
    }

    dispose(): void {
        this.clear();
    }
}

export function createAutoResolveCache<K, V>(): AutoResolveCache<K, V> {
    return new AutoResolveCache();
}

export interface IWeakMap<K extends object, V> {
    get(k: K): V | undefined;
    set(k: K, v: V): this;
    has(k: K): boolean;
    delete(key: K): boolean;
}

export function autoResolveWeak<K extends object, V>(map: IWeakMap<K, V>, key: K, resolve: (k: K) => V): V {
    const found = map.get(key);
    if (found !== undefined || map.has(key)) return found as V;
    const value = resolve(key);
    map.set(key, value);
    return value;
}

export class AutoResolveWeakCache<K extends object, V> implements IWeakMap<K, V> {
    private _map = new WeakMap<K, V>();

    private _stats = new CacheStatsTracker();

    get(k: K): V | undefined;
    get(k: K, resolve: (k: K) => V): V;
    get(k: K, resolve?: (k: K) => V): V | undefined;
    get(k: K, resolve?: (k: K) => V): V | undefined {
        const map = this._map;
        const found = map.get(k);
        if (found !== undefined || map.has(k)) {
            ++this._stats.hits;
            return found as V;
        }
        ++this._stats.misses;
        if (!resolve) {
            return undefined;
        }
        ++this._stats.resolved;
        const value = resolve(k);
        map.set(k, value);
        return value;
    }

    get map() {
        return this._map;
    }

    has(k: K): boolean {
        return this._map.has(k);
    }

    set(k: K, v: V): this {
        ++this._stats.sets;
        this._map.set(k, v);
        return this;
    }

    clear(): void {
        this._stats.clear();
        this._map = new WeakMap();
    }

    delete(k: K): boolean {
        ++this._stats.deletes;
        return this._map.delete(k);
    }

    dispose(): void {
        ++this._stats.disposals;
        this.clear();
    }

    stats(): AutoResolveCacheStats {
        return this._stats.stats();
    }
}

export function createAutoResolveWeakCache<K extends object, V>(): AutoResolveWeakCache<K, V> {
    return new AutoResolveWeakCache();
}
