import { disposeOf } from 'utils-disposables';

import { squelch } from '../../util/errors.js';
import { createEmitter } from '../createFunctions.js';
import type { Subscribable, SubscribableEvent } from '../Subscribables.js';

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

    async function _emitValues() {
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

    const cErrors = squelch('fromAsyncIterable.emitValues');

    function emitValues() {
        _emitValues().catch(cErrors);
    }

    return emitter;
}
