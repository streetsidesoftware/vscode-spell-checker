import { describe, expect, test, jest } from '@jest/globals';

import { createDisposable, injectDisposable, createDisposableFromList } from './disposable.js';

describe('disposable', () => {
    test('createDisposable', () => {
        const dispose = jest.fn();
        const myDisposable = createDisposable(dispose);

        function use() {
            using obj = myDisposable;
        }
        use();
        expect(dispose).toHaveBeenCalledTimes(1);
    });

    test('createDisposable thisArg', () => {
        const myObj = {
            callMe: jest.fn(),
        };
        const dispose = jest.fn(myObj.callMe);
        const myDisposable = createDisposable(dispose, myObj);

        function use() {
            using obj = myDisposable;
        }
        use();
        expect(dispose).toHaveBeenCalledTimes(1);
        expect(myObj.callMe).toHaveBeenCalledTimes(1);
    });

    test('injectDisposable', () => {
        const myObj = {
            callMe: jest.fn(),
        };
        const dispose = jest.fn(myObj.callMe);
        const myDisposable = injectDisposable(myObj, dispose);

        function use() {
            using obj = myDisposable;
        }
        use();
        expect(dispose).toHaveBeenCalledTimes(1);
        expect(myObj.callMe).toHaveBeenCalledTimes(1);
    });

    test('double disposed', () => {
        const dispose = jest.fn();
        const myDisposable = createDisposable(dispose);

        function use() {
            using obj = myDisposable;
        }
        use();
        use();
        expect(dispose).toHaveBeenCalledTimes(1);
    });

    test('createDisposableFromList', () => {
        let count = 0;
        const disposables = [
            createDisposable(() => (count += 1)),
            createDisposable(() => (count += 10)),
            createDisposable(() => (count += 100)),
        ];
        function use() {
            using obj = createDisposableFromList(disposables);
        }
        use();
        expect(count).toBe(111);
    });

    test('dispose errors', () => {
        let count = 0;
        const err = Error('Expected Error');
        const disposables = [
            createDisposable(() => (count += 1)),
            createDisposable(() => {
                throw err;
            }),
            { dispose: () => (count += 100) },
            { [Symbol.dispose]: () => (count += 1000) },
            createDisposable(() => (count += 10000)),
        ];
        function use() {
            using obj = createDisposableFromList(disposables);
        }
        expect(use).toThrow(err);
        expect(count).toBe(11101);
    });
});
