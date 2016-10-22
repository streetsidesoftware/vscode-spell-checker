import * as fs from 'fs';
import * as Rx from 'rx';
import { match } from './util/text';
import * as Text from './util/text';

export interface WordDictionary {
    [index: string]: boolean;
}

export function loadWords(filename: string): Rx.Observable<string> {
    const reader = Rx.Observable.fromNodeCallback<string>(fs.readFile);

    return reader(filename, 'utf-8')
        .flatMap(text => Rx.Observable.from(match(/(.+)(\r?\n)?/g, text)))
        .map(regExpExecArray => regExpExecArray[1])
        .map(line => line.trim())
        .filter(line => line !== '');
}

export function processWordListLines(lines: Rx.Observable<string>, minWordLength: number) {
    return lines
        .flatMap(line => Rx.Observable.concat(
            // Add the line
            Rx.Observable.just(line),
            // Add the individual words in the line
            Text.extractWordsFromTextRx(line)
                .flatMap(Text.splitCamelCaseWordWithOffset)
                .map(({word}) => word)
                .filter(word => word.length > minWordLength)
        ))
        .map(word => word.trim())
        .map(word => word.toLowerCase())
        .scan((pair: { setOfWords: WordDictionary; found: boolean; word: string; }, word: string) => {
            const { setOfWords } = pair;
            const found = setOfWords[word] === true;
            setOfWords[word] = true;
            return { found , word, setOfWords };
        }, { setOfWords: Object.create(null), found: false, word: '' })
        .filter(({found}) => !found);
}

