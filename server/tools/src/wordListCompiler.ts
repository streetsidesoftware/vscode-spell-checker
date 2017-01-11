import * as Rx from 'rx';
import * as fs from 'fs';
import * as XRegExp from 'xregexp';
import { genSequence, Sequence } from 'gensequence';
import * as Text from './text';
import { lineReader } from './fileReader';
import { writeToFile } from './fileWriter';

const regNonWordOrSpace = XRegExp("[^\\p{L}' \\-]+", 'gi');
const regExpSpaceOrDash = /(?:\s+)|(?:-+)/g;
const regExpRepeatChars = /(.)\1{3,}/i;

export function normalizeWords(lines: Rx.Observable<string>) {
    return lines.flatMap(line => lineToWords(line).toArray());
}

export function lineToWords(line: string): Sequence<string> {
    // Remove punctuation and non-letters.
    const filteredLine = line.replace(regNonWordOrSpace, '|');
    const wordGroups = filteredLine.split('|');

    const words = genSequence(wordGroups)
        .concatMap(a => [a, ...a.split(regExpSpaceOrDash)])
        .concatMap(a => splitCamelCase(a))
        .map(a => a.trim())
        .filter(s => s.length > 2)
        .filter(s => !regExpRepeatChars.test(s))
        .map(a => a.toLowerCase())
        .reduceToSequence<string, Set<string>>((s, w) => s.add(w), new Set<string>());

    return words;
}

function splitCamelCase(word: string): Sequence<string> | string[] {
    const splitWords = Text.splitCamelCaseWord(word);
    // We only want to preserve this: "New York" and not "Namespace DNSLookup"
    if (splitWords.length > 1 && regExpSpaceOrDash.test(word)) {
        return genSequence(splitWords).concatMap(w => w.split(regExpSpaceOrDash));
    }
    return splitWords;
}

export function compileSetOfWords(lines: Rx.Observable<string>): Promise<Set<string>> {
    const set = normalizeWords(lines)
            .reduce((s, w) => s.add(w), new Set<string>())
            .toPromise();

    return Promise.all([set]).then(a => a[0]);
}

export function compileWordList(filename: string, destFilename: string): Promise<fs.WriteStream> {
    return compileSetOfWords(lineReader(filename)).then(set => {
        const data = genSequence(set)
            .map(a => a + '\n')
            .toArray()
            .sort()
            .join('');
        return writeToFile(destFilename, data);
    });
}
