import type { Uri as URI } from 'vscode';
import { Uri as mockUri } from './uri';

interface ResourceMapKeyFn {
    (resource: URI): string;
}

export class ResourceMap<T> implements Map<URI, T> {
    private static readonly defaultToKey = (resource: URI) => resource.toString();

    readonly [Symbol.toStringTag] = 'ResourceMap';

    private readonly map: Map<string, T>;
    private readonly toKey: ResourceMapKeyFn;

    /**
     *
     * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
     */
    constructor(toKey?: ResourceMapKeyFn);

    /**
     *
     * @param other Another resource which this maps is created from
     * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
     */
    constructor(other?: ResourceMap<T>, toKey?: ResourceMapKeyFn);

    constructor(mapOrKeyFn?: ResourceMap<T> | ResourceMapKeyFn, toKey?: ResourceMapKeyFn) {
        if (mapOrKeyFn instanceof ResourceMap) {
            this.map = new Map(mapOrKeyFn.map);
            this.toKey = toKey ?? ResourceMap.defaultToKey;
        } else {
            this.map = new Map();
            this.toKey = mapOrKeyFn ?? ResourceMap.defaultToKey;
        }
    }

    set(resource: URI, value: T): this {
        this.map.set(this.toKey(resource), value);
        return this;
    }

    get(resource: URI): T | undefined {
        return this.map.get(this.toKey(resource));
    }

    has(resource: URI): boolean {
        return this.map.has(this.toKey(resource));
    }

    get size(): number {
        return this.map.size;
    }

    clear(): void {
        this.map.clear();
    }

    delete(resource: URI): boolean {
        return this.map.delete(this.toKey(resource));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    forEach(clb: (value: T, key: URI, map: Map<URI, T>) => void, thisArg?: any): void {
        if (typeof thisArg !== 'undefined') {
            clb = clb.bind(thisArg);
        }
        for (const [index, value] of this.map) {
            clb(value, mockUri.parse(index), <any>this);
        }
    }

    values(): IterableIterator<T> {
        return this.map.values();
    }

    *keys(): IterableIterator<URI> {
        for (const key of this.map.keys()) {
            yield mockUri.parse(key);
        }
    }

    *entries(): IterableIterator<[URI, T]> {
        for (const tuple of this.map.entries()) {
            yield [mockUri.parse(tuple[0]), tuple[1]];
        }
    }

    *[Symbol.iterator](): IterableIterator<[URI, T]> {
        for (const item of this.map) {
            yield [mockUri.parse(item[0]), item[1]];
        }
    }
}
