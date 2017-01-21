import * as Text from './util/text';
import * as TextRange from './util/TextRange';
import { SpellingDictionary } from './SpellingDictionary';
import { Sequence, genSequence } from 'gensequence';
import * as RxPat from './RegExpPatterns';

export interface ValidationOptions {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    // words to always flag as an error
    flagWords?: string[];
    ignoreRegExpList?: (RegExp|string)[];
    includeRegExpList?: (RegExp|string)[];
    ignoreWords?: string[];
    words?: string[];
    userWords?: string[];
    allowCompoundWords?: boolean;
}

export interface WordRangeAcc {
    word: Text.WordOffset;
    isIncluded: boolean;
    rangePos: number;
};

export const defaultMaxNumberOfProblems = 200;
export const defaultMaxDuplicateProblems = 5;
export const defaultMinWordLength       = 4;
export const minWordSplitLen            = 3;


export function validateText(
    text: string,
    dict: SpellingDictionary,
    options: ValidationOptions
): Sequence<Text.WordOffset> {
    const {
        maxNumberOfProblems  = defaultMaxNumberOfProblems,
        maxDuplicateProblems = defaultMaxDuplicateProblems,
        minWordLength        = defaultMinWordLength,
        flagWords            = [],
        ignoreRegExpList     = [],
        includeRegExpList    = [],
        ignoreWords          = [],
        allowCompoundWords   = false,
    } = options;

    const filteredIncludeList = includeRegExpList.filter(a => !!a);
    const finalIncludeList = filteredIncludeList.length ? filteredIncludeList : ['.*'];

    const setOfFlagWords = new Set(flagWords);
    const mapOfProblems = new Map<string, number>();
    const includeRanges = TextRange.excludeRanges(
        TextRange.findMatchingRangesForPatterns(finalIncludeList, text),
        TextRange.findMatchingRangesForPatterns(ignoreRegExpList, text)
    );
    const ignoreWordsSet = new Set(ignoreWords.map(a => a.toLowerCase()));

    return Text.extractWordsFromCode(text)
        // Filter out any words that are NOT in the include ranges.
        .scan<WordRangeAcc>((acc, word) => {
            let { rangePos } = acc;
            const wordEndPos = word.offset + word.word.length;
            const wordStartPos = word.offset;
            while (includeRanges[rangePos] && includeRanges[rangePos].endPos <= wordStartPos) {
                rangePos += 1;
            }
            const range = includeRanges[rangePos];
            const isIncluded = range && range.startPos < wordEndPos;
            const isPartial = isIncluded && (range.endPos < wordEndPos || range.startPos > wordStartPos);
            if (isPartial) {
                // We need to chop the text.
                const offset = Math.max(range.startPos, wordStartPos);
                const offsetEnd = Math.min(range.endPos, wordEndPos);
                const a = offset - wordStartPos;
                const b = offsetEnd - wordStartPos;
                const text = word.word.slice(a, b);
                return { rangePos, isIncluded, word: { ...word, word: text, offset } };
            }
            return { rangePos, isIncluded, word };
        }, { word: { word: '', offset: 0 }, isIncluded: false, rangePos: 0})
        .filter(wr => wr.isIncluded)
        .map(wr => wr.word)
        .map(wo => ({...wo, isFlagged: setOfFlagWords.has(wo.word) }))
        .filter(wo => wo.isFlagged || wo.word.length >= minWordLength )
        .map(wo => ({
            ...wo,
            isFound: isWordValid(dict, wo, text, allowCompoundWords)
        }))
        .filter(wo => wo.isFlagged || ! wo.isFound )
        .filter(wo => !ignoreWordsSet.has(wo.word.toLowerCase()))
        .filter(wo => !RxPat.regExHexDigits.test(wo.word))  // Filter out any hex numbers
        .filter(wo => !RxPat.regExRepeatedChar.test(wo.word))  // Filter out any repeated characters like xxxxxxxxxx
        // Remove anything that is in the ignore list.
        .filter(wo => {
            const word = wo.word.toLowerCase();
            // Keep track of the number of times we have seen the same problem
            mapOfProblems.set(word, (mapOfProblems.get(word) || 0) + 1);
            // Filter out if there is too many
            return mapOfProblems.get(word) < maxDuplicateProblems;
        })
        .take(maxNumberOfProblems);
}

export function isWordValid(dict: SpellingDictionary, wo: Text.WordOffset, text: string, allowCompounds: boolean) {
    const firstTry = hasWordCheck(dict, wo.word, allowCompounds);
    return firstTry
        // Drop the first letter if it is preceded by a '\'.
        || (text[wo.offset - 1] === '\\') && hasWordCheck(dict, wo.word.slice(1), allowCompounds);
}

export function hasWordCheck(dict: SpellingDictionary, word: string, allowCompounds: boolean) {
    return dict.has(word) || (allowCompounds && hasCompoundWord(dict, word) );
}

export function hasCompoundWord(dict: SpellingDictionary, word: string) {
    const foundPair = wordSplitter(word).first(([a, b]) => dict.has(a) && dict.has(b));
    return !!foundPair;
}

export function wordSplitter(word: string): Sequence<[string, string]> {
    function* split(word: string): IterableIterator<[string, string]> {
        for (let i = minWordSplitLen; i <= word.length - minWordSplitLen; ++i) {
            yield [word.slice(0, i), word.slice(i)];
        }
    }
    return genSequence(split(word));
}


