import { describe, expect, test } from '@jest/globals';

import { type DisposableLike, disposeOf, isDisposableHybrid, isDisposed } from './disposable.js';
import { createDisposableList, DisposableList, InheritableDisposable } from './DisposableList.js';

describe('disposable', () => {
    test('InheritableDisposable', () => {
        let count = 0;
        class MyDisposable extends InheritableDisposable {
            constructor(disposables: DisposableLike[]) {
                super(disposables);
            }
        }

        function use() {
            using _d = new MyDisposable([() => (count += 10)]);
        }

        expect(count).toBe(0);

        use();

        expect(count).toBe(10);
    });

    test('DisposableList', () => {
        let count = 0;

        function use() {
            using list = new DisposableList([() => (count += 10)]);
            list.push(() => (count += 100));
        }

        expect(count).toBe(0);

        use();

        expect(count).toBe(110);
    });

    test('createDisposableList', () => {
        const list = createDisposableList();
        let count = 0;
        list.push(() => (count += 1));
        disposeOf(list);
        expect(count).toBe(1);
        expect(isDisposed(list)).toBe(true);
        expect(list.isDisposed()).toBe(true);
    });

    test('double dispose', () => {
        let count = 0;
        const list = createDisposableList([() => (count += 10)]);
        function use() {
            using aliasList = list;
            aliasList.push(() => (count += 100));
        }

        expect(list.length).toBe(1);
        use();

        expect(count).toBe(110);
        expect(list.length).toBe(0);

        expect(() => list.push(() => (count += 1000))).toThrowError('Already disposed, cannot add items.');

        expect(list.length).toBe(0);
        list.dispose();
        expect(list.length).toBe(0);

        expect(count).toBe(110);
    });

    test('isDisposableHybrid', () => {
        const list = createDisposableList();
        expect(isDisposableHybrid(list)).toBe(true);
        expect(list.isDisposed()).toBe(false);
    });

    test('delete', () => {
        const dispose = jest.fn();
        const list = createDisposableList();
        list.push(dispose);
        expect(list.disposables).toContain(dispose);
        list.delete(dispose);
        expect(list.disposables).not.toContain(dispose);
        // It is ok to delete undefined items from the list.
        expect(list.delete(undefined)).toBe(true);
    });

    test('add', () => {
        const dispose = jest.fn();
        const list = createDisposableList();
        expect(list.add(dispose)).toBe(true);
        expect(list.add(dispose)).toBe(false);
        expect(list.has(dispose)).toBe(true);
        expect(list.delete(dispose)).toBe(true);
        expect(list.has(dispose)).toBe(false);
        expect(list.delete(dispose)).toBe(false);
        expect(list.add(undefined)).toBe(false);
        expect(list.has(undefined)).toBe(false);
    });
});
