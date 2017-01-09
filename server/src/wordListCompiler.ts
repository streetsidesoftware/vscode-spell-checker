import * as Rx from 'rx';
import * as XRegExp from 'xregexp';
import { genSequence, Sequence } from 'gensequence';
import * as Text from './util/text';

const regNonWordOrSpace = XRegExp("[^\\p{L}' ]+", 'gi');


export function normalizeWords(lines: Rx.Observable<string>) {
    return lines.flatMap(line => lineToWords(line).toArray());
}


export function lineToWords(line: string): Sequence<string> {
    // Remove punctuation and non-letters.
    const filteredLine = line.replace(regNonWordOrSpace, '|');
    const wordGroups = filteredLine.split('|');

    const words = genSequence(wordGroups)
        .concatMap(a => [a, ...a.split(/\s+/g)])
        .concatMap(a => [a, ...Text.splitCamelCaseWord(a)])
        .map(a => a.toLowerCase())
        .reduceToSequence<string, Set<string>>((s, w) => s.add(w), new Set<string>());

    return words;
}

