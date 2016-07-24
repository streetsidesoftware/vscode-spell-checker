/**
 * Set of functions to help with processing source code text
 */

import * as Text from './text';
import * as Rx from 'rx';

export function normalizeWordList(words: Rx.Observable<string>): Rx.Observable<string> {
    return words
        .map(a => a.toLowerCase())
        ;
}


export function normalizeKeywordList(words: Rx.Observable<string>): Rx.Observable<string> {
    return words
        .map(line => Rx.Observable.fromArray(Text.extractWordsFromText(line)))
        .concatMap(awo => Rx.Observable.concat(
            // Add the line split along word boundaries. ex. 'Text.search' => ['Text', 'search']
            awo.map(({word}) => word),
            // Add the individual words in the line
            awo
                .concatMap(Text.splitCamelCaseWordWithOffset)
                .map(({word}) => word.toLowerCase())
        ))
        // remove immediate duplicates
        .scan<string>((prev, word) => prev === word ? null : word)
        .filter(a => !!a)
        ;
}
