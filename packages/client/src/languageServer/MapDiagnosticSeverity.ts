import { DiagnosticSeverity } from 'vscode';
import type { DiagnosticSeverity as DiagnosticSeverityNum } from 'vscode-languageclient/node';
import { DiagnosticSeverity as LcDiagnosticSeverity } from 'vscode-languageclient/node';

type MapDiagnosticSeverity = {
    [key in DiagnosticSeverity]: DiagnosticSeverityNum;
};

export const diagSeverityMap: MapDiagnosticSeverity = {
    [DiagnosticSeverity.Error]: LcDiagnosticSeverity.Error,
    [DiagnosticSeverity.Warning]: LcDiagnosticSeverity.Warning,
    [DiagnosticSeverity.Information]: LcDiagnosticSeverity.Information,
    [DiagnosticSeverity.Hint]: LcDiagnosticSeverity.Hint,
};
