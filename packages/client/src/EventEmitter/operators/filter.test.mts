import { describe, expect, test } from 'vitest';

import { createEmitter } from '../createEmitter.mjs';
import { filter } from './filter.mjs';

describe('map', () => {
    test.each`
        data                       | mapFn                          | expected
        ${[1, 2, 3]}               | ${(a: number) => a & 0x01}     | ${[1, 3]}
        ${['one', 'two']}          | ${(a: string) => a}            | ${['one', 'two']}
        ${['one', 'two', 'three']} | ${(a: string) => a.length > 3} | ${['three']}
    `('map $data', ({ data, mapFn, expected }) => {
        const results: unknown[] = [];

        const opFilter = filter(mapFn);
        const emitter = createEmitter<unknown>();
        const event = opFilter(emitter.event);
        const disposable = event((value) => results.push(value));

        for (const value of data) {
            emitter.fire(value);
        }

        expect(results).toEqual(expected);
        disposable.dispose();
    });
});
