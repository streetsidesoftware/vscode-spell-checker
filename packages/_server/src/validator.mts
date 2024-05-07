import { Text as TextUtil } from 'cspell-lib';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { Diagnostic } from 'vscode-languageserver-types';
import { DiagnosticSeverity } from 'vscode-languageserver-types';

import type { SpellCheckerDiagnosticData, SpellingDiagnostic, Suggestion } from './api.js';
import type { CSpellUserSettings } from './config/cspellConfig/index.mjs';
import { diagnosticSource } from './constants.mjs';
import { createDocumentValidator } from './DocumentValidationController.mjs';

export { createTextDocument, validateText } from 'cspell-lib';

export const diagnosticCollectionName = diagnosticSource;
export const diagSource = diagnosticCollectionName;

const diagSeverityMap = new Map<string, DiagnosticSeverity | undefined>([
    ['error', DiagnosticSeverity.Error],
    ['warning', DiagnosticSeverity.Warning],
    ['information', DiagnosticSeverity.Information],
    ['hint', DiagnosticSeverity.Hint],
    ['off', undefined],
]);

export async function validateTextDocument(textDocument: TextDocument, options: CSpellUserSettings): Promise<Diagnostic[]> {
    const { severity, severityFlaggedWords } = calcSeverity(textDocument.uri, options);
    const docVal = await createDocumentValidator(textDocument, options);
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
            severity: issue.isFlagged ? severityFlaggedWords : severity,
        }))
        // Convert it to a Diagnostic
        .map(({ text, range, isFlagged, message, issueType, suggestions, suggestionsEx, severity }) => {
            const diagMessage = `"${text}": ${message ?? `${isFlagged ? 'Forbidden' : 'Unknown'} word`}.`;
            const sugs = suggestionsEx || suggestions?.map((word) => ({ word }));
            const data: SpellCheckerDiagnosticData = {
                text,
                issueType,
                isFlagged,
                isSuggestion: undefined, // This is a future enhancement to CSpell.
                suggestions: haveSuggestionsMatchCase(text, sugs),
            };
            const diag: SpellingDiagnostic = { severity, range, message: diagMessage, source: diagSource, data };
            return diag;
        })
        .filter((diag) => !!diag.severity);
    return diags;
}

function haveSuggestionsMatchCase(example: string, suggestions: Suggestion[] | undefined): Suggestion[] | undefined {
    if (!suggestions || TextUtil.isLowerCase(example)) return suggestions;
    return suggestions.map((sug) => (TextUtil.isLowerCase(sug.word) ? { ...sug, word: TextUtil.matchCase(example, sug.word) } : sug));
}

type SeverityOptions = Pick<CSpellUserSettings, 'diagnosticLevel' | 'diagnosticLevelFlaggedWords'>;

interface Severity {
    severity: DiagnosticSeverity | undefined;
    severityFlaggedWords: DiagnosticSeverity | undefined;
}

function calcSeverity(_docUri: string, options: SeverityOptions): Severity {
    const { diagnosticLevel = 'Information', diagnosticLevelFlaggedWords } = options;
    const severity = diagSeverityMap.get(diagnosticLevel.toLowerCase());
    const severityFlaggedWords = diagSeverityMap.get((diagnosticLevelFlaggedWords || diagnosticLevel).toLowerCase());
    return { severity, severityFlaggedWords };
}
