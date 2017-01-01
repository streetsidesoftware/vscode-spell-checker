import {
    TextDocument, Diagnostic, DiagnosticSeverity,
} from 'vscode-languageserver';
import { isWordInDictionaryP } from './spellChecker';
import * as Text from './util/text';

import * as Rx from 'rx';
import { merge } from 'tsmerge';

export const diagSource = 'cSpell Checker';

import { ValidationOptions, defaultMaxNumberOfProblems, defaultMinWordLength, WordRangeAcc } from './textValidator';

export function validateTextDocument(textDocument: TextDocument, options: ValidationOptions = {}): Rx.Promise<Diagnostic[]> {
    return validateTextDocumentAsync(textDocument, options)
        .toArray()
        .toPromise();
}

export function validateText(text: string, options: ValidationOptions = {}): Rx.Observable<Text.WordOffset> {
    const {
        maxNumberOfProblems = defaultMaxNumberOfProblems,
        minWordLength       = defaultMinWordLength,
        flagWords           = [],
        ignoreRegExpList    = [],
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
        .flatMap(word => isWordInDictionaryP(word.word).then(isFound => merge(word, { isFound })))
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

