/* eslint-disable @typescript-eslint/unified-signatures */
type ErrorHandler = (e: unknown) => void;

function defaultHandler(e: unknown) {
    console.error(e);
}

function contextHandler(context: string | undefined): (e: unknown) => void {
    if (!context) return defaultHandler;
    return (e) => {
        console.error(`${context}: ${e}`);
    };
}

/**
 * Used for catching promises that are not returned. A fire and forget situation.
 * @param p - the promise to catch
 * @param handler - a handler to handle the rejection.
 */
export function catchPromise<T, U>(p: Promise<T>, handler: ErrorHandler): Promise<T | U>;
/**
 * Used for catching promises that are not returned. A fire and forget situation.
 * If the promise is rejected, it is resolved with `undefined`.
 * @param p - the promise to catch
 */
export function catchPromise<T>(p: Promise<T>): Promise<void>;
/**
 * Used for catching promises that are not returned. A fire and forget situation.
 * If the promise is rejected, it is resolved with `undefined`.
 * @param p - the promise to catch
 * @param context - A context string to help identify where the error came from.
 */
export function catchPromise<T>(p: Promise<T>, context: string): Promise<void>;
/**
 * Used for catching promises that are not returned. A fire and forget situation.
 * If the promise is rejected, it is resolved with `undefined`.
 * @param p - the promise to catch
 * @param handler - a handler to handle the rejection.
 */
export function catchPromise<T>(p: Promise<T>, handler: ErrorHandler): Promise<void>;
export function catchPromise<T>(p: Promise<T>, handlerOrContext?: ErrorHandler | string): Promise<void>;
export async function catchPromise<T>(p: Promise<T>, handlerOrContext?: ErrorHandler | string): Promise<void> {
    const handler = typeof handlerOrContext === 'function' ? handlerOrContext : contextHandler(handlerOrContext);
    try {
        await p;
    } catch (e) {
        handler(e);
    }
}
