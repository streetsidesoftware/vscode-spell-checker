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

export function validateText(text: string, options: ValidationOptions = {}): Rx.Observable<Text.WordOffset> {
    const {
        maxNumberOfProblems = defaultMaxNumberOfProblems,
        minWordLength       = defaultMinWordLength,
        flagWords           = [],
    } = options;
    const mapOfFlagWords = flagWords.reduce((m, w) => { m[w] = true; return m; }, Object.create(null));
    return Text.extractWordsFromCodeRx(text)
        .map(word => merge(word, { isFlagged: mapOfFlagWords[word.word] === true }))
        .filter(word => word.isFlagged || word.word.length >= minWordLength )
        .flatMap(word => isWordInDictionary(word.word).then(isFound => merge(word, { isFound })))
        .filter(word => word.isFlagged || ! word.isFound )
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

