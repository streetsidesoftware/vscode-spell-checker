import type { DisposableLike } from 'utils-disposables';
import { disposeOf } from 'utils-disposables';

import type { Subscribable } from '../Subscribables';

export function toAsyncIterable<T>(source: Subscribable<T>): AsyncIterable<T> {
    let done = false;
    let sourceDone = false;
    let disposable: DisposableLike | undefined = undefined;
    let pNextResolve: ResolveFn<IteratorResult<T>> | undefined = undefined;
    const buffer: T[] = [];

    function stop() {
        done = true;
        sourceDone = true;
        disposeOf(disposable);
        disposable = undefined;
    }

    function resolveValue(result: IteratorResult<T>): boolean {
        if (!pNextResolve) return false;
        const resolve = pNextResolve;
        pNextResolve = undefined;
        resolve(result);
        return true;
    }

    function onNotify(value: T): void {
        if (resolveValue({ value })) return;
        buffer.push(value);
    }

    function onDone() {
        sourceDone = true;
        if (pNextResolve && !buffer.length) {
            done = true;
            return resolveValue({ done: true, value: undefined });
        }
    }

    function listen() {
        if (disposable || sourceDone) return;
        disposable = source.subscribe({ notify: onNotify, done: onDone });
    }

    async function next(): Promise<IteratorResult<T>> {
        if (done) return { done, value: undefined };
        if (buffer.length) {
            const nextValue = buffer.shift() as T;
            return { value: nextValue };
        }
        if (sourceDone) {
            done = true;
            return { done, value: undefined };
        }

        listen();

        const pNext = new Promise<IteratorResult<T>>((resolve) => {
            pNextResolve = resolve;
        });
        return pNext;
    }

    async function iterReturn(): Promise<IteratorResult<T>> {
        stop();
        return { done: true, value: undefined };
    }

    function getIterator(): AsyncIterator<T> {
        return {
            next,
            return: iterReturn,
        };
    }

    return {
        [Symbol.asyncIterator]: getIterator,
    };
}
type ResolveFn<T> = (value: T | PromiseLike<T>) => void;
