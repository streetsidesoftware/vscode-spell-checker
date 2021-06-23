import { TextDocument } from 'vscode-languageserver-textdocument';
import { validateText } from 'cspell-lib';
import { CSpellUserSettings } from './config/cspellConfig';
import { DiagnosticSeverity, Diagnostic } from 'vscode-languageserver-types';

export { validateText } from 'cspell-lib';

export const diagnosticCollectionName = 'cSpell';
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
        .map((offsetWord) => ({ ...offsetWord, position: textDocument.positionAt(offsetWord.offset) }))
        // Calculate the range
        .map((word) => ({
            ...word,
            range: {
                start: word.position,
                end: { ...word.position, character: word.position.character + word.text.length },
            },
        }))
        // Convert it to a Diagnostic
        .map(({ text, range }) => ({
            severity,
            range: range,
            message: `"${text}": Unknown word.`,
            source: diagSource,
        }));
    return diags;
}
