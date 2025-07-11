import { squelch } from '../util/errors.js';

export async function* asyncQueue<T>(fnValues: Iterable<() => T | Promise<T>>, maxQueue = 10): AsyncIterable<T> {
    async function* buffered() {
        let done = false;
        const buffer: Promise<T>[] = [];
        const iter = fnValues[Symbol.iterator]();

        function fill() {
            while (buffer.length < maxQueue) {
                const next = iter.next();
                done = !!next.done;
                if (done) return;
                if (next.done) return;
                buffer.push(Promise.resolve(next.value()));
            }
        }

        fill();

        while (!done && buffer.length) {
            yield buffer[0];
            buffer.shift()?.catch(squelch('asyncQueue'));
            fill();
        }

        yield* buffer;
    }

    for await (const value of buffered()) {
        yield value;
    }
}
