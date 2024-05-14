import { describe, expect, test, vi } from 'vitest';

import { createEmitter } from '../createEmitter.mjs';
import { map } from './map.mjs';

describe('map', () => {
    test('map string to number', () => {
        const results: number[] = [];
        const mapInput: string[] = [];

        const emitter = createEmitter<string>();
        const mapFn = (value: string) => {
            mapInput.push(value);
            return value.length;
        };
        const mapOp = map(mapFn);

        const event = mapOp(emitter.event);
        const listener = vi.fn((value) => results.push(value));
        const disposable = event(listener);

        emitter.fire('one');
        emitter.fire('two');
        emitter.fire('three');

        expect(mapInput).toEqual(['one', 'two', 'three']);
        expect(results).toEqual([3, 3, 5]);

        disposable.dispose();

        emitter.fire('four');

        expect(mapInput).toEqual(['one', 'two', 'three']);
        expect(results).toEqual([3, 3, 5]);
    });

    test.each`
        data                       | mapFn                             | expected
        ${[1]}                     | ${(a: number) => a}               | ${[1]}
        ${['one', 'two']}          | ${(a: string) => a.toUpperCase()} | ${['one', 'two'].map((a) => a.toUpperCase())}
        ${['one', 'two', 'three']} | ${(a: string) => a.length}        | ${[3, 3, 5]}
    `('map $data', ({ data, mapFn, expected }) => {
        const results: unknown[] = [];

        const opMap = map(mapFn);
        const emitter = createEmitter<unknown>();
        const event = opMap(emitter.event);
        const disposable = event((value) => results.push(value));

        for (const value of data) {
            emitter.fire(value);
        }

        expect(results).toEqual(expected);
        disposable.dispose();
    });
});
