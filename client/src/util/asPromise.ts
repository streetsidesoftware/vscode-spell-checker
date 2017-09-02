


export function asPromise<T, A>(fn: (a: A, cb: (err: Error, data: T) => any) => any): (a: A) => Promise<T>;
export function asPromise<T, A, B>(fn: (a: A, b: B, cb: (err: Error, data: T) => any) => any): (a: A, b: B) => Promise<T>;
export function asPromise<T, A, B, C>(fn: (a: A, b: B, c: C, cb: (err: Error, data: T) => any) => any): (a: A, b: B, c: C) => Promise<T>;
export function asPromise<T>(fn: (cb: (err: Error, data: T) => any) => any): () => Promise<T> {
    return function (...args: any[]) {
        const p = new Promise((resolve, reject) => {
            return fn.apply(this, [...args, (err: Error, data: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            }]);
        });
        return p;
    };
}