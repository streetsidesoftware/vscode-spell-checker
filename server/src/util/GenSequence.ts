
export type Maybe<T> = T | undefined;

export interface GenSequence<T> extends IterableIterator<T> {
    /** map values from type T to type U */
    map<U>(fnMap: (t: T) => U): GenSequence<U>;
    /** keep values where the fnFilter(t) returns true */
    filter(fnFilter: (t: T) => boolean): GenSequence<T>;
    /** reduce function see Array.reduce */
    reduce(fnReduce: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): Maybe<T>;
    reduce<U>(fnReduce: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): Maybe<U>;
    scan(fnReduce: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): GenSequence<T>;
    scan<U>(fnReduce: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): GenSequence<U>;
    combine<U, V>(fn: (t: T, u?: U) => V, j: Iterable<U>): GenSequence<V>;
    concat(j: Iterable<T>): GenSequence<T>;
    concatMap<U>(fn: (t: T) => Iterable<U>): GenSequence<U>;
    skip(n: number): GenSequence<T>;
    take(n: number): GenSequence<T>;
    toArray(): T[];
    toIterable(): IterableIterator<T>;
}

export interface GenIterable<T> {
    [Symbol.iterator](): IterableIterator<T>;
}

export function GenSequence<T>(i: GenIterable<T>): GenSequence<T> {
    return {
        [Symbol.iterator]: () => i[Symbol.iterator](),
        next: () => i[Symbol.iterator]().next(),   // late binding is intentional here.
        map: <U>(fn: (t: T) => U) => GenSequence(map(fn, i)),
        filter: (fnFilter: (t: T) => boolean) => GenSequence(filter(fnFilter, i)),
        reduce: <U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue: U) => {
            return reduce<T, U>(fnReduce, initValue, i);
        },
        scan: <U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue?: U) => {
            return GenSequence(scan(i, fnReduce, initValue));
        },
        combine: <U, V>(fn: (t: T, u: U) => V, j: Iterable<U>) =>  {
            return GenSequence(combine(fn, i, j));
        },
        concat: (j: Iterable<T>) => {
            return GenSequence(concat(i, j));
        },
        concatMap: <U>(fn: (t: T) => Iterable<U>) => {
            return GenSequence(concatMap(fn, i));
        },
        skip: (n: number) => {
            return GenSequence(skip(n, i));
        },
        take: (n: number) => {
            return GenSequence(take(n, i));
        },
        toArray: () => [...i[Symbol.iterator]()],
        toIterable: () => {
            return iterate(i);
        },
    };
}

export function* filter<T>(fnFilter: (t: T) => boolean, i: Iterable<T>) {
    for (let v of i) {
        if (fnFilter(v)) {
            yield v;
        }
    }
}

export function reduce<T, U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initialValue: U, i: Iterable<T>): Maybe<U>;
export function reduce<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: Maybe<T>, i: Iterable<T>): Maybe<T> {
    let index = 0;
    if (initialValue === undefined) {
        index = 1;
        const r = i[Symbol.iterator]().next();
        initialValue = r.value;
    }
    let prevValue = initialValue;
    for (let t of i) {
        const nextValue = fnReduce(prevValue, t, index);
        prevValue = nextValue;
        index += 1;
    }
    return prevValue;
}

export function scan<T, U>(i: Iterable<T>, fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue: U): IterableIterator<U>;
export function* scan<T>(i: Iterable<T>, fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initValue?: T): IterableIterator<T> {
    let index = 0;
    if (initValue === undefined) {
        index = 1;
        const r = i[Symbol.iterator]().next();
        initValue = r.value;
        if (! r.done) {
            yield r.value;
        }
    }
    let prevValue = initValue;
    for (let t of i) {
        const nextValue = fnReduce(prevValue, t, index);
        yield nextValue;
        prevValue = nextValue;
        index += 1;
    }
}

/**
 * apply a mapping function to an Iterable.
 */
export function map<T, U>(fnMap: (t: T) => U): (i: Iterable<T>) => IterableIterator<U>;
export function map<T, U>(fnMap: (t: T) => U, i: Iterable<T>): IterableIterator<U>;
export function map<T, U>(fnMap: (t: T) => U, i?: Iterable<T>): IterableIterator<U> | ((i: Iterable<T>) => IterableIterator<U>) {
    function* fn<T, U>(fnMap: (t: T) => U, i: Iterable<T>): IterableIterator<U> {
        for (let v of i) {
            yield fnMap(v);
        }
    }

    if (i !== undefined) {
        return fn(fnMap, i);
    }

    return function(i: Iterable<T>) {
        return fn(fnMap, i);
    };
}

/**
 * Combine two iterables together using fnMap function.
 */
export function* combine<T, U, V>(fnMap: (t: T, u?: U) => V, i: Iterable<T>, j: Iterable<U>): IterableIterator<V> {
    const jit = j[Symbol.iterator]();
    for (let r of i) {
        const s = jit.next().value;
        yield fnMap(r, s);
    }
}

/**
 * Concat two iterables together
 */
export function* concat<T>(i: Iterable<T>, j: Iterable<T>): IterableIterator<T> {
    yield *i;
    yield *j;
}

/**
 * Creates a scan function that can be used in a map function.
 */
export function scanMap<T, U>(accFn: (acc: U, value: T) => U, init: U): ((value: T) => U);
export function scanMap<T>(accFn: (acc: T, value: T) => T, init?: T): ((value: T) => T) {
    let acc = init;
    let first = true;
    return function(value: T): T {
        if (first && acc === undefined) {
            first = false;
            acc = value;
            return acc;
        }
        acc = accFn(acc as T, value);
        return acc;
    };
}


export function* skip<T>(n: number, i: Iterable<T>): IterableIterator<T> {
    let a = 0;
    for (let t of i) {
        if (a >= n) {
            yield t;
        }
        a += 1;
    }
}


export function* take<T>(n: number, i: Iterable<T>): IterableIterator<T> {
    let a = 0;
    if (n) {
        for (let t of i) {
            if (a >= n) {
                break;
            }
            yield t;
            a += 1;
        }
    }
}


export function* concatMap<T, U>(fn: (t: T) => Iterable<U>, i: Iterable<T>): IterableIterator<U> {
    for (let t of i) {
        for (let u of fn(t)) {
            yield u;
        }
    }
}


export function* iterate<T>(i: Iterable<T>) {
    yield* i;
}