type ErrorHandler<T> = (e: unknown) => T;

function defaultHandler(e: unknown) {
    console.error(e);
    return undefined;
}

export function catchPromise<T, U>(p: Promise<T>, handler: ErrorHandler<U>): Promise<T | U>;
export function catchPromise<T>(p: Promise<T>, handler?: ErrorHandler<T | undefined>): Promise<T | undefined>;
export function catchPromise<T>(p: Promise<T>, handler?: ErrorHandler<T | undefined>): Promise<T | undefined> {
    handler ??= defaultHandler;
    return p.catch(handler);
}
