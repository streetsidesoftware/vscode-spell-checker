import { disposeOf } from 'utils-disposables';

import { map, rx } from '.';
import { createEmitter } from './createFunctions';
import { createSubscribableView } from './SubscribableView';

describe('SubscribableView', () => {
    test('SubscribableView auto', () => {
        const emitter = createEmitter<number>();
        const view = createSubscribableView(emitter);

        let count = 10;
        let last = count;

        expect(view.hasValue()).toBe(false);
        expect(view.value).toBe(undefined);
        emitter.notify((last = ++count));
        expect(view.value).toBe(last);
        emitter.notify((last = ++count));
        expect(view.value).toBe(last);
        disposeOf(view);
        emitter.notify(++count);
        expect(view.value).toBe(last);
    });

    test('SubscribableView non-auto', () => {
        const emitter = createEmitter<number>();
        const view1 = createSubscribableView(emitter, false);

        let count = 10;
        let last = count;

        expect(view1.hasValue()).toBe(false);
        expect(view1.value).toBe(undefined);
        emitter.notify((last = ++count));
        expect(view1.hasValue()).toBe(false);
        expect(view1.value).toBe(undefined);

        const view2 = createSubscribableView(
            rx(
                view1,
                map((v) => v * 2),
                map((v) => v.toString()),
            ),
        );
        expect(view2.hasValue()).toBe(false);
        emitter.notify((last = ++count));
        expect(view1.value).toBe(last);
        expect(view2.value).toBe((last * 2).toString());

        emitter.notify((last = ++count));
        expect(view1.value).toBe(last);
        expect(view2.value).toBe((last * 2).toString());

        // Disposing of view2 stops everyone since it is the last subscriber.
        disposeOf(view2);
        emitter.notify(++count);
        expect(view1.value).toBe(last);
        expect(view2.value).toBe((last * 2).toString());

        const view3 = createSubscribableView(
            rx(
                view1,
                map((v) => v * 3),
                map((v) => v.toString()),
            ),
        );
        // View 3 picks up the last value from view 1
        expect(view1.value).toBe(last);
        expect(view3.value).toBe((last * 3).toString());
        emitter.notify((last = ++count));
        expect(view1.value).toBe(last);
        expect(view3.value).toBe((last * 3).toString());
    });
});
