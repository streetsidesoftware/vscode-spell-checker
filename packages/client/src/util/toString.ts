import type { Position, Range } from 'vscode';

export function positionToString({ line, character }: Position): string {
    return `${line}:${character}`;
}

export function rangeToString({ start, end }: Range): string {
    return start.line === end.line
        ? `[${start.line}:${start.character}-${end.character}]`
        : `[${positionToString(start)}-${positionToString(end)}]`;
}
