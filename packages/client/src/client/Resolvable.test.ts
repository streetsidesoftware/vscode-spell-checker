import { Resolvable } from './Resolvable';

describe('ResolvablePromise', () => {
    test.each`
        resolveWith
        ${'hello'}
        ${undefined}
        ${Promise.resolve('hello')}
    `('ResolvablePromise resolve', async ({ resolveWith }) => {
        const r = new Resolvable<string>();
        expect(r.isPending()).toBe(true);
        expect(r.isResolved()).toBe(false);
        r.attach(Promise.resolve(resolveWith));
        await expect(r.promise).resolves.toBe(await resolveWith);
        expect(r.isPending()).toBe(false);
        expect(r.isResolved()).toBe(true);
    });

    test.each`
        rejectWith
        ${'hello'}
        ${undefined}
        ${Error('ResolvablePromise reject')}
    `('ResolvablePromise reject', async ({ rejectWith }) => {
        const r = new Resolvable<string>();
        expect(r.isPending()).toBe(true);
        expect(r.isResolved()).toBe(false);
        const p = Promise.reject(rejectWith);
        r.attach(p);
        await expect(r.promise).rejects.toBe(rejectWith);
        expect(r.isPending()).toBe(false);
        expect(r.isResolved()).toBe(true);
    });

    test('Double resolve', async () => {
        try {
            const r = new Resolvable<string>();
            const pOne = Promise.resolve('one');
            r.attach(pOne);
            // Attaching the same promise is ok.
            r.attach(pOne);
            await expect(r.promise).resolves.toBe('one');
            await expect(() => r.attach(Promise.resolve('two'))).toThrow('Already Resolved');
        } catch (e) {
            console.error(e);
        }
    });
});
