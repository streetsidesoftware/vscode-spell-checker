import { describe, expect, test } from 'vitest';

import { awaitSubscribableAll } from './awaitSubscribable.js';
import { fromIterable } from './fromIterable.js';

describe('fromIterable', () => {
    test('fromIterable', async () => {
        const example = [5, 6, 7, 8];
        const s = fromIterable(example);
        const result = await awaitSubscribableAll(s);
        expect(result).toEqual(example);
    });
});
