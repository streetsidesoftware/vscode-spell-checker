import { awaitSubscribableAll } from './awaitSubscribable';
import { fromIterable } from './fromIterable';

describe('fromIterable', () => {
    test('fromIterable', async () => {
        const example = [5, 6, 7, 8];
        const s = fromIterable(example);
        const result = await awaitSubscribableAll(s);
        expect(result).toEqual(example);
    });
});
