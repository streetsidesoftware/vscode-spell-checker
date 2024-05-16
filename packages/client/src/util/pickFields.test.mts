import { describe, expect, test } from 'vitest';

import { pickFields } from './pickFields.mjs';

export { describe, expect, test } from 'vitest';

const symbol = Symbol('test');

describe('pickFields', () => {
    test('should return an object with the specified fields', () => {
        const obj = {
            name: 'John',
            age: 30,
            city: 'New York',
            country: 'USA',
            [symbol]: 'Symbol',
        };

        const result = pickFields(obj, ['name', 'age', symbol]);

        expect(result).toEqual({ name: 'John', age: 30, [symbol]: 'Symbol' });
    });

    test('should return an empty object if no fields are specified', () => {
        const obj = {
            name: 'John',
            age: 30,
            city: 'New York',
            country: 'USA',
        };

        const result = pickFields(obj, []);

        expect(result).toEqual({});
    });

    test('should ignore non-existent fields', () => {
        const obj = {
            name: 'John',
            age: 30,
            city: 'New York',
            country: 'USA',
        };

        const result = pickFields(obj, ['name', 'email'] as (keyof typeof obj)[]);

        expect(result).toEqual({ name: 'John' });
    });
});
