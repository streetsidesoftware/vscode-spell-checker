import { createTextDocument, DocumentValidator } from 'cspell-lib';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { Diagnostic } from 'vscode-languageserver-types';
import { DiagnosticSeverity } from 'vscode-languageserver-types';

import type { CSpellUserSettings } from './config/cspellConfig/index.mjs';
import { diagnosticSource } from './constants.mjs';
import type { DiagnosticData } from './models/DiagnosticData.mjs';

export { createTextDocument, validateText } from 'cspell-lib';

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
    const content = textDocument.getText().slice(0, limit);
    const docInfo = {
        uri: textDocument.uri,
        content,
        languageId: textDocument.languageId,
        version: textDocument.version,
    };
    const doc = createTextDocument(docInfo);
    const docVal = new DocumentValidator(doc, { noConfigSearch: true }, options);
    await docVal.prepare();
    const r = await docVal.checkDocumentAsync(true);
    const diags = r
        // Convert the offset into a position
        .map((issue) => ({ ...issue, position: textDocument.positionAt(issue.offset) }))
        // Calculate the range
        .map((issue) => ({
            ...issue,
            range: {
                start: issue.position,
                end: { ...issue.position, character: issue.position.character + (issue.length ?? issue.text.length) },
            },
        }))
        // Convert it to a Diagnostic
        .map(({ text, range, isFlagged, message, issueType, suggestions, suggestionsEx }) => {
            const diagMessage = `"${text}": ${message ?? `${isFlagged ? 'Forbidden' : 'Unknown'} word`}.`;
            const sugs = suggestionsEx || suggestions?.map((word) => ({ word }));
            const data: DiagnosticData = { issueType, suggestions: sugs };
            return { severity, range, message: diagMessage, source: diagSource, data };
        });
    return diags;
}
