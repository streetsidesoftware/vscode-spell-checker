import { format } from 'node:util';

export function isErrorLike(e: unknown): e is Error {
    if (e instanceof Error) return true;
    if (!e || typeof e !== 'object') return false;
    const err = e as Error;
    return typeof err.message === 'string' && typeof err.name === 'string';
}

export function toError(e: unknown): Error {
    if (isErrorLike(e)) {
        return e;
    }
    const err = new Error(format('Error: %o', e));
    err.cause = e;
    return err;
}

export function formatLogMessage(reason: unknown, context: string) {
    return format('Error: context (%s): %o', context, reason);
}

export function squelch(context?: string): (e: unknown | Error) => undefined {
    return (e) => {
        if (context && isErrorLike(e)) {
            console.log(formatLogMessage(e, context));
        }
        return undefined;
    };
}
