import { disposeOf } from 'utils-disposables';

import { createEmitter } from '../createFunctions';
import { rx } from '../rx';
import { awaitPromise, type AwaitPromiseErrorHandler } from './awaitPromise';

describe('awaitPromise', () => {
    test('awaitPromise', async () => {
        const emitter = createEmitter<Promise<string>>();

        const onReject = jest.fn();
        const stream = rx(emitter, awaitPromise(onReject));

        const notify = jest.fn();
        const dispose = stream.subscribe(notify);

        const p0 = Promise.resolve('p0');
        emitter.notify(p0);
        await p0;
        expect(notify).toHaveBeenLastCalledWith('p0');
        expect(onReject).not.toHaveBeenCalled();

        disposeOf(dispose);
    });

    test('awaitPromise rejected', async () => {
        const emitter = createEmitter<Promise<string>>();

        const onReject = jest.fn();
        const stream = rx(emitter, awaitPromise(onReject));

        const notify = jest.fn();
        const dispose = stream.subscribe(notify);

        const p0 = rejectIn<string>(1, 'error');
        emitter.notify(p0);
        await expect(p0).rejects.toEqual('error');
        expect(onReject).toHaveBeenCalledWith('error', expect.any(Function), p0);
        expect(notify).not.toHaveBeenCalled();

        disposeOf(dispose);
    });

    test('awaitPromise rejected and recovered', async () => {
        type T = Promise<string>;
        const emitter = createEmitter<T>();

        const promiseExpected = new WeakMap<T, string>();

        const onReject = jest.fn<void, Parameters<AwaitPromiseErrorHandler<T>>>((err, emitter, pValue) =>
            emitter(promiseExpected.get(pValue) || toStr(err)),
        );
        const stream = rx(emitter, awaitPromise(onReject));

        const notify = jest.fn();
        const dispose = stream.subscribe(notify);

        const p0 = rejectIn<string>(1, 'error 0');
        const p1 = rejectIn<string>(1, 'error 1');
        emitter.notify(p0);
        emitter.notify(p1);
        promiseExpected.set(p0, 'error P0');
        await expect(p0).rejects.toEqual('error 0');
        await expect(p1).rejects.toEqual('error 1');
        expect(onReject).toHaveBeenCalledWith('error 0', expect.any(Function), p0);
        expect(onReject).toHaveBeenCalledWith('error 1', expect.any(Function), p1);
        expect(notify).toHaveBeenCalledWith('error P0');
        expect(notify).toHaveBeenCalledWith('error 1');

        disposeOf(dispose);
    });
});

function rejectIn<T>(ms: number, err: unknown): Promise<T> {
    return new Promise((_resolve, reject) => setTimeout(() => reject(err), ms));
}

function toStr(err: unknown): string {
    return typeof err === 'string' ? err : `[${typeof err}]`;
}
