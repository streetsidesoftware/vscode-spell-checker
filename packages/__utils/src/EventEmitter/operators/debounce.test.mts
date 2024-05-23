import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createEmitter } from '../createEmitter.mjs';
import { debounce } from './debounce.mjs';

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.resetAllMocks();
    });

    test('debounce', () => {
        const emitter = createEmitter<string>();
        const debounceOperator = debounce<string>(100);

        const event = debounceOperator(emitter.event);
        const listener = vi.fn();
        const disposable = event(listener);

        emitter.fire('one');
        emitter.fire('two');
        emitter.fire('three');

        expect(listener).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(101);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenLastCalledWith('three');

        emitter.fire('four');
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenLastCalledWith('three');

        vi.advanceTimersByTime(101);
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('four');

        emitter.fire('five');

        disposable.dispose();

        vi.advanceTimersByTime(101);
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('four');

        emitter.fire('six');
        vi.advanceTimersByTime(101);
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('four');
    });
});
