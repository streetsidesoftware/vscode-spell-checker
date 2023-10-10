import { describe, expect, jest, test } from '@jest/globals';

import type { DisposableHybrid, DisposableLike, DisposeFn, ExcludeDisposableHybrid } from './disposable.js';
import {
    createDisposable,
    createDisposableFromList,
    createDisposeMethodFromList,
    disposeOf,
    getDisposableName,
    injectDisposable,
    isDisposableHybrid,
    isDisposed,
    makeDisposable,
    setDisposableName,
    setLogger,
} from './disposable.js';
import { InheritableDisposable } from './DisposableList.js';

describe('disposable', () => {
    test('createDisposable', () => {
        const dispose = jest.fn();
        const myDisposable = createDisposable(dispose);

        function use() {
            using _obj = myDisposable;
        }
        use();
        expect(dispose).toHaveBeenCalledTimes(1);
    });

    test('createDisposable named', () => {
        const dispose = jest.fn();
        const myDisposable = createDisposable(dispose, undefined, 'MyDisposable');

        function use() {
            using _obj = myDisposable;
        }
        expect(isDisposed(myDisposable)).toBe(false);
        use();
        expect(isDisposed(myDisposable)).toBe(true);
        expect(getDisposableName(myDisposable)).toBe('MyDisposable');
        expect(dispose).toHaveBeenCalledTimes(1);
    });

    test('createDisposable thisArg', () => {
        const myObj = {
            callMe: jest.fn(),
        };
        const dispose = jest.fn(myObj.callMe);
        const myDisposable = createDisposable(dispose, myObj);

        function use() {
            using _obj = myDisposable;
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
            using _obj = myDisposable;
        }
        use();
        expect(dispose).toHaveBeenCalledTimes(1);
        expect(myObj.callMe).toHaveBeenCalledTimes(1);
    });

    test('injectDisposable into Disposable type', () => {
        const myObj = {
            callMe: jest.fn(),
        };
        type MyObj = typeof myObj & DisposableHybrid;
        const dispose = jest.fn(myObj.callMe);
        const myDisposable: MyObj = injectDisposable<ExcludeDisposableHybrid<MyObj>>(myObj, dispose);

        function use() {
            using _obj = myDisposable;
        }
        use();
        expect(dispose).toHaveBeenCalledTimes(1);
        expect(myObj.callMe).toHaveBeenCalledTimes(1);
    });

    test('double disposed', () => {
        const dispose = jest.fn();
        const myDisposable = createDisposable(dispose);

        function use() {
            using _obj = myDisposable;
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
            using _obj = createDisposableFromList(disposables);
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
            using _obj = createDisposableFromList(disposables);
        }
        expect(use).toThrow(err);
        expect(count).toBe(11101);
    });

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

    test.each`
        value                              | expected
        ${undefined}                       | ${false}
        ${null}                            | ${false}
        ${1}                               | ${false}
        ${'hello'}                         | ${false}
        ${{}}                              | ${false}
        ${makeDisposable(() => undefined)} | ${true}
    `('isDisposableHybrid', ({ value, expected }) => {
        expect(isDisposableHybrid(value)).toBe(expected);
    });

    test('makeDisposable', () => {
        let count = 0;
        const a1 = () => (count += 1);
        const d1 = makeDisposable(a1);
        expect(isDisposableHybrid(d1)).toBe(true);
        expect(isDisposed(d1)).toBe(false);
        expect(makeDisposable(d1)).toBe(d1);
        expect(count).toBe(0);
        expect(getDisposableName(d1)).toBe('makeDisposable');

        const a2 = { dispose: () => (count += 10) };
        const d2 = makeDisposable(a2);
        expect(isDisposableHybrid(d2)).toBe(true);

        const a3 = { [Symbol.dispose]: () => (count += 100) };
        const d3 = makeDisposable(a3);
        expect(isDisposableHybrid(d3)).toBe(true);

        const a4 = { [Symbol.dispose]: a1, dispose: a1 };
        const d4 = makeDisposable(a4, 'a4');
        expect(isDisposableHybrid(d4)).toBe(true);
        expect(getDisposableName(d4)).toBe('a4');

        d4.dispose();
        expect(count).toBe(1);
    });

    test('get/set name', () => {
        const d = createDisposable(() => undefined, undefined, 'name1');
        expect(getDisposableName(d)).toBe('name1');
        setDisposableName(d, 'name2');
        expect(getDisposableName(d)).toBe('name2');
    });
});

describe('disposable debug', () => {
    const logger = {
        debug: jest.fn(),
        warn: jest.fn(),
    };

    beforeEach(() => {
        setLogger(logger);
    });

    afterEach(() => {
        setLogger(undefined);
        logger.debug.mockReset();
        logger.warn.mockReset();
    });

    test('createDisposableFromList', () => {
        let count = 0;
        const disposables = [
            createDisposable(() => (count += 1)),
            createDisposable(() => (count += 10)),
            createDisposable(() => (count += 100)),
        ];
        function use() {
            using _obj = createDisposableFromList(disposables);
        }
        use();
        expect(count).toBe(111);
    });

    test('dispose with errors', () => {
        const e1 = Error('one');
        const e2 = Error('two');

        const d = createDisposableFromList([
            () => {
                throw e1;
            },
            () => {
                throw e2;
            },
        ]);

        expect(() => disposeOf(d)).toThrow(e2);
    });

    test('createDisposableFromList double dispose', () => {
        const list: DisposeFn[] = [];
        const d = createDisposableFromList(list);
        d.dispose();
        list.push(() => undefined);
        d.dispose();
        // It was not disposed.
        expect(list.length).toBe(1);
    });

    test('createDisposableFromList double dispose', () => {
        const list: DisposeFn[] = [];
        const d = createDisposeMethodFromList(list);
        d();
        list.push(() => undefined);
        d();
        // It was disposed.
        expect(list.length).toBe(0);
    });
});
