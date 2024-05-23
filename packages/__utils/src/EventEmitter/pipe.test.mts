import { describe, expect, test, vi } from 'vitest';

import { createEmitter, numListeners } from './createEmitter.mjs';
import { filter, map, tap } from './operators/index.mjs';
import { pipe } from './pipe.mjs';

vi.mock('vscode');

describe('pipe', () => {
    test('pipe', () => {
        const emitter = createEmitter<string>();
        const event = pipe(emitter.event);
        const listener = vi.fn();

        expect(event).toBeTypeOf('function');
        const disposable = event(listener);
        emitter.fire('test');
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenLastCalledWith('test');
        disposable.dispose();
        emitter.fire('test2');
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenLastCalledWith('test');
    });

    test('pipe operators', () => {
        const result: string[] = [];
        const result2: string[] = [];
        const tappedResult: string[] = [];
        const values = ['a', 'b', 'c'];
        const emitter = createEmitter<string>();
        const event = pipe(
            emitter.event,
            tap((value) => tappedResult.push(value)),
            map((value) => value.toUpperCase()),
            filter((value) => value !== 'B'),
        );
        // Late binding - so there should not be any listeners yet
        expect(numListeners(emitter)).toBe(0);

        const d = event((value) => result.push(value));
        const d2 = event((value) => result2.push(value));

        // There should be one listener even though we have two event calls
        expect(numListeners(emitter)).toBe(1);

        values.forEach((value) => emitter.fire(value));

        expect(result).toEqual(['A', 'C']);
        expect(tappedResult).toEqual(values);

        expect(numListeners(emitter)).toBe(1);
        d.dispose();
        expect(numListeners(emitter)).toBe(1);

        d2.dispose();
        // All listeners are removed
        expect(numListeners(emitter)).toBe(0);

        values.forEach((value) => emitter.fire(value));
        expect(result).toEqual(['A', 'C']);
        expect(tappedResult).toEqual(values);

        // event((value) => result.push(value));

        // expect(() => event(vi.fn())).toThrowError('EventEmitter is disposed');
    });
});
