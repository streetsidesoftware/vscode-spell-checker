import { disposeOf } from 'utils-disposables';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createEmitter } from '../createFunctions.js';
import { rx } from '../rx.js';
import { throttle } from './throttle.js';

describe('throttle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.resetAllMocks();
        vi.useRealTimers();
    });

    test('throttle', () => {
        const emitter = createEmitter<number>();
        const stream = rx(emitter, throttle(1000));
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

        expect(notify).toHaveBeenLastCalledWith(leading);

        vi.runOnlyPendingTimers();
        expect(notify).toHaveBeenLastCalledWith(trailing);
        vi.runOnlyPendingTimers();
        emitter.notify((leading = ++counter));
        expect(notify).toHaveBeenLastCalledWith(leading);

        disposeOf(disposable);
    });
});
