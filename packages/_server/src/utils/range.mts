import type { Range } from 'vscode-languageserver';

import * as UtilPosition from './position.mjs';

export function intersect(a: Range, b: Range): Range | undefined {
    if (a === b) return a;

    const start = UtilPosition.compare(a.start, b.start) >= 0 ? a.start : b.start;
    const end = UtilPosition.compare(a.end, b.end) <= 0 ? a.end : b.end;

    return UtilPosition.compare(start, end) > 0 ? undefined : { start, end };
}

/**
 * Check if two ranges are equivalent.
 * @param a - Range
 * @param b - Range
 * @returns true if they are equivalent.
 */
export function equal(a: Range, b: Range): boolean {
    return UtilPosition.equal(a.start, b.start) && UtilPosition.equal(a.end, b.end);
}

/**
 * Check if `b` is fully contained in `a`.
 * @param a - Outer Range
 * @param b - Inner Range
 * @returns
 */
export function contains(a: Range, b: Range): boolean {
    const intersection = intersect(a, b);
    return (intersection && equal(intersection, b)) || false;
}
