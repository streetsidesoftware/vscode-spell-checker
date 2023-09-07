import type { Position } from 'vscode-languageserver';

/**
 * Compares two positions
 * @param a
 * @param b
 * @returns
 *   negative - a < b
 *   zero - a == b
 *   positive a > b
 */
export function compare(a: Position, b: Position): number {
    return a.line - b.line || a.character - b.character;
}

/**
 * Check if two positions are equivalent.
 * @param a - Position
 * @param b - Position
 * @returns true if they represent the same position.
 */
export function equal(a: Position, b: Position): boolean {
    return a === b || compare(a, b) === 0;
}
