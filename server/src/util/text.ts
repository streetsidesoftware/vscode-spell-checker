import * as XRegExp from 'xregexp';
import * as Rx from 'rx';
import {merge} from 'tsmerge';
import {genSequence, scanMap, Sequence, sequenceFromRegExpMatch } from 'gensequence';

export interface WordOffset {
    word: string;
    offset: number;
}

export interface TextOffset {
    text: string;
    offset: number;
}

const regExLines = /.*\r?\n/g;
// const regExIdentifiers = XRegExp('(?:\\p{L}|[0-9_\'])+', 'gi');
const regExUpperSOrIng = XRegExp('(\\p{Lu}+\'?(?:s|ing|ies|es|ings|ed|ning))(?!\\p{Ll})', 'g');
const regExSplitWords = XRegExp('(\\p{Ll})(\\p{Lu})', 'g');
const regExSplitWords2 = XRegExp('(\\p{Lu})(\\p{Lu}\\p{Ll})', 'g');
const regExWords = XRegExp("\\p{L}(?:[']\\p{L}|\\p{L})+|\\p{L}", 'g');
const regExIgnoreCharacters = XRegExp('\\p{Hiragana}|\\p{Han}|\\p{Katakana}', 'g');
const regExFirstUpper = XRegExp('^\\p{Lu}\\p{Ll}+$');
const regExAllUpper = XRegExp('^\\p{Lu}+$');
const regExAllLower = XRegExp('^\\p{Ll}+$');

const regExMatchRegExParts = /^\/(.*)\/([gimuy]*)$/;

export type STW = string | TextOffset | WordOffset;

export function splitCamelCaseWordWithOffsetRx(wo: WordOffset): Rx.Observable<WordOffset> {
    return Rx.Observable.fromArray(splitCamelCaseWordWithOffset(wo));
}

export function splitCamelCaseWordWithOffset(wo: WordOffset): Array<WordOffset> {
    return splitCamelCaseWord(wo.word)
        .map(scanMap<string, WordOffset>(
            (last, word) => ({ word, offset: last.offset + last.word.length }),
            { word: '', offset: wo.offset }
        ));
}

/**
 * Split camelCase words into an array of strings.
 */
export function splitCamelCaseWord(word: string): string[] {
    const wPrime = word.replace(regExUpperSOrIng, s => s[0] + s.substr(1).toLowerCase());
    const separator = '_<^*_*^>_';
    const pass1 = XRegExp.replace(wPrime, regExSplitWords, '$1' + separator + '$2');
    const pass2 = XRegExp.replace(pass1, regExSplitWords2, '$1' + separator + '$2');
    return XRegExp.split(pass2, separator);
}

/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromText1(text: string): WordOffset[] {
    const words: WordOffset[] = [];

    const reg = XRegExp(regExWords);
    let match: RegExpExecArray | null;

    while ( match = reg.exec(text) ) {
        words.push({
            word: match[0],
            offset: match.index
        });
    }

    return words;
}


/**
 * This function lets you iterate over regular expression matches.
 */
export function match(reg: RegExp, text: string): Sequence<RegExpExecArray> {
    return sequenceFromRegExpMatch(reg, text);
}

export function matchToTextOffset(reg: RegExp, text: STW): Sequence<TextOffset> {
    const textOffset = toTextOffset(text);
    const fnOffsetMap = offsetMap(textOffset.offset);
    return match(reg, textOffset.text)
        .map(m => fnOffsetMap({ text: m[0], offset: m.index }));
}

export function matchToWordOffset(reg: RegExp, text: STW): Sequence<WordOffset> {
    return genSequence(matchToTextOffset(reg, text))
        .map(t => ({ word: t.text, offset: t.offset }));
}

export function extractLinesOfText(text: STW): Sequence<TextOffset> {
    return matchToTextOffset(regExLines, text);
}

export function extractLinesOfTextRx(text: string): Rx.Observable<TextOffset> {
    return Rx.Observable.from(extractLinesOfText(text).toIterable());
}

/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromTextRx(text: string): Rx.Observable<WordOffset> {
    return Rx.Observable.from(extractWordsFromText(text).toIterable());
}

/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromText(text: string): Sequence<WordOffset> {
    const reg = XRegExp(regExWords);
    return matchToWordOffset(reg, text)
        // remove characters that match against \p{L} but are not letters (Chinese characters are an example).
        .map(wo => ({
            word: XRegExp.replace(wo.word, regExIgnoreCharacters, match => ' '.repeat(match.length)).trim(),
            offset: wo.offset
        }))
        .filter(wo => !!wo.word);
}

export function extractWordsFromCodeRx(text: string): Rx.Observable<WordOffset> {
    return extractWordsFromTextRx(text)
        .concatMap(word => splitCamelCaseWordWithOffsetRx(word));
}


export function extractWordsFromCode(text: string): Sequence<WordOffset> {
    return extractWordsFromText(text)
        .concatMap(splitCamelCaseWordWithOffset);
}

export function isUpperCase(word: string) {
    return !!word.match(regExAllUpper);
}

export function isLowerCase(word: string) {
    return !!word.match(regExAllLower);
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


export function isTextOffset(x): x is TextOffset {
    return typeof x === 'object' && typeof x.text === 'string' && typeof x.offset === 'number';
}

export function isWordOffset(x): x is WordOffset {
    return typeof x === 'object' && typeof x.word === 'string' && typeof x.offset === 'number';
}

export function toWordOffset(text: string | WordOffset | TextOffset): WordOffset {
    if (typeof text === 'string') {
        return { word: text, offset: 0 };
    }
    if (isWordOffset(text)) {
        return text;
    }
    return { word: text.text, offset: text.offset };
}

export function toTextOffset(text: string | WordOffset | TextOffset): TextOffset {
    if (typeof text === 'string') {
        return { text: text, offset: 0 };
    }
    if (isTextOffset(text)) {
        return text;
    }
    return { text: text.word, offset: text.offset };
}

function offsetMap(offset: number) {
    return <T extends {offset: number}>(xo: T) => merge(xo, { offset: xo.offset + offset });
}

export function stringToRegExp(pattern: string | RegExp, defaultFlags = 'gim', forceFlags = 'g') {
    if (pattern instanceof RegExp) {
        return pattern;
    }
    try {
        const [, pat, flag] = [...(pattern.match(regExMatchRegExParts) || ['', pattern, defaultFlags]), forceFlags];
        // Make sure the flags are unique.
        const flags = [...(new Set(forceFlags + flag))].join('').replace(/[^gimuy]/g, '');
        if (pat) {
            const regex = new RegExp(pat, flags);
            return regex;
        }
    } catch (e) {
    }
    return undefined;
}

