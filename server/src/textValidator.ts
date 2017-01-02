import * as Text from './util/text';
import { SpellingDictionary } from './SpellingDictionary';
import { Sequence, genSequence } from 'gensequence';

const regExMatchRegEx = /\/.*\/[gimuy]*/;


export interface ValidationOptions {
    maxNumberOfProblems?: number;
    minWordLength?: number;
    // words to always flag as an error
    flagWords?: string[];
    ignoreRegExpList?: (RegExp|string)[];
    compoundWords?: boolean;
}

export interface WordRangeAcc {
    word: Text.WordOffset;
    isIncluded: boolean;
    rangePos: number;
};

const regExIgnoreRegExpPattern = /(?:spell-?checker|cSpell)::?ignore_?Reg_?Exp\s+(.+)/gi;
const regExIgnoreWords = /(?:spell-?checker|cSpell)::?ignore_?(?:\s?Words?)?\s+(.+)/gi;

export const defaultMaxNumberOfProblems = 200;
export const defaultMinWordLength       = 4;
export const minWordSplitLen            = 3;


export function validateText(
    text: string,
    dict: SpellingDictionary,
    options: ValidationOptions = {}
): Sequence<Text.WordOffset> {
    const {
        maxNumberOfProblems = defaultMaxNumberOfProblems,
        minWordLength       = defaultMinWordLength,
        flagWords           = [],
        ignoreRegExpList    = [],
        compoundWords       = false,
    } = options;
    const mapOfFlagWords = flagWords.reduce((m, w) => { m[w] = true; return m; }, Object.create(null));
    const includeRanges = Text.excludeRanges(
        [
            { startPos: 0, endPos: text.length },
        ],
        Text.findMatchingRangesForPatterns([
            Text.regExSpellingGuard,
            Text.regExMatchUrls,
            Text.regExPublicKey,
            Text.regExCert,
            Text.regExEscapeCharacters,
            ...ignoreRegExpList,
            ...getIgnoreRegExpFromDocument(text),
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
        .map(word => ({...word, isFlagged: mapOfFlagWords[word.word] === true }))
        .filter(wordOffset => wordOffset.isFlagged || wordOffset.word.length >= minWordLength )
        .map(wordOffset => ({
            ...wordOffset,
            isFound: hasWordCheck(dict, wordOffset.word, compoundWords) || ignoreWords.has(wordOffset.word)
        }))
        .filter(word => word.isFlagged || ! word.isFound )
        .filter(word => !Text.regExHexValues.test(word.word))  // Filter out any hex numbers
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

export function getIgnoreWordsFromDocument(text: string) {
    const matches = Text.match(regExIgnoreWords, text)
        .map(a => a[1])
        .concatMap(words => words.split(/[,\s]+/g))
        .toArray();
    return matches;
}

export function getIgnoreWordsSetFromDocument(text: string) {
    return new Set(getIgnoreWordsFromDocument(text).map(a => a.toLowerCase()));
}

export function getIgnoreRegExpFromDocument(text: string) {
    const matches = Text.match(regExIgnoreRegExpPattern, text)
        .map(a => a[1])
        .map(a => {
            const m = a.match(regExMatchRegEx);
            if (m && m[0]) {
                return m[0];
            }
            return a.split(/\s+/g).filter(a => !!a)[0];
        })
        .toArray();
    return matches;
}
