
import * as fs from 'fs';
import * as Rx from 'rx';
import * as RxNode from 'rx-node';

/**
 * Assumes 1 "word" per line.  Words like "San Francisco" should be on a single line.
 *
 * @export
 * @param {string} filename
 * @returns {Rx.Observable<string>}
 */
export function readWords(filename: string): Rx.Observable<string> {
    return readLines(filename)
        .map(line => line.trim())
        .filter(line => line !== '')
    ;
}

export function readLines(filename: string): Rx.Observable<string> {
    return stringsToLines(textFileStream(filename));
}

export function textFileStream(filename: string): Rx.Observable<string> {
    return RxNode.fromStream<string>(fs.createReadStream(filename));
}


export function stringsToLines(strings: Rx.Observable<string>): Rx.Observable<string> {
    return Rx.Observable.concat(strings, Rx.Observable.just('\n'))
        .scan((last: { lines: string[], remainder: string }, curr: string) => {
            const parts = (last.remainder + curr).split('\n');
            const lines = parts.slice(0, -1);
            const remainder = parts.slice(-1)[0];
            return {lines, remainder};
        }, { lines: [], remainder: ''})
        .concatMap(emit => emit.lines)
    ;
}
