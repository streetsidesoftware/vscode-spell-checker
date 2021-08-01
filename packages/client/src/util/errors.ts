import { window } from 'vscode';

export function isError(e: unknown): e is Error {
    if (!e || typeof e !== 'object') return false;
    const err = <Error>e;
    return err.message !== undefined && err.name !== undefined;
}

export function onError(reason: unknown, context: string): Promise<void> {
    if (isError(reason)) {
        console.error('Error: context (%s): %o', context, reason);
        return silenceErrors(window.showErrorMessage(reason.message), 'onError Handler showErrorMessage').then(() => {});
    }
    return Promise.resolve();
}

export function logError(reason: unknown, context: string): Promise<void> {
    if (isError(reason)) {
        console.log('Error: context (%s): %o', context, reason);
    }
    return Promise.resolve();
}

export function handleErrors<T>(p: Promise<T>, context: string, onErrorHandler: OnErrorHandler = onError): Promise<T | void> {
    return handleErrorsEx(p, context, onErrorHandler);
}

export function handleErrorsEx<T>(p: Promise<T> | (() => Promise<T>), context: string, onErrorHandler = onError): Promise<T | void> {
    const q = typeof p === 'function' ? (async () => p())() : p;
    return q.catch(withContextOnError(context, onErrorHandler));
}

export type ErrorHandler<T> = (p: Promise<T>) => Promise<T | void>;
export type OnErrorHandler = (reason: unknown, context: string) => Promise<void>;
type _OnErrorHandler = (reason: unknown) => Promise<void>;

export function catchErrors<P extends Array<any>, R>(
    fn: (...p: P) => Promise<R> | R,
    context: string,
    onErrorHandler: OnErrorHandler = onError
): (...p: P) => Promise<R | void> {
    return (...p) => handleErrors((async () => fn(...p))(), context, onErrorHandler);
}

export function logErrors<T>(p: Promise<T> | Thenable<T>, context: string): Promise<T | void> {
    return Promise.resolve(p).catch(withContextOnError(context, logError));
}

export function silenceErrors<T>(p: Promise<T> | Thenable<T>, context: string): Promise<T | void> {
    return Promise.resolve(p).catch(withContextOnError(context, logError));
}

export function withContextOnError(context: string, onErrorHandler: OnErrorHandler): _OnErrorHandler {
    return (reason: unknown) => {
        return onErrorHandler(reason, context);
    };
}
