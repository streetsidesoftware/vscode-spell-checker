import { awaitSubscribableAll } from '../helpers/awaitSubscribable';
import { rx } from '../rx';
import { map } from './map';

describe('map', () => {
    test('map', async () => {
        const data = [6, 5, 4, 3, 2];
        const s = rx(
            data,
            map((v) => v * 6),
        );
        // s.onEvent((event) => console.log('%o Event: %o', new Date(), event));
        const result = await awaitSubscribableAll(s);
        expect(result).toEqual(data.map((v) => v * 6));
    });
});
