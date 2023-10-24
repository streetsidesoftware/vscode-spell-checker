import type { OnErrorResolver } from './errors';
import { handleErrors, ignoreError } from './errors';

export function pVoid<T>(p: Promise<T> | Thenable<T>, context: string, onErrorHandler: OnErrorResolver = ignoreError): Promise<void> {
    const v = Promise.resolve(p).then(() => undefined);
    return handleErrors(v, context, onErrorHandler);
}
