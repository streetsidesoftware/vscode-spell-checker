import assert from 'assert';

type Primitive = string | number | boolean | null | undefined;

interface PrimitiveObject {
    readonly [key: string]: Primitive | PrimitiveObject | PrimitiveArray;
}
type PrimitiveArray = readonly (Primitive | PrimitiveObject | PrimitiveArray)[];

type PrimitiveElement = Primitive;
interface ObjectElement {
    readonly k?: number;
    readonly v?: number;
}
type ArrayElement = readonly number[];

type Element = Readonly<PrimitiveElement | ObjectElement | ArrayElement>;

type Header = string;

type Dehydrated = [Header, ...Element[]];

type Hydrated = Readonly<Primitive | PrimitiveObject | PrimitiveArray>;

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

export function dehydrate<V extends Primitive | PrimitiveArray | PrimitiveObject>(json: V, options?: NormalizeJsonOptions): Dehydrated {
    const data = [dataHeader] as Dehydrated;
    const dedupe = options?.dedupe ?? true;
    const sortKeys = options?.sortKeys || dedupe;
    let emptyObjIdx = 0;

    const cache = new Map<unknown, number>([[undefined, 0]]);
    const referenced = new Set<number>();
    const cachedArrays = new Map<number, { idx: number; v: number[] }[]>();
    // /**
    //  * To dedupe objects.
    //  * ```ts
    //  * cacheObjs.get(keyIdx)?.get(valueIdx);
    //  * ```
    //  */
    // const cacheObjs = new Map<number, Map<number, number>>();

    function primitiveToIdx(value: Primitive): number {
        const found = cache.get(value);
        if (found !== undefined) {
            return found;
        }

        const idx = data.push(value) - 1;
        cache.set(value, idx);
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

        data[idx] = { k, v };

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
            data.length = idx;
            return useIdx;
        }

        data[idx] = indexValues;

        return idx;
    }

    function valueToIdx(value: Primitive | PrimitiveObject | PrimitiveArray): number {
        if (value === null) {
            return primitiveToIdx(null);
        }

        if (typeof value === 'object') {
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

    function toObj(idx: number, elem: ObjectElement): PrimitiveObject {
        const obj = {};
        cache.set(idx, obj);
        const { k, v } = elem;
        if (!k || !v) return obj;
        const keys = idxToArr(k) as string[];
        const values = idxToArr(v);
        Object.assign(obj, Object.fromEntries(keys.map((key, i) => [key, values[i]])));
        return obj;
    }

    function idxToArr(idx: number): PrimitiveArray {
        const element = data[idx];
        assert(Array.isArray(element));
        return toArr(idx, element);
    }

    function toArr(idx: number, refs: readonly number[]): PrimitiveArray {
        const placeHolder: (Primitive | PrimitiveObject | PrimitiveArray)[] = [];
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

    function idxToValue(idx: number): Primitive | PrimitiveObject | PrimitiveArray {
        if (!idx) return undefined;
        const found = cache.get(idx);
        if (found !== undefined) {
            referenced.add(idx);
            return found as Primitive | PrimitiveObject | PrimitiveArray;
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
