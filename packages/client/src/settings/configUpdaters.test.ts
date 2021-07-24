import { addWordsFn, removeWordsFn } from './configUpdaters';

describe('Validate configUpdaters', () => {
    test.each`
        current       | toAdd              | expected
        ${[]}         | ${[]}              | ${[]}
        ${[]}         | ${['a']}           | ${['a']}
        ${['b', 'a']} | ${['a']}           | ${['a', 'b']}
        ${['c', 'b']} | ${['a', 'd', 'c']} | ${['a', 'b', 'c', 'd']}
    `('addWordsFn $toAdd', ({ toAdd, current, expected }) => {
        const fn = addWordsFn(toAdd);
        expect(fn(current)).toEqual(expected);
    });

    test.each`
        current            | toAdd         | expected
        ${[]}              | ${[]}         | ${[]}
        ${[]}              | ${['a']}      | ${[]}
        ${['b', 'a']}      | ${['a']}      | ${['b']}
        ${['c', 'b']}      | ${['a']}      | ${['b', 'c']}
        ${['c', 'd', 'b']} | ${['d', 'a']} | ${['b', 'c']}
    `('removeWordsFn $toAdd', ({ toAdd, current, expected }) => {
        const fn = removeWordsFn(toAdd);
        expect(fn(current)).toEqual(expected);
    });
});
