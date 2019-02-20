
export function defaultTo<T>(value: T): (v: T | undefined) => T {
    return (v: T | undefined) => v === undefined ? value : v;
}

export type Nested<T, K extends keyof T> = Exclude<T[K], undefined>;
export type NestedKey<T, K extends keyof T> = keyof Nested<T, K>;

export function extract<T, K extends keyof T>(key: K): (t: T | undefined) => T[K] | undefined;
export function extract<T, K extends keyof T, K2 extends NestedKey<T, K>>(key: K, k2: K2): (t: T | undefined) => Nested<T, K>[K2] | undefined;
export function extract<T, K extends keyof T, K2 extends NestedKey<T, K>, K3 extends NestedKey<Nested<T, K>, K2>>(key: K, k2: K2, k3: K3): (t: T | undefined) => Nested<Nested<T, K>, K2>[K3] | undefined;
export function extract<T, K extends keyof T, K2 extends NestedKey<T, K>, K3 extends NestedKey<Nested<T, K>, K2>, K4 extends NestedKey<Nested<Nested<T, K>, K2>, K3>>(key: K, k2: K2, k3: K3, k4: K4): (t: T | undefined) => Nested<Nested<Nested<T, K>, K2>, K3>[K4] | undefined;
export function extract<T, K extends keyof T>(key: K): (t: T | undefined) => T[K] | undefined {
    if (arguments.length > 1) {
        const args = [...arguments];
        return (t: T | undefined) => {
            let v = t as any;
            for (const k of args) {
                v = v === undefined ? undefined : v[k];
            }
            return v;
        };
    }
    return (t: T | undefined) => t === undefined ? undefined : t[key];
}

export function map<T, R>(fn: (t: T) => R): (t: T | undefined) => R | undefined {
    return (t: T | undefined) => t === undefined ? undefined : fn(t);
}

export function pipe<T>(t: T): T;
export function pipe<T, R>(t: T, fn: (t: T) => R): R;
export function pipe<T, R, S>(t: T, fn: (t: T) => R, fn2: (t: R) => S): S;
export function pipe<T, R, S, A>(t: T, fn: (t: T) => R, fn2: (t: R) => S, fn3: (t: S) => A): A;
export function pipe<T, R, S, A, B>(t: T, fn: (t: T) => R, fn2: (t: R) => S, fn3: (t: S) => A, fn4: (t: A) => B): B;
export function pipe<T, R, S, A, B, C>(t: T, fn: (t: T) => R, fn2: (t: R) => S, fn3: (t: S) => A, fn4: (t: A) => B, fn5: (t: B) => C): C;
export function pipe<T>(t: T): T {
    if (arguments.length > 1) {
        const fns = [...arguments].slice(1) as ((v: any) => any)[];
        let v = t as any;
        for (const fn of fns) {
            v = fn(v);
        }
        return v;
    }
    return t;
}
