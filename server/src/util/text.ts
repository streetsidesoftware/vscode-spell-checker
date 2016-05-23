import * as XRegExp from 'xregexp';
import * as Rx from 'rx';
import { observableToArray } from './rx-utils';

export interface WordOffset {
    word: string;
    offset: number;
}

const regExSplitWords = XRegExp('(\\p{Ll})(\\p{Lu})', 'g');
const regExWords = XRegExp('\\p{L}+', 'g');

export function splitCamelCaseWordWithOffset(wo: WordOffset): Rx.Observable<WordOffset> {
    return Rx.Observable.fromArray(splitCamelCaseWord(wo.word))
        .scan(
            (last, word) => ({ word, offset: last.offset + last.word.length }),
            { word: '', offset: wo.offset } );
}

export function splitCamelCaseWord(word: string): string[] {
    const seperator = '_<^*_*^>_';
    const anotatedWord = XRegExp.replace(word, regExSplitWords, '$1' + seperator + '$2');
    return XRegExp.split(anotatedWord, seperator);
}


/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromText1(text: string): WordOffset[] {
    const words: WordOffset[] = [];

    const reg = XRegExp(regExWords);
    let match: RegExpExecArray;

    while ( match = reg.exec(text) ) {
        words.push({
            word: match[0],
            offset: match.index
        });
    }

    return words;
}


export function *match(reg: RegExp, text: string): Iterable<RegExpExecArray> {
    let match: RegExpExecArray;
    while ( match = reg.exec(text) ) {
        yield match;
    }
}


/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromTextRx(text: string): Rx.Observable<WordOffset> {
    const reg = XRegExp(regExWords);
    return Rx.Observable.from(match(reg, text))
        .map(m => ({
            word: m[0],
            offset: m.index
        }));
}

/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromText(text: string): WordOffset[] {
    return observableToArray(extractWordsFromTextRx(text));
}

export function extractWordsFromCodeRx(text: string): Rx.Observable<WordOffset> {
    return extractWordsFromTextRx(text)
        .concatMap(word => splitCamelCaseWordWithOffset(word));
}


export function extractWordsFromCode(text: string): WordOffset[] {
    return observableToArray(extractWordsFromCodeRx(text));
}
