import { readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

import { dehydrate, hydrate } from './dehydrate.mjs';

const urlPackageLock = new URL('../../../package-lock.json', import.meta.url);

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
        data                                                                                            | options
        ${undefined}                                                                                    | ${undefined}
        ${'string'}                                                                                     | ${undefined}
        ${1}                                                                                            | ${undefined}
        ${1.1}                                                                                          | ${undefined}
        ${null}                                                                                         | ${undefined}
        ${true}                                                                                         | ${undefined}
        ${false}                                                                                        | ${undefined}
        ${[]}                                                                                           | ${undefined}
        ${[1, 2]}                                                                                       | ${undefined}
        ${['apple', 'banana', 'apple', 'banana', 'apple', 'pineapple']}                                 | ${undefined}
        ${new Set(['apple', 'banana', 'pineapple'])}                                                    | ${undefined}
        ${new Map([['apple', 1], ['banana', 2], ['pineapple', 3]])}                                     | ${undefined}
        ${{}}                                                                                           | ${undefined}
        ${[{}, {}, {}]}                                                                                 | ${undefined}
        ${{ a: 1 }}                                                                                     | ${undefined}
        ${{ a: { b: 1 } }}                                                                              | ${undefined}
        ${{ a: { a: 'a', b: 42 } }}                                                                     | ${undefined}
        ${{ a: [1] }}                                                                                   | ${undefined}
        ${{ values: ['apple', 'banana', 'pineapple'], set: new Set(['apple', 'banana', 'pineapple']) }} | ${undefined}
        ${[{ a: 'a', b: 'b' }, { a: 'c', b: 'd' }, { b: 'b', a: 'a' }, ['a', 'b'], ['c', 'd']]}         | ${undefined}
        ${[{ a: 'a', b: 'b' }, { a: 'a', b: 'b' }, { a: 'a', b: 'b' }, { a: 'a', b: 'b' }]}             | ${{ dedupe: false }}
        ${sampleNestedData()}                                                                           | ${undefined}
    `('dehydrate $data $options', ({ data, options }) => {
        const v = dehydrate(data, { dedupe: options?.dedupe });
        expect(v).toMatchSnapshot();
        expect(hydrate(v)).toEqual(data);
    });

    test('dedupe can break Sets', () => {
        const data = sampleNestedData();
        const value = { ...data, s: new Set(data.n) };

        const v = dehydrate(value, { dedupe: true });
        const hv = hydrate(v) as typeof value;
        // The set is smaller.
        expect(hv.s).not.toEqual(value.s);
        expect(hv.n).toEqual(value.n);
    });

    test('dedupe package-lock.json', async () => {
        const json = await readFile(urlPackageLock, 'utf8');
        const data = JSON.parse(json);
        const v = dehydrate(data, { dedupe: true });
        const hv = hydrate(v) as typeof data;
        expect(hv).toEqual(data);

        // console.warn('package-lock.json %o', { pkg: json.length, d: JSON.stringify(v, null, 2).length });
        // console.warn('%s', JSON.stringify(v, null, 2));
    });
});

function sampleNestedData() {
    const a = { a: 'a', b: 'b' };
    const b = { a: 'c', b: 'd' };
    const n = [a, b, { b: 'b', a: 'a' }, ['a', 'b'], ['c', 'd']];
    const s = new Set(['a', 'b']);
    const m = new Map([
        ['a', 'a'],
        ['b', 'b'],
    ]);
    return {
        a,
        b,
        n,
        nn: n,
        nnn: [...n],
        s,
        m,
    };
}
