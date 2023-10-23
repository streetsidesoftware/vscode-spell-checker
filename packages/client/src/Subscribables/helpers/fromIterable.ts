import { disposeOf } from 'utils-disposables';

import { createEmitter } from '../createFunctions';
import type { Subscribable, SubscribableEvent } from '../Subscribables';

export function fromIterable<T>(iter: IterableIterator<T> | Iterable<T>): Subscribable<T> {
    const emitter = createEmitter<T>();
    let stop = false;
    const disposeEventListener = emitter.onEvent(handleEvents);

    function handleEvents(e: SubscribableEvent) {
        if (e.name === 'onStart') {
            setTimeout(emitValues);
        }
        if (e.name === 'onStop' || e.name === 'onDone') {
            stop = true;
        }
    }

    function emitValues() {
        try {
            for (const val of iter) {
                if (stop) break;
                emitter.notify(val);
            }
        } finally {
            disposeOf(disposeEventListener);
            emitter.done();
        }
    }

    return emitter;
}
