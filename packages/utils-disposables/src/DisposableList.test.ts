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

    test('', () => {
        const list = createDisposableList();
        expect(isDisposableHybrid(list)).toBe(true);
        expect(list.isDisposed());
    });
});
