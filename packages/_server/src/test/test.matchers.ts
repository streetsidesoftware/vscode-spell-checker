import type { expect } from 'vitest';

interface AsymmetricMatchers {
    toEqualCaseInsensitive(expected: string): string;
}

export function extendExpect(e: typeof expect): AsymmetricMatchers {
    e.extend({
        toEqualCaseInsensitive(actual, expected) {
            if (typeof actual !== 'string' || typeof expected !== 'string') {
                throw new Error('These must be of type number!');
            }

            const pass = actual.toLowerCase() === expected.toLowerCase();
            return {
                message: () =>
                    // `this` context will have correct typings
                    `expected ${this.utils.printReceived(actual)} to equal ${this.utils.printExpected(expected)} case insensitive`,
                pass,
            };
        },
    });

    return (<unknown>e) as AsymmetricMatchers;
}
