import type { Position, Range } from 'vscode';

export function positionToString({ line, character }: Position): string {
    return `${line.toString()}:${character.toString()}`;
}

export function rangeToString({ start, end }: Range): string {
    return start.line === end.line
        ? `[${start.line.toString()}:${start.character.toString()}-${end.character.toString()}]`
        : `[${positionToString(start)}-${positionToString(end)}]`;
}
