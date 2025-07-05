import type { OnErrorResolver } from './errors.js';
import { handleErrors, ignoreError } from './errors.js';

export function pVoid<T>(p: Promise<T> | Thenable<T>, context: string, onErrorHandler: OnErrorResolver = ignoreError): Promise<void> {
    const v = Promise.resolve(p).then(() => undefined);
    return handleErrors(v, context, onErrorHandler);
}
