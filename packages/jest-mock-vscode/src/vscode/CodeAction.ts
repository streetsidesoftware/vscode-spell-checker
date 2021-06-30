import type * as vscode from 'vscode';

export class CodeAction implements vscode.CodeAction {
    title: string;

    command?: vscode.Command;

    edit?: vscode.WorkspaceEdit;

    diagnostics?: vscode.Diagnostic[];

    kind?: vscode.CodeActionKind;

    isPreferred?: boolean;

    constructor(title: string, kind?: vscode.CodeActionKind) {
        this.title = title;
        this.kind = kind;
    }
}
