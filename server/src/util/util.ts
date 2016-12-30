
export function asPromise<T>(thenable: { then(fnOnFulfil: (value: T) => T | Promise<T> | void, fnOnReject?: (reason?: any) => any): any }) {
    return new Promise<T>((resolve, reject) => {
        thenable.then(resolve, reject);
    });
}
