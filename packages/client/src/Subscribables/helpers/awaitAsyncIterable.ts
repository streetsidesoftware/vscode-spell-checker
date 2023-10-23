export async function awaitAsyncIterable<T>(i: AsyncIterable<T> | AsyncIterableIterator<T>): Promise<T[]> {
    const buffer: T[] = [];

    for await (const v of i) {
        buffer.push(v);
    }

    return buffer;
}
