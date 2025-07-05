import { describe, expect, test } from 'vitest';

import { awaitAsyncIterable } from './awaitAsyncIterable.js';
import { fromIterable } from './fromIterable.js';
import { toAsyncIterable } from './toAsyncIterable.js';

describe('toAsyncIterable', () => {
    test('toAsyncIterable', async () => {
        const example = [5, 6, 7, 8];
        const s = fromIterable(example);
        const a = toAsyncIterable(s);
        const result = await awaitAsyncIterable(a);
        expect(result).toEqual(example);
    });
});
