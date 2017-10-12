import {
    TextDocument, Diagnostic, DiagnosticSeverity,
} from 'vscode-languageserver';
import * as Rx from 'rxjs/Rx';
import { validateText } from 'cspell';

export const diagSource = 'cSpell Checker';
export {validateText} from 'cspell';
import { CSpellUserSettings } from './cspellConfig';
import * as cspell from 'cspell';

export const defaultCheckLimit = 500;

const diagSeverityMap = new Map<string, DiagnosticSeverity>([
    ['error',       DiagnosticSeverity.Error],
    ['warning',     DiagnosticSeverity.Warning],
    ['information', DiagnosticSeverity.Information],
    ['hint',        DiagnosticSeverity.Hint],
]);

export function validateTextDocument(textDocument: TextDocument, options: CSpellUserSettings): Promise<Diagnostic[]> {
    return validateTextDocumentAsync(textDocument, options)
        .toArray()
        .toPromise();
}

export function validateTextDocumentAsync(textDocument: TextDocument, options: CSpellUserSettings): Rx.Observable<Diagnostic> {
    const { diagnosticLevel = DiagnosticSeverity.Information.toString() } = options;
    const severity = diagSeverityMap.get(diagnosticLevel.toLowerCase()) || DiagnosticSeverity.Information;
    const limit = (options.checkLimit || defaultCheckLimit) * 1024;
    const text = textDocument.getText().slice(0, limit);
    return Rx.Observable.fromPromise<cspell.TextOffset[]>(validateText(text, options))
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
                end: ({...word.position, character: word.position.character + word.text.length })
            }
        }))
        // Convert it to a Diagnostic
        .map(({text, range}) => ({
            severity,
            range: range,
            message: `Unknown word: "${text}"`,
            source: diagSource
        }))
    ;
}

