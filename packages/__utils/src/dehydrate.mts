import assert from 'assert';

type Primitive = string | number | boolean | null | undefined;

type PrimitiveSet = Set<Primitive | PrimitiveObject | PrimitiveArray>;
type PrimitiveMap = Map<
    Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap,
    Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap
>;

interface PrimitiveObject {
    readonly [key: string]: Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap;
}
type PrimitiveArray = readonly (Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap)[];

type PrimitiveElement = Primitive;
interface ObjectElement {
    /**
     * The Type of object.
     * - S: Set
     * - M: Map
     * - O: Object
     */
    readonly t?: 'S' | 'M' | 'O';
    /**
     * Index to the keys.
     */
    readonly k?: number;
    /**
     * Index to the values.
     */
    readonly v?: number;
}

type Index = number;
/**
 * A string array is an array of indexes to strings that can be joined into a single string.
 * Nested arrays are flattened.
 */
type StringArray = [...Index[]];

type ArrayElement = readonly (Index | StringArray)[];

type Element = Readonly<PrimitiveElement | ObjectElement | ArrayElement>;

type Header = string;

type Dehydrated = [Header, ...Element[]];

type Serializable = Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap;

type Hydrated = Readonly<Serializable>;

// const splitRegex = /[- _/]/g;
// const blockSplitRegex = /^sha\d/;

export interface NormalizeJsonOptions {
    sortKeys?: boolean;
    /**
     * Dedupe objects and arrays.
     * Implies `sortKeys`.
     */
    dedupe?: boolean;
}

const dataHeader = 'Dehydrated JSON v1';

const collator = new Intl.Collator('en', {
    usage: 'sort',
    numeric: true,
    sensitivity: 'variant',
    caseFirst: 'upper',
    ignorePunctuation: false,
});
const compare = collator.compare;

export function dehydrate<V extends Serializable>(json: V, options?: NormalizeJsonOptions): Dehydrated {
    const data = [dataHeader] as Dehydrated;
    const dedupe = options?.dedupe ?? true;
    const sortKeys = options?.sortKeys || dedupe;
    let emptyObjIdx = 0;

    const cache = new Map<unknown, number>([[undefined, 0]]);
    const referenced = new Set<number>();
    const cachedArrays = new Map<number, { idx: number; v: number[] }[]>();
    /**
     * To dedupe objects.
     * ```ts
     * cacheObjs.get(keyIdx)?.get(valueIdx);
     * ```
     */
    const cacheObjs = new Map<number, Map<number, number>>();
    const cacheMapSetObjs = new Map<number, Map<number, number>>();

    function primitiveToIdx(value: Primitive): number {
        const found = cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = data.push(value) - 1;
        cache.set(value, idx);
        return idx;
    }

    function objSetToIdx(value: Set<Serializable>): number {
        const found = cache.get(value);
        if (found !== undefined) {
            referenced.add(found);
            return found;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);
        const keys = [...value];

        const k = arrToIdx(keys);
        const useIdx = dedupe ? stashObj(cacheMapSetObjs, idx, k, 0) : idx;

        if (useIdx !== idx) {
            assert(data.length == idx + 1);
            data.length = idx;
            cache.set(value, useIdx);
            return useIdx;
        }

        data[idx] = { t: 'S', k };

        return idx;
    }

    function objMapToIdx(value: Map<Serializable, Serializable>): number {
        const found = cache.get(value);
        if (found !== undefined) {
            referenced.add(found);
            return found;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);
        const entries = [...value.entries()];

        const k = arrToIdx(entries.map(([key]) => key));
        const v = arrToIdx(entries.map(([, value]) => value));

        const useIdx = dedupe ? stashObj(cacheMapSetObjs, idx, k, v) : idx;

        if (useIdx !== idx) {
            assert(data.length == idx + 1);
            data.length = idx;
            cache.set(value, useIdx);
            return useIdx;
        }

        data[idx] = { t: 'M', k, v };

        return idx;
    }

    function objToIdx(value: PrimitiveObject): number {
        const found = cache.get(value);
        if (found !== undefined) {
            referenced.add(found);
            return found;
        }

        const entries = Object.entries(value);

        if (!entries.length) {
            if (emptyObjIdx) {
                return emptyObjIdx;
            }
            const idx = data.push({}) - 1;
            emptyObjIdx = idx;
            return idx;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);

        if (sortKeys) {
            entries.sort(([a], [b]) => compare(a, b));
        }

        const k = arrToIdx(entries.map(([key]) => key));
        const v = arrToIdx(entries.map(([, value]) => value));

        const useIdx = dedupe ? stashObj(cacheObjs, idx, k, v) : idx;

        if (useIdx !== idx) {
            assert(data.length == idx + 1);
            data.length = idx;
            cache.set(value, useIdx);
            return useIdx;
        }

        data[idx] = { k, v };

        return idx;
    }

    function stashObj(cacheObjs: Map<number, Map<number, number>>, idx: number, keyIdx: number, valueIdx: number): number {
        let found = cacheObjs.get(keyIdx);
        if (!found) {
            found = new Map();
            cacheObjs.set(keyIdx, found);
        }
        const foundIdx = found.get(valueIdx);
        if (foundIdx) {
            return referenced.has(idx) ? idx : foundIdx;
        }
        found.set(valueIdx, idx);
        return idx;
    }

    function stashArray(idx: number, indexValues: number[]): number {
        const indexHash = simpleHash(indexValues);
        let found = cachedArrays.get(indexHash);
        if (!found) {
            found = [];
            cachedArrays.set(indexHash, found);
        }
        const foundIdx = found.find((entry) => isEqual(entry.v, indexValues));
        if (foundIdx) {
            return referenced.has(idx) ? idx : foundIdx.idx;
        }
        found.push({ idx, v: indexValues });
        return idx;
    }

    function arrToIdx(value: PrimitiveArray): number {
        const found = cache.get(value);
        if (found !== undefined) {
            referenced.add(found);
            return found;
        }

        const idx = data.push(0) - 1;
        cache.set(value, idx);

        const indexValues = value.map((idx) => valueToIdx(idx));
        const useIdx = dedupe ? stashArray(idx, indexValues) : idx;

        if (useIdx !== idx) {
            assert(data.length == idx + 1);
            data.length = idx;
            cache.set(value, useIdx);
            return useIdx;
        }

        data[idx] = indexValues;

        return idx;
    }

    function valueToIdx(value: Serializable): number {
        if (value === null) {
            return primitiveToIdx(null);
        }

        if (typeof value === 'object') {
            if (value instanceof Set) {
                return objSetToIdx(value);
            }
            if (value instanceof Map) {
                return objMapToIdx(value);
            }
            if (Array.isArray(value)) {
                return arrToIdx(value);
            }
            return objToIdx(value as PrimitiveObject);
        }

        return primitiveToIdx(value);
    }

    valueToIdx(json);

    return data;
}

function isEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function simpleHash(values: number[]): number {
    let hash = Math.sqrt(values.length);
    for (const value of values) {
        hash += value * value;
    }
    return hash;
}

export function hydrate(data: Dehydrated): Hydrated {
    const [header] = data;

    if (header !== dataHeader) {
        throw new Error('Invalid header');
    }

    const cache = new Map<number, Hydrated>([[0, undefined]]);
    /**
     * indexes that have been referenced by other objects.
     */
    const referenced = new Set<number>();

    function mergeKeysValues<K>(keys: readonly K[], values: PrimitiveArray): [K, Serializable][] {
        return keys.map((key, i) => [key, values[i]]);
    }

    function toSet(idx: number, elem: ObjectElement): PrimitiveSet {
        const { t, k } = elem;
        assert(t === 'S');
        const s: PrimitiveSet = k ? (new Set(idxToArr(k)) as PrimitiveSet) : new Set();
        cache.set(idx, s);
        return s;
    }

    function toMap(idx: number, elem: ObjectElement): PrimitiveMap {
        const { t, k, v } = elem;
        assert(t === 'M');
        const m: PrimitiveMap = !k || !v ? new Map() : (new Map(mergeKeysValues(idxToArr(k), idxToArr(v))) as PrimitiveMap);
        cache.set(idx, m);
        return m;
    }

    function toObj(idx: number, elem: ObjectElement): PrimitiveObject | PrimitiveSet | PrimitiveMap {
        const { t, k, v } = elem;

        if (t === 'S') return toSet(idx, elem);
        if (t === 'M') return toMap(idx, elem);

        const obj = {};
        cache.set(idx, obj);

        if (!k || !v) return obj;
        const keys = idxToArr(k) as string[];
        const values = idxToArr(v);
        Object.assign(obj, Object.fromEntries(mergeKeysValues(keys, values)));
        return obj;
    }

    function idxToArr(idx: number): PrimitiveArray {
        const element = data[idx];
        assert(Array.isArray(element));
        return toArr(idx, element);
    }

    function toArr(idx: number, refs: readonly number[]): PrimitiveArray {
        const placeHolder: Serializable[] = [];
        cache.set(idx, placeHolder);
        const arr = refs.map(idxToValue);
        // check if the array has been referenced by another object.
        if (!referenced.has(idx)) {
            // It has not, just replace the placeholder with the array.
            cache.set(idx, arr);
            return arr;
        }
        placeHolder.push(...arr);
        return placeHolder;
    }

    function idxToValue(idx: number): Serializable {
        if (!idx) return undefined;
        const found = cache.get(idx);
        if (found !== undefined) {
            referenced.add(idx);
            return found as Serializable;
        }

        const element = data[idx];

        if (typeof element === 'object') {
            if (element === null) return null;
            if (Array.isArray(element)) return toArr(idx, element);
            return toObj(idx, element as ObjectElement);
        }
        return element;
    }

    return idxToValue(1);
}
