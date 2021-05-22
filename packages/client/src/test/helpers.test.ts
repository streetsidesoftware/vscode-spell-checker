import { getCallStack, getPathToTemp, mustBeDefined } from './helpers';
import * as path from 'path';

describe('Validate Helpers', () => {
    test('getCallStack', () => {
        const stack = getCallStack();
        expect(stack[0]).toEqual(expect.objectContaining({ file: __filename }));
    });

    test('mustBeDefined', () => {
        expect(mustBeDefined('hello')).toBe('hello');
        expect(() => mustBeDefined(undefined)).toThrowError('Must Be Defined');
    });

    test('getPathToTemp', () => {
        expect(getPathToTemp('my-file.txt').toString()).toMatch(path.basename(__filename));
        expect(getPathToTemp('my-file.txt', path.join(__dirname, 'some-file')).toString()).toMatch('some-file');
    });
});
