import { disposeOf } from 'utils-disposables';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createEmitter } from '../createFunctions';
import { rx } from '../rx';
import { debounce } from './debounce';

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.resetAllMocks();
        vi.useRealTimers();
    });

    test('debounce', () => {
        const emitter = createEmitter<number>();
        const stream = rx(emitter, debounce(1000));
        const notify = vi.fn();
        const done = vi.fn();
        let counter = 55;
        let leading = counter;
        let trailing = counter;
        emitter.notify(++counter);
        const disposable = stream.subscribe({ notify, done });

        vi.runOnlyPendingTimers();

        expect(notify).not.toHaveBeenCalled();
        expect(done).not.toHaveBeenCalled();

        emitter.notify((leading = ++counter));
        emitter.notify(++counter);
        emitter.notify((trailing = ++counter));

        expect(notify).not.toHaveBeenCalled();
        expect(notify).toHaveBeenCalledTimes(0);

        vi.runOnlyPendingTimers();
        expect(notify).toHaveBeenLastCalledWith(trailing);
        expect(notify).toHaveBeenCalledTimes(1);
        vi.runOnlyPendingTimers();
        expect(notify).toHaveBeenCalledTimes(1);
        emitter.notify((leading = ++counter));
        emitter.notify(++counter);
        expect(notify).toHaveBeenCalledTimes(1);
        vi.runOnlyPendingTimers();
        expect(notify).toHaveBeenCalledTimes(2);
        expect(notify).not.toHaveBeenCalledWith(leading);
        expect(notify).toHaveBeenLastCalledWith(counter);

        disposeOf(disposable);
    });
});
