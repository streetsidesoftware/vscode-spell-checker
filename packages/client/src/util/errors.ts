import { window } from 'vscode';
import { format } from 'util';

export function isError(e: unknown): e is Error {
    if (!e || typeof e !== 'object') return false;
    const err = <Error>e;
    return err.message !== undefined && err.name !== undefined;
}

export const Resolvers = {
    logError,
    ignoreError,
    showError,
};

export const ErrorHandlers = {
    logErrors,
    silenceErrors,
    showErrors,
};

/*
 * Rejected Promise Resolvers
 */

/**
 * Error Resolver - show an error message before resolving the promise to undefined.
 * @param reason - the reason the promise was rejected.
 * @param context - the create context of the promise - used to trace the origin of the promise
 * @returns Promise - resolves to `undefined` if an error has occurred.
 */
export function showError(reason: unknown, context: string): Promise<void> {
    if (!isPromiseCanceledError(reason) && isError(reason)) {
        console.error(formatLogMessage(reason, context));
        return silenceErrors(window.showErrorMessage(reason.message), 'showError Resolver showErrorMessage').then(() => {});
    }
    return Promise.resolve();
}

/**
 * Error Resolver - log an error message before resolving the promise to undefined.
 * @param reason - the reason the promise was rejected.
 * @param context - the create context of the promise - used to trace the origin of the promise
 * @returns Promise - resolves to `undefined` if an error has occurred.
 */
export function logError(reason: unknown, context: string): Promise<void> {
    if (!isPromiseCanceledError(reason) && isError(reason)) {
        console.log(formatLogMessage(reason, context));
    }
    return Promise.resolve();
}

/**
 * Error Resolver - ignores any errors before resolving the promise to undefined.
 * @param reason - the reason the promise was rejected.
 * @param context - the create context of the promise - used to trace the origin of the promise
 * @returns Promise - resolves to `undefined` if an error has occurred.
 */
export function ignoreError(reason: unknown, context: string): Promise<void> {
    // The msg is generated for debugging purposes, it is not used.
    const msg = formatLogMessage(reason, context);
    // bogus logic so the compiler doesn't drop msg
    return Promise.resolve(toUndefined(msg));
}

export function handleErrors<T>(
    promiseOrFn: Promise<T> | (() => T | Promise<T>),
    context: string,
    onErrorResolver: OnErrorResolver = showError
): Promise<T | void> {
    const q = typeof promiseOrFn === 'function' ? (async () => promiseOrFn())() : promiseOrFn;
    return q.catch(withContextOnError(context, onErrorResolver));
}

export type ErrorHandler<T> = (p: Promise<T>) => Promise<T | void>;
export type OnErrorResolver = (reason: unknown, context: string) => Promise<void>;
type _OnErrorResolver = (reason: unknown) => Promise<void>;

/**
 * This is a wrapper function. It is designed to wrap another and catch any exceptions thrown by that function turning them in Promise<void>
 * @param fn - function to be wrapped
 * @param context - used to identify the context in which the function is being wrapped.
 * @param onErrorResolver - Used to resolve the rejected promise (it can write to a log or pop up a message)
 * @returns - a function with the same signature as `fn`
 */
export function catchErrors<P extends Array<any>, R>(
    fn: (...p: P) => Promise<R> | R,
    context: string,
    onErrorResolver: OnErrorResolver = showError
): (...p: P) => Promise<R | void> {
    return (...p) => handleErrors<R>(() => fn(...p), context, onErrorResolver);
}

export function logErrors<T>(promise: Promise<T> | Thenable<T>, context: string): Promise<T | void> {
    return handleErrors(Promise.resolve(promise), context, logError);
}

export function silenceErrors<T>(promise: Promise<T> | Thenable<T>, context: string): Promise<T | void> {
    return handleErrors(Promise.resolve(promise), context, ignoreError);
}

export function showErrors<T>(promise: Promise<T> | Thenable<T>, context: string): Promise<T | void> {
    return handleErrors(Promise.resolve(promise), context, showError);
}

function withContextOnError(context: string, onErrorResolver: OnErrorResolver): _OnErrorResolver {
    return (reason: unknown) => {
        return onErrorResolver(reason, context);
    };
}

function toUndefined<T>(_v: T) {
    return undefined;
}

function formatLogMessage(reason: unknown, context: string) {
    return format('Error: context (%s): %o', context, reason);
}

const canceledName = 'Canceled';

/**
 * Checks if the given error is a promise in canceled state
 * See: [vscode/errors.ts · microsoft/vscode](https://github.com/microsoft/vscode/blob/c15cb13a383dc9ff2dc0828152e374a6b9ecc2b3/src/vs/base/common/errors.ts#L143)
 */
function isPromiseCanceledError(error: any): boolean {
    return error instanceof Error && error.name === canceledName && error.message === canceledName;
}
