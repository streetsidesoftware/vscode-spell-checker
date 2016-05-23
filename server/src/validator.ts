import {
    TextDocument, Diagnostic, DiagnosticSeverity,
} from 'vscode-languageserver';
import { isWordInDictionary } from './spellChecker';
import * as Text from './util/text';

import * as Rx from 'rx';
import { merge } from 'tsmerge';


const maxNumberOfProblems = 200;
const minWordLength = 4;

export function validateTextDocument(textDocument: TextDocument): Rx.Promise<Diagnostic[]> {
    return validateTextDocumentAsync(textDocument)
        .toArray()
        .toPromise();
}

export function validateText(text): Rx.Observable<Text.WordOffset> {
    return Text.extractWordsFromCodeRx(text)
        .filter(word => word.word.length >= minWordLength )
        .flatMap(word => isWordInDictionary(word.word).then(isFound => merge(word, { isFound })))
        .filter(word => ! word.isFound );
}

export function validateTextDocumentAsync(textDocument: TextDocument): Rx.Observable<Diagnostic> {
    return validateText(textDocument.getText())
        .take(maxNumberOfProblems)
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
            source: 'Spell Checker'
        }))
    ;
}

