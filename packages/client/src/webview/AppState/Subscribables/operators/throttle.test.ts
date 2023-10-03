import { disposeOf } from 'utils-disposables';

import { createEmitter } from '../createFunctions';
import { rx } from '../rx';
import { throttle } from './throttle';

describe('throttle', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.useRealTimers();
    });

    test('throttle', () => {
        const emitter = createEmitter<number>();
        const stream = rx(emitter, throttle(1000));
        const notify = jest.fn();
        const done = jest.fn();
        let counter = 55;
        let leading = counter;
        let trailing = counter;
        emitter.notify(++counter);
        const disposable = stream.subscribe({ notify, done });

        jest.runOnlyPendingTimers();

        expect(notify).not.toHaveBeenCalled();
        expect(done).not.toHaveBeenCalled();

        emitter.notify((leading = ++counter));
        emitter.notify(++counter);
        emitter.notify((trailing = ++counter));

        expect(notify).toHaveBeenLastCalledWith(leading);

        jest.runOnlyPendingTimers();
        expect(notify).toHaveBeenLastCalledWith(trailing);
        jest.runOnlyPendingTimers();
        emitter.notify((leading = ++counter));
        expect(notify).toHaveBeenLastCalledWith(leading);

        disposeOf(disposable);
    });
});
