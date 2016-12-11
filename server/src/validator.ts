import {
    TextDocument, Diagnostic, DiagnosticSeverity,
} from 'vscode-languageserver';
import { isWordInDictionary } from './spellChecker';
import * as Text from './util/text';

import * as Rx from 'rx';
import { merge } from 'tsmerge';

export const diagSource = 'cSpell Checker';

const defaultMaxNumberOfProblems = 200;
const defaultMinWordLength       = 4;

export interface ValidationOptions {
    maxNumberOfProblems?: number;
    minWordLength?: number;
    // words to always flag as an error
    flagWords?: string[];
}

export function validateTextDocument(textDocument: TextDocument, options: ValidationOptions = {}): Rx.Promise<Diagnostic[]> {
    return validateTextDocumentAsync(textDocument, options)
        .toArray()
        .toPromise();
}

interface WordRangeAcc {
    word: Text.WordOffset;
    isIncluded: boolean;
    rangePos: number;
};

export function validateText(text: string, options: ValidationOptions = {}): Rx.Observable<Text.WordOffset> {
    const {
        maxNumberOfProblems = defaultMaxNumberOfProblems,
        minWordLength       = defaultMinWordLength,
        flagWords           = [],
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
        ], text)
    );
    return Text.extractWordsFromCodeRx(text)
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
        .map(word => merge(word, { isFlagged: mapOfFlagWords[word.word] === true }))
        .filter(word => word.isFlagged || word.word.length >= minWordLength )
        .flatMap(word => isWordInDictionary(word.word).then(isFound => merge(word, { isFound })))
        .filter(word => word.isFlagged || ! word.isFound )
        .filter(word => !Text.regExHexValues.test(word.word))  // Filter out any hex numbers
        .take(maxNumberOfProblems);
}

export function validateTextDocumentAsync(textDocument: TextDocument, options: ValidationOptions = {}): Rx.Observable<Diagnostic> {
    return validateText(textDocument.getText(), options)
        // Convert the offset into a position
        .map(offsetWord => merge(offsetWord, { position: textDocument.positionAt(offsetWord.offset) }))
        // Calculate the range
        .map(word => merge(word, {
            range: {
                start: word.position,
                end: merge(word.position, { character: word.position.character + word.word.length })
            }
        }))
        // Convert it to a Diagnostic
        .map(({word, range}) => ({
            severity: DiagnosticSeverity.Information,
            range: range,
            message: `Unknown word: "${word}"`,
            source: diagSource
        }))
    ;
}

