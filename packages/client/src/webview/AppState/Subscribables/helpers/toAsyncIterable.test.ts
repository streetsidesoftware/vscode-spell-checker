import { fromIterable } from './fromIterable';
import { toAsyncIterable } from './toAsyncIterable';

describe('toAsyncIterable', () => {
    test('toAsyncIterable', async () => {
        const example = [5, 6, 7, 8];
        const s = fromIterable(example);
        const a = toAsyncIterable(s);
        const result = await awaitAsyncIterable(a);
        expect(result).toEqual(example);
    });
});

async function awaitAsyncIterable<T>(i: AsyncIterable<T> | AsyncIterableIterator<T>): Promise<T[]> {
    const buffer: T[] = [];

    for await (const v of i) {
        buffer.push(v);
    }

    return buffer;
}
