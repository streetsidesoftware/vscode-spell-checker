import { Range } from './evaluateRegExp';

export function extractRanges(text: string, ranges: Range[]): string[] {
    return ranges.map(range => extract(text, range));
}

export function extract(text: string, range: Range): string {
    return text.slice(range.startIndex, range.endIndex);
}
