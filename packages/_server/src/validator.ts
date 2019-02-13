import {
    TextDocument, Diagnostic, DiagnosticSeverity,
} from 'vscode-languageserver';
import { Observable, from } from 'rxjs';
import { map, filter, flatMap, toArray } from 'rxjs/operators';
import { validateText } from 'cspell';

export const diagnosticCollectionName = 'cSpell';
export const diagSource = diagnosticCollectionName;
export {validateText} from 'cspell';
import { CSpellUserSettings } from './cspellConfig';

export const defaultCheckLimit = 500;

const diagSeverityMap = new Map<string, DiagnosticSeverity>([
    ['error',       DiagnosticSeverity.Error],
    ['warning',     DiagnosticSeverity.Warning],
    ['information', DiagnosticSeverity.Information],
    ['hint',        DiagnosticSeverity.Hint],
]);

export function validateTextDocument(textDocument: TextDocument, options: CSpellUserSettings): Promise<Diagnostic[]> {
    return validateTextDocumentAsync(textDocument, options)
        .pipe(toArray())
        .toPromise();
}

export function validateTextDocumentAsync(textDocument: TextDocument, options: CSpellUserSettings): Observable<Diagnostic> {
    const { diagnosticLevel = DiagnosticSeverity.Information.toString() } = options;
    const severity = diagSeverityMap.get(diagnosticLevel.toLowerCase()) || DiagnosticSeverity.Information;
    const limit = (options.checkLimit || defaultCheckLimit) * 1024;
    const text = textDocument.getText().slice(0, limit);
    return from(validateText(text, options)).pipe(
        flatMap(a => a),
        filter(a => !!a),
        map(a => a!),
        // Convert the offset into a position
        map(offsetWord => ({...offsetWord, position: textDocument.positionAt(offsetWord.offset) })),
        // Calculate the range
        map(word => ({
            ...word,
            range: {
                start: word.position,
                end: ({...word.position, character: word.position.character + word.text.length })
            }
        })),
        // Convert it to a Diagnostic
        map(({text, range}) => ({
            severity,
            range: range,
            message: `"${text}": Unknown word.`,
            source: diagSource
        })),
    );
}

