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
        expect(r.isRejected()).toBe(false);
        expect(r.isResolved()).toBe(false);
        r.resolve(resolveWith);
        await expect(r.promise).resolves.toBe(await resolveWith);
        expect(r.isPending()).toBe(false);
        expect(r.isRejected()).toBe(false);
        expect(r.isResolved()).toBe(true);
    });

    test.each`
        rejectWith
        ${'hello'}
        ${undefined}
        ${Promise.resolve('hello')}
    `('ResolvablePromise reject', async ({ rejectWith }) => {
        const r = new Resolvable<string>();
        expect(r.isPending()).toBe(true);
        expect(r.isRejected()).toBe(false);
        expect(r.isResolved()).toBe(false);
        r.reject(rejectWith);
        await expect(r.promise).rejects.toBe(rejectWith);
        expect(r.isPending()).toBe(false);
        expect(r.isRejected()).toBe(true);
        expect(r.isResolved()).toBe(false);
    });

    test('Double resolve', async () => {
        const r = new Resolvable<string>();
        r.resolve('one');
        await expect(r.promise).resolves.toBe('one');
        expect(() => r.resolve('two')).toThrow('Already Resolved');
        expect(() => r.reject('three')).toThrow('Already Resolved');
    });

    test('Double reject', async () => {
        const r = new Resolvable<string>();
        r.reject('one');
        await expect(r.promise).rejects.toBe('one');
        expect(() => r.reject('two')).toThrow('Already Resolved');
        expect(() => r.resolve('three')).toThrow('Already Resolved');
    });
});
