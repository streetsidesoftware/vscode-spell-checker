import * as Text from './util/text';
import * as TextRange from './util/TextRange';
import { SpellingDictionary } from './SpellingDictionary';
import { Sequence, genSequence } from 'gensequence';
import { getIgnoreWordsSetFromDocument } from './InDocSettings';  // @todo, move this out of here.
import * as InDoc from './InDocSettings';

export interface ValidationOptions {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    // words to always flag as an error
    flagWords?: string[];
    ignoreRegExpList?: (RegExp|string)[];
    includeRegExpList?: (RegExp|string)[];
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
    options: ValidationOptions = {}
): Sequence<Text.WordOffset> {
    const {
        maxNumberOfProblems  = defaultMaxNumberOfProblems,
        maxDuplicateProblems = defaultMaxDuplicateProblems,
        minWordLength        = defaultMinWordLength,
        flagWords            = [],
        ignoreRegExpList     = [],
        allowCompoundWords   = false,
    } = options;
    const setOfFlagWords = new Set(flagWords);
    const mapOfProblems = new Map<string, number>();
    const includeRanges = TextRange.excludeRanges(
        [
            { startPos: 0, endPos: text.length },
        ],
        TextRange.findMatchingRangesForPatterns([
            InDoc.regExSpellingGuard,
            InDoc.regExMatchUrls,
            InDoc.regExPublicKey,
            InDoc.regExCert,
            InDoc.regExEscapeCharacters,
            ...ignoreRegExpList,
        ], text)
    );
    const ignoreWords = getIgnoreWordsSetFromDocument(text);
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
            isFound: hasWordCheck(dict, wo.word, allowCompoundWords) || ignoreWords.has(wo.word.toLowerCase())
        }))
        .filter(wo => wo.isFlagged || ! wo.isFound )
        .filter(wo => !InDoc.regExHexValues.test(wo.word))  // Filter out any hex numbers
        .filter(wo => {
            // Keep track of the number of times we have seen the same problem
            mapOfProblems.set(wo.word, (mapOfProblems.get(wo.word) || 0) + 1);
            // Filter out if there is too many
            return mapOfProblems.get(wo.word) < maxDuplicateProblems;
        })
        .take(maxNumberOfProblems);
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


