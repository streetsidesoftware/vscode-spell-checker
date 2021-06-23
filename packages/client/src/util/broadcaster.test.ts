import { createBroadcaster } from './broadcaster';

describe('Validate broadcaster', () => {
    test('broadcast', () => {
        const bc = createBroadcaster<string>();
        bc.send('one');
        const f1 = jest.fn();
        const d1 = bc.listen(f1);
        bc.send('two');
        expect(f1).toHaveBeenLastCalledWith('two');
        const f2 = jest.fn();
        const d2 = bc.listen(f2);
        bc.send('three');
        expect(f1).toHaveBeenLastCalledWith('three');
        expect(f2).toHaveBeenLastCalledWith('three');
        d1.dispose();
        bc.send('four');
        expect(f2).toHaveBeenLastCalledWith('four');
        d2.dispose();
        bc.send('five');
        expect(f1).toHaveBeenCalledTimes(2);
        expect(f2).toHaveBeenCalledTimes(2);
    });
});
