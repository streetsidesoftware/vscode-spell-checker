import { disposeOf } from 'utils-disposables';

import { createEmitter } from '../createFunctions';
import type { Subscribable, SubscribableEvent } from '../Subscribables';

export function fromAsyncIterable<T>(iter: AsyncIterableIterator<T> | AsyncIterable<T>): Subscribable<T> {
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

    async function emitValues() {
        try {
            for await (const val of iter) {
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
