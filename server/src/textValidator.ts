import * as Text from './util/text';
import { SpellingDictionaryCollection } from './SpellingDictionaryCollection'
import { Sequence, genSequence } from 'gensequence';


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

export const defaultMaxNumberOfProblems = 200;
export const defaultMinWordLength       = 4;
export const minWordSplitLen            = 3;


export function validateText(
    text: string,
    dicts: SpellingDictionaryCollection,
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
        ], text)
    );
    return Text.extractWordsFromCode(text)
        // Filter out any words that are NOT in the include ranges.
        .scan<WordRangeAcc>((acc, word) => {
            let { rangePos } = acc;
            const wordEndPos = word.offset + word.word.length;
            while (includeRanges[rangePos] && includeRanges[rangePos].endPos <= wordEndPos) {
                rangePos += 1;
            }
            const isIncluded = includeRanges[rangePos] && includeRanges[rangePos].startPos <= word.offset;
            return { rangePos, isIncluded, word };
        }, { word: { word: '', offset: 0 }, isIncluded: false, rangePos: 0})
        .filter(wr => wr.isIncluded)
        .map(wr => wr.word)
        .map(word => ({...word, isFlagged: mapOfFlagWords[word.word] === true }))
        .filter(wordOffset => wordOffset.isFlagged || wordOffset.word.length >= minWordLength )
        .map(wordOffset => ({...wordOffset, isFound: dicts.has(wordOffset.word)}))
        .filter(word => word.isFlagged || ! word.isFound )
        .filter(word => !Text.regExHexValues.test(word.word))  // Filter out any hex numbers
        .take(maxNumberOfProblems);
}


export function wordSplitter(word: string): Sequence<[string, string]> {
    function* split(word: string): IterableIterator<[string, string]> {
        for (let i = minWordSplitLen; i <= word.length - minWordSplitLen; ++i) {
            yield [word.slice(0, i), word.slice(i)];
        }
    }
    return genSequence(split(word));
}
