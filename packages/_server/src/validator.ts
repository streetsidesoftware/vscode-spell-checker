import { TextDocument } from 'vscode-languageserver-textdocument';
import { validateText } from 'cspell-lib';
import type { CSpellUserSettings } from './config/cspellConfig';
import { DiagnosticSeverity, Diagnostic } from 'vscode-languageserver-types';
import { diagnosticSource } from './constants';

export { validateText } from 'cspell-lib';

export const diagnosticCollectionName = diagnosticSource;
export const diagSource = diagnosticCollectionName;
export const defaultCheckLimit = 500;

const diagSeverityMap = new Map<string, DiagnosticSeverity>([
    ['error', DiagnosticSeverity.Error],
    ['warning', DiagnosticSeverity.Warning],
    ['information', DiagnosticSeverity.Information],
    ['hint', DiagnosticSeverity.Hint],
]);

export async function validateTextDocument(textDocument: TextDocument, options: CSpellUserSettings): Promise<Diagnostic[]> {
    const { diagnosticLevel = DiagnosticSeverity.Information.toString() } = options;
    const severity = diagSeverityMap.get(diagnosticLevel.toLowerCase()) || DiagnosticSeverity.Information;
    const limit = (options.checkLimit || defaultCheckLimit) * 1024;
    const text = textDocument.getText().slice(0, limit);
    const r = await validateText(text, options);
    const diags = r
        // Convert the offset into a position
        .map((issue) => ({ ...issue, position: textDocument.positionAt(issue.offset) }))
        // Calculate the range
        .map((issue) => ({
            ...issue,
            range: {
                start: issue.position,
                end: { ...issue.position, character: issue.position.character + issue.text.length },
            },
        }))
        // Convert it to a Diagnostic
        .map(({ text, range, isFlagged }) => ({
            severity,
            range: range,
            message: `"${text}": ${isFlagged ? 'Forbidden' : 'Unknown'} word.`,
            source: diagSource,
        }));
    return diags;
}
