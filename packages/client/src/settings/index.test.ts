import * as index from './index';

describe('settings/index', () => {
    test('index', () => {
        expect(typeof index.enableLocaleForTarget).toBe('function');
    });
});
