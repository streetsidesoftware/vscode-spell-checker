import { CancelablePromise } from './CancelablePromise';

describe('Validate CancelablePromise', () => {
    test('Promise', () => {
        const rejected = Promise.reject('Rejected A');
        expect(rejected).toBeDefined();
        return rejected.catch(() => {});
    });

    test('Basic Tests', async () => {
        expect(await CancelablePromise.resolve('hello')).toBe('hello');
        expect(await CancelablePromise.reject('rejected').catch(r => r)).toBe('rejected');
        expect(await CancelablePromise
            .resolve('hello')
            .cancel('canceled')
            .catch(r => r)
        ).toEqual(expect.objectContaining({ reason: 'canceled' }));

        const r = await CancelablePromise
            .reject('hello')
            .cancel('canceled')
            .catch(r => r);
        expect(r).toEqual(expect.objectContaining({ reason: 'canceled' }));

        expect(await CancelablePromise
            .resolve('hello')
            .cancel('canceled')
            .then(_ => { throw new Error('reject')})
            .catch(r => r)
        ).toEqual(expect.objectContaining({ reason: 'canceled' }));

        expect(await CancelablePromise
            .resolve('hello')
            .then(a => a.length)
        ).toBe('hello'.length);
    });

    test('Multiple Promises', async () => {
        let resolve: (v?: string | PromiseLike<string>) => any = () => {}
        const a = new CancelablePromise<string>((_resolve, _) => {
            resolve = _resolve
        });
        const b = a.then(a => a);
        const c = a.then(s => s.length);
        const d = b.then(s => s.length);
        setTimeout(() => resolve('done'));
        b.cancel('stop').catch(() => {});
        await Promise.all([
            expect(a).resolves.toBe('done'),
            expect(c).resolves.toBe('done'.length),
            expect(b).rejects.toEqual(expect.objectContaining({ reason: 'stop' })),
            expect(d.catch(r => r)).resolves.toEqual(expect.objectContaining({ reason: 'stop' }))
        ]);
    });

    test('resolve', () => {
        const a = CancelablePromise.resolve('hello');
        const b = CancelablePromise.resolve(a).catch(a => a);
        b.cancel('stop');
        expect(b.isCanceled).toBe(true);
        expect(a.isCanceled).toBe(false);
    });
});
