import { describe, expect, test } from 'vitest';

import { awaitSubscribableAll } from './helpers/awaitSubscribable.js';
import { map } from './operators/index.js';
import { pipe } from './pipe.js';
import { rx } from './rx.js';

describe('pipe', () => {
    test('pipe', async () => {
        const data = [6, 5, 4, 3, 2];
        const s = pipe(
            rx(data),
            map((v) => 2 * v),
            map((v) => 3 * v),
        );
        const result = await awaitSubscribableAll(s);
        expect(result).toEqual(data.map((v) => v * 6));
    });

    test('pipe async', async () => {
        const data = [6, 5, 4, 3, 2];
        const s = pipe(
            rx(toAsync(data)),
            map((v) => 2 * v),
            map((v) => 3 * v),
        );
        const result = await awaitSubscribableAll(s);
        expect(result).toEqual(data.map((v) => v * 6));
    });
});

async function* toAsync<T>(i: Iterable<T> | AsyncIterable<T>): AsyncIterable<T> {
    for await (const v of i) {
        yield v;
    }
}
