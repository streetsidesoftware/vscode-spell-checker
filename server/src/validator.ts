import {
    TextDocument, Diagnostic, DiagnosticSeverity,
} from 'vscode-languageserver';
import * as Rx from 'rx';
import { validateText } from 'cspell';

export const diagSource = 'cSpell Checker';
export {validateText} from 'cspell';
import { CSpellUserSettings } from 'cspell';

export function validateTextDocument(textDocument: TextDocument, options: CSpellUserSettings): Rx.Promise<Diagnostic[]> {
    return validateTextDocumentAsync(textDocument, options)
        .toArray()
        .toPromise();
}

export function validateTextDocumentAsync(textDocument: TextDocument, options: CSpellUserSettings): Rx.Observable<Diagnostic> {
    return Rx.Observable.fromPromise(validateText(textDocument.getText(), options))
        .flatMap(a => a)
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

