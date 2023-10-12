type ErrorHandler<T> = (e: unknown) => T;

function defaultHandler(e: unknown) {
    console.error(e);
    return undefined;
}

function contextHandler(context: string | undefined): (e: unknown) => undefined {
    if (!context) return defaultHandler;
    return (e) => {
        console.error('%s: %s', context, e);
        return undefined;
    };
}

/**
 * Used for catching promises that are not returned. A fire and forget situation.
 * @param p - the promise to catch
 * @param handler - a handler to handle the rejection.
 */
export function catchPromise<T, U>(p: Promise<T>, handler: ErrorHandler<U>): Promise<T | U>;
/**
 * Used for catching promises that are not returned. A fire and forget situation.
 * If the promise is rejected, it is resolved with `undefined`.
 * @param p - the promise to catch
 */
export function catchPromise<T>(p: Promise<T>): Promise<T | undefined>;
export function catchPromise<T>(p: Promise<T>, context: string): Promise<T | undefined>;
export function catchPromise<T>(p: Promise<T>, handler?: ErrorHandler<T | undefined>): Promise<T | undefined>;
export async function catchPromise<T>(p: Promise<T>, handlerOrContext?: ErrorHandler<T | undefined> | string): Promise<T | undefined> {
    const handler = typeof handlerOrContext === 'function' ? handlerOrContext : contextHandler(handlerOrContext);
    try {
        return await p;
    } catch (e) {
        return handler(e);
    }
}
