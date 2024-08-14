import { describe, expect, test } from 'vitest';

import { dehydrate, hydrate } from './dehydrate.mjs';

describe('dehydrate', () => {
    test.each`
        data
        ${undefined}
        ${'string'}
        ${1}
        ${1.1}
        ${null}
        ${true}
        ${false}
        ${[]}
        ${[1, 2]}
        ${['a', 'b', 'a', 'b']}
        ${{}}
        ${{ a: 1 }}
        ${{ a: { b: 1 } }}
        ${{ a: { a: 'a', b: 42 } }}
        ${{ a: [1] }}
    `('dehydrate/hydrate $data', ({ data }) => {
        const v = dehydrate(data);
        expect(hydrate(v)).toEqual(data);
    });

    test.each`
        data                                                                                    | options
        ${undefined}                                                                            | ${undefined}
        ${'string'}                                                                             | ${undefined}
        ${1}                                                                                    | ${undefined}
        ${1.1}                                                                                  | ${undefined}
        ${null}                                                                                 | ${undefined}
        ${true}                                                                                 | ${undefined}
        ${false}                                                                                | ${undefined}
        ${[]}                                                                                   | ${undefined}
        ${[1, 2]}                                                                               | ${undefined}
        ${['apple', 'banana', 'apple', 'banana', 'apple', 'pineapple']}                         | ${undefined}
        ${{}}                                                                                   | ${undefined}
        ${[{}, {}, {}]}                                                                         | ${undefined}
        ${{ a: 1 }}                                                                             | ${undefined}
        ${{ a: { b: 1 } }}                                                                      | ${undefined}
        ${{ a: { a: 'a', b: 42 } }}                                                             | ${undefined}
        ${{ a: [1] }}                                                                           | ${undefined}
        ${[{ a: 'a', b: 'b' }, { a: 'c', b: 'd' }, { a: 'a', b: 'b' }, ['a', 'b'], ['c', 'd']]} | ${undefined}
        ${[{ a: 'a', b: 'b' }, { a: 'a', b: 'b' }, { a: 'a', b: 'b' }, { a: 'a', b: 'b' }]}     | ${{ dedupe: false }}
    `('dehydrate $data $options', ({ data, options }) => {
        const v = dehydrate(data, { dedupe: options?.dedupe });
        expect(v).toMatchSnapshot();
        expect(hydrate(v)).toEqual(data);
    });
});
