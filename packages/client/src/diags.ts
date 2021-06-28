import { Uri, languages, Diagnostic } from 'vscode';
import { diagnosticSource } from './constants';

export function getCSpellDiags(docUri: Uri | undefined): Diagnostic[] {
    const diags = (docUri && languages.getDiagnostics(docUri)) || [];
    const cSpellDiags = diags.filter((d) => d.source === diagnosticSource);
    return cSpellDiags;
}
