import * as XRegExp from 'xregexp';
import * as Rx from 'rx';
import { observableToArray } from './rx-utils';

export interface WordOffset {
    word: string;
    offset: number;
}

const regExSplitWords = XRegExp('(\\p{Ll})(\\p{Lu})', 'g');
const regExSplitWords2 = XRegExp('(\\p{Lu})(\\p{Lu}\\p{Ll}+)', 'g');
const regExWords = XRegExp("\\p{L}(?:[']\\p{L}|\\p{L})+", 'g');
const regExIsWord = XRegExp("^\\p{L}+(?:[']\\p{L}|\\p{L})+$", 'g');
const regExIsSimpleWord = /^[A-Za-z']$/;
const regExFirstUpper = XRegExp('^\\p{Lu}\\p{Ll}+$');
const regExAllUpper = XRegExp('^\\p{Lu}+$');
const regExAllLower = XRegExp('^\\p{Ll}+$');

const regExWordsPool: RegExp[] = [];

export function splitCamelCaseWordWithOffset(wo: WordOffset): Rx.Observable<WordOffset> {
    return Rx.Observable.fromArray(splitCamelCaseWord(wo.word))
        .scan(
            (last, word) => ({ word, offset: last.offset + last.word.length }),
            { word: '', offset: wo.offset } );
}

/**
 * Split camelCase words into an array of strings.
 */
export function splitCamelCaseWord(word: string): string[] {
    if (!regExSplitWords.test(word) && !regExSplitWords2.test(word)) {
        return [word];
    }
    const separator = '<;_>';
    const pass1 = word.replace(regExSplitWords, '$1' + separator + '$2');
    const pass2 = pass1.replace(regExSplitWords2, '$1' + separator + '$2');
    return pass2.split(separator);
}

/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromText(text: string): WordOffset[] {
    if (regExIsSimpleWord.test(text) || regExIsWord.test(text)) {
        return [{ word: text, offset: 0 }];
    }

    const words: WordOffset[] = [];
    const reg = regExWordsPool.pop() || XRegExp(regExWords);
    let match: RegExpExecArray;

    while ( match = reg.exec(text) ) {
        words.push({
            word: match[0],
            offset: match.index
        });
    }

    // Add it to the pool so it can be reused.
    reg.lastIndex = 0;
    regExWordsPool.push(reg);

    return words;
}


/**
 * This function lets you iterate over regular expression matches.
 */
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
    const reg = regExWordsPool.pop() || XRegExp(regExWords);
    return Rx.Observable.from(match(reg, text))
        .map(m => ({
            word: m[0],
            offset: m.index
        }))
        .tapOnCompleted(() => {
            // Add it to the pool
            reg.lastIndex = 0;
            regExWordsPool.push(reg);
        });
}

export function extractWordsFromCodeRx(text: string): Rx.Observable<WordOffset> {
    return extractWordsFromTextRx(text)
        .concatMap(word => splitCamelCaseWordWithOffset(word));
}


export function extractWordsFromCode(text: string): WordOffset[] {
    return observableToArray(extractWordsFromCodeRx(text));
}

export function isUpperCase(word: string) {
    return word.match(regExAllUpper);
}

export function isLowerCase(word: string) {
    return word.match(regExAllLower);
}

export function isFirstCharacterUpper(word: string) {
    return isUpperCase(word.slice(0, 1));
}

export function isFirstCharacterLower(word: string) {
    return isLowerCase(word.slice(0, 1));
}

export function ucFirst(word: string) {
    return word.slice(0, 1).toUpperCase() + word.slice(1);
}

export function lcFirst(word: string) {
    return word.slice(0, 1).toLowerCase() + word.slice(1);
}

export function snakeToCamel(word: string) {
    return word.split('_').map(ucFirst).join('');
}

export function camelToSnake(word: string) {
    return splitCamelCaseWord(word).join('_').toLowerCase();
}

export function matchCase(example: string, word: string): string {
    if (example.match(regExFirstUpper)) {
        return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
    }
    if (example.match(regExAllLower)) {
        return word.toLowerCase();
    }
    if (example.match(regExAllUpper)) {
        return word.toUpperCase();
    }

    if (isFirstCharacterUpper(example)) {
        return ucFirst(word);
    }

    if (isFirstCharacterLower(example)) {
        return lcFirst(word);
    }

    return word;
}