import * as index from './index';

describe('index', () => {
    test('index api', () => {
        expect(Object.keys(index).sort()).toMatchSnapshot();
    });
});
