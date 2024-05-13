import { describe, expect, test, vi } from 'vitest';

import { createEmitter } from '../createEmitter.mjs';
import { tap } from './tap.mjs';

describe('tap', () => {
    test('tap', () => {
        const results: string[] = [];
        const mapInput: string[] = [];

        const emitter = createEmitter<string>();
        const tapFn = vi.fn((value: string) => (mapInput.push(value), value.length));
        const tapOp = tap(tapFn);

        const event = tapOp(emitter.event);
        const listener = vi.fn((value) => results.push(value));
        const disposable = event(listener);

        emitter.fire('one');
        emitter.fire('two');
        emitter.fire('three');

        expect(tapFn).toHaveBeenCalledTimes(3);
        expect(mapInput).toEqual(['one', 'two', 'three']);
        expect(results).toEqual(['one', 'two', 'three']);

        disposable.dispose();

        emitter.fire('four');

        expect(tapFn).toHaveBeenCalledTimes(3);
        expect(mapInput).toEqual(['one', 'two', 'three']);
        expect(results).toEqual(['one', 'two', 'three']);
    });
});
