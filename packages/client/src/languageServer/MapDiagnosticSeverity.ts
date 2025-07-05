import { DiagnosticSeverity } from 'vscode';

import type { DiagnosticSeverity as DiagnosticSeverityNum } from '../vscode-languageclient/node.cjs';
import { DiagnosticSeverity as LcDiagnosticSeverity } from '../vscode-languageclient/node.cjs';

type MapDiagnosticSeverity = Record<DiagnosticSeverity, DiagnosticSeverityNum>;

export const diagSeverityMap: MapDiagnosticSeverity = {
    [DiagnosticSeverity.Error]: LcDiagnosticSeverity.Error,
    [DiagnosticSeverity.Warning]: LcDiagnosticSeverity.Warning,
    [DiagnosticSeverity.Information]: LcDiagnosticSeverity.Information,
    [DiagnosticSeverity.Hint]: LcDiagnosticSeverity.Hint,
};
