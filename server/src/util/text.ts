import * as XRegExp from 'xregexp';
import * as Rx from 'rx';
import * as R from 'ramda';
import {merge} from 'tsmerge';

export interface WordOffset {
    word: string;
    offset: number;
}

const regExSplitWords = XRegExp('(\\p{Ll})(\\p{Lu})', 'g');
const regExSplitWords2 = XRegExp('(\\p{Lu})(\\p{Lu}\\p{Ll}+)', 'g');
const regExWords = XRegExp("\\p{L}(?:[']\\p{L}|\\p{L})+|\\p{L}", 'g');
const regExIgnoreCharacters = XRegExp('\\p{Hiragana}|\\p{Han}|\\p{Katakana}', 'g');
const regExFirstUpper = XRegExp('^\\p{Lu}\\p{Ll}+$');
const regExAllUpper = XRegExp('^\\p{Lu}+$');
const regExAllLower = XRegExp('^\\p{Ll}+$');

const regExMatchRegExParts = /^\/(.*)\/([gimuy]*)$/;

// Exclude Expressions
export const regExMatchUrls = /(?:https?|ftp):\/\/\S+/gi;
export const regExHexValues = /^x?[0-1a-f]+$/i;
export const regExMatchCommonHexFormats = /(?:#[0-9a-f]{3,8})|(?:0x[0-9a-f]+)|(?:\\u[0-9a-f]{4})|(?:\\x\{[0-9a-f]{4}\})/gi;
export const regExSpellingGuard = /(?:spell-?checker|cSpell):\s*disable(?:.|\s)*?(?:(?:spell-?checker|cSpell):\s*enable|$)/gi;
export const regExPublicKey = /BEGIN\s+PUBLIC\s+KEY(?:.|\s)+?END\s+PUBLIC\s+KEY/gi;
export const regExCert = /BEGIN\s+CERTIFICATE(?:.|\s)+?END\s+CERTIFICATE/gi;

// Include Expressions
export const regExPhpHereDoc = /<<<['"]?(\w+)['"]?(?:.|\s)+?^\1;/gim;
export const regExString = /(?:(['"])(?:\\\\|(?:\\\1)|[^\1\n])+\1)|(?:([`])(?:\\\\|(?:\\\2)|[^\2])+\2)/gi;

// Note: the C Style Comments incorrectly considers '/*' and '//' inside of strings as comments.
export const regExCStyleComments = /(?:\/\/.*$)|(?:\/\*(?:.|\s)+?\*\/)/gim;

export const matchUrl = regExMatchUrls.source;
export const matchHexValues = regExMatchCommonHexFormats.source;
export const matchSpellingGuard = regExSpellingGuard.source;


function scan<T, U>(accFn: (acc: T, value: U) => T, init: T) {
    let acc = init;
    return function(value: U): T {
        acc = accFn(acc, value);
        return acc;
    };
}


export function splitCamelCaseWordWithOffsetRx(wo: WordOffset): Rx.Observable<WordOffset> {
    return Rx.Observable.fromArray(splitCamelCaseWord(wo.word))
        .scan(
            (last, word) => ({ word, offset: last.offset + last.word.length }),
            { word: '', offset: wo.offset } );
}

export function splitCamelCaseWordWithOffset(wo: WordOffset): Array<WordOffset> {
    return splitCamelCaseWord(wo.word)
        .map(scan<WordOffset, string>(
            (last, word) => ({ word, offset: last.offset + last.word.length }),
            { word: '', offset: wo.offset } ));
}

/**
 * Split camelCase words into an array of strings.
 */
export function splitCamelCaseWord(word: string): string[] {
    const separator = '_<^*_*^>_';
    const pass1 = XRegExp.replace(word, regExSplitWords, '$1' + separator + '$2');
    const pass2 = XRegExp.replace(pass1, regExSplitWords2, '$1' + separator + '$2');
    return XRegExp.split(pass2, separator);
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


/**
 * This function lets you iterate over regular expression matches.
 */
export function *match(reg: RegExp, text: string): Iterable<RegExpExecArray> {
    const regex = new RegExp(reg);
    let match: RegExpExecArray;
    while ( match = regex.exec(text) ) {
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
        }))
        // remove characters that match against \p{L} but are not letters (Chinese characters are an example).
        .map(wo => ({
            word: XRegExp.replace(wo.word, regExIgnoreCharacters, match => ' '.repeat(match.length)).trim(),
            offset: wo.offset
        }))
        .filter(wo => !!wo.word);
}

/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromText(text: string): WordOffset[] {
    const reg = XRegExp(regExWords);
    return [...match(reg, text)]
        .map(m => ({
            word: m[0],
            offset: m.index
        }))
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


export function extractWordsFromCode(text: string): WordOffset[] {
    return extractWordsFromText(text)
        .map(splitCamelCaseWordWithOffset)
        .reduce((a, b) => a.concat(b), []);
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

export interface MatchRange {
    startPos: number;
    endPos: number;
}

export interface MatchRangeWithText extends MatchRange {
    text: string;
}

export function findMatchingRanges(pattern: string | RegExp, text: string) {
    const regex = pattern instanceof RegExp ? new RegExp(pattern) : new RegExp(pattern, 'gim');

    const ranges: MatchRangeWithText[] = [];

    for (const found of match(regex, text)) {
        ranges.push({ startPos: found.index, endPos: found.index + found[0].length, text: found[0] });
    }

    return ranges;
}

function fnSortRanges(a: MatchRange, b: MatchRange) {
    return (a.startPos - b.startPos) || (a.endPos - b.endPos);
}

export function unionRanges(ranges: MatchRange[]) {
    const sortedRanges = ranges.sort(fnSortRanges);
    const result = sortedRanges.slice(1).reduce((acc: MatchRange[], next) => {
        const last = acc[acc.length - 1];
        if (next.startPos > last.endPos) {
            acc.push(next);
        } else if (next.endPos > last.endPos) {
            acc[acc.length - 1] = {
                startPos: last.startPos,
                endPos: last.endPos,
            };
        }
        return acc;
    }, sortedRanges.slice(0, 1));

    return result;
}

export function findMatchingRangesForPatterns(patterns: (string | RegExp)[], text: string) {
    const matchedPatterns = patterns.map((pattern) => findMatchingRanges(pattern, text));
    return unionRanges(R.flatten(matchedPatterns));
}

/**
 * Exclude range b from a
 */
function excludeRange(a: MatchRange, b: MatchRange) {
    // non-intersection
    if (b.endPos <= a.startPos || b.startPos >= a.endPos) {
        return [a];
    }

    // fully excluded
    if (b.startPos <= a.startPos && b.endPos >= a.endPos) {
        return [];
    }

    const result: MatchRange[] = [];

    if (a.startPos < b.startPos) {
        result.push({startPos: a.startPos, endPos: b.startPos });
    }

    if (a.endPos > b.endPos) {
        result.push({ startPos: b.endPos, endPos: a.endPos });
    }
    return result;
}


/**
 * Create a new set of positions that have the excluded position ranges removed.
 */
export function excludeRanges(includeRanges: MatchRange[], excludeRanges: MatchRange[]): MatchRange[] {
    interface MatchRangeWithType extends MatchRange {
        type: 'i' | 'e';
    }
    interface Result {
        ranges: MatchRange[];
        lastExclude?: MatchRange;
    }
    const tInclude: 'i' = 'i';
    const tExclude: 'e' = 'e';

    const sortedRanges: MatchRangeWithType[] = [
        ...includeRanges.map(r => merge(r, { type: tInclude })),
        ...excludeRanges.map(r => merge(r, { type: tExclude }))].sort(fnSortRanges);

    const result = sortedRanges.reduce((acc: Result, range: MatchRangeWithType) => {
        const { ranges, lastExclude } = acc;
        const lastInclude = ranges.length ? ranges[ranges.length - 1] : undefined;
        if (range.type === tExclude) {
            if (!lastInclude || lastInclude.endPos <= range.startPos) {
                // if the exclude is beyond the current include, save it for later
                return { ranges, lastExclude: range };
            }
            // we need to split the current include.
            return { ranges: [...ranges.slice(0, -1), ...excludeRange(ranges[ranges.length - 1], range)], lastExclude: range };
        }

        // The range is an include, we need to check it against the last exclude
        if (! lastExclude) {
            return { ranges: ranges.concat([range]) };
        }
        const nextExclude = lastExclude.endPos > range.endPos ? lastExclude : undefined;
        return { ranges: [...ranges, ...excludeRange(range, lastExclude)], lastExclude: nextExclude };
    }, { ranges: [] });

    return result.ranges;
}

