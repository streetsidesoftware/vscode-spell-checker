import {
    TextDocument, Diagnostic, DiagnosticSeverity,
} from 'vscode-languageserver';
import { onDictionaryReady, getActiveDictionary } from './spellChecker';
import * as Text from './util/text';
import * as Rx from 'rx';
import { Sequence } from 'gensequence';

export const diagSource = 'cSpell Checker';


import { ValidationOptions } from './textValidator';
import * as TV from './textValidator';

export function validateTextDocument(textDocument: TextDocument, options: ValidationOptions = {}): Rx.Promise<Diagnostic[]> {
    return validateTextDocumentAsync(textDocument, options)
        .toArray()
        .toPromise();
}

export function validateText(text: string, options: ValidationOptions = {}): Text.WordOffset[] {
    return [...TV.validateText(text, getActiveDictionary(), options)];
}


export function validateTextDocumentAsync(textDocument: TextDocument, options: ValidationOptions = {}): Rx.Observable<Diagnostic> {
    return Rx.Observable.fromPromise(onDictionaryReady())
        .flatMap(() => validateText(textDocument.getText(), options))
        .filter(a => !!a)
        .map(a => a!)
        // Convert the offset into a position
        .map(offsetWord => ({...offsetWord, position: textDocument.positionAt(offsetWord.offset) }))
        // Calculate the range
        .map(word => ({
            ...word,
            range: {
                start: word.position,
                end: ({...word.position, character: word.position.character + word.word.length })
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

