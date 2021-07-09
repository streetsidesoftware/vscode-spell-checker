import { Uri, languages, Diagnostic } from 'vscode';
import { diagnosticSource } from './constants';

/**
 * Return cspell diags for a given uri.
 * @param docUri - uri of diag to look for.
 * @returns any cspell diags found matching the uri.
 */
export function getCSpellDiags(docUri: Uri | undefined): Diagnostic[] {
    const diags = (docUri && languages.getDiagnostics(docUri)) || [];
    const cSpellDiags = diags.filter((d) => d.source === diagnosticSource);
    return cSpellDiags;
}
