import { window } from 'vscode';

export function isError(e: unknown): e is Error {
    if (!e || typeof e !== 'object') return false;
    const err = <Error>e;
    return err.message !== undefined && err.name !== undefined;
}

export function onError(reason: unknown): Promise<void> {
    if (isError(reason)) {
        silenceErrors(window.showErrorMessage(reason.message));
    }
    return Promise.resolve();
}

export function logError(reason: unknown): Promise<void> {
    if (isError(reason)) {
        console.log(reason);
    }
    return Promise.resolve();
}

export function handleErrors<T>(p: Promise<T>): Promise<T | void> {
    return p.catch(onError);
}

export function catchErrors<P extends Array<any>, R>(
    fn: (...p: P) => Promise<R> | R,
    handler = handleErrors
): (...p: P) => Promise<R | void> {
    return (...p) => handler(Promise.resolve(fn(...p)));
}

export function logErrors<T>(p: Promise<T> | Thenable<T>): Promise<T | void> {
    return Promise.resolve(p).catch(logError);
}

export function silenceErrors<T>(p: Promise<T> | Thenable<T>): Promise<T | void> {
    return Promise.resolve(p).catch(() => {});
}
