import { commonPrefix } from './commonPrefix';

describe('validate commonPrefix', () => {
    test('commonPrefix', () => {
        expect(commonPrefix([])).toBe('');
        expect(commonPrefix(['one'])).toBe('one');
        expect(commonPrefix(['one', 'once'])).toBe('on');
        expect(commonPrefix(['abcdef', 'abc', 'abcd'])).toBe('abc');
        expect(commonPrefix(['abcdef', 'abc', ''])).toBe('');
        expect(commonPrefix(['abcdef', 'abc', 'bc'])).toBe('');
    });
});
