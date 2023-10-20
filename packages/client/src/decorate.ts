import { createDisposableList } from 'utils-disposables';
import type { DecorationOptions, Diagnostic, DiagnosticChangeEvent, TextEditor, TextEditorDecorationType, Uri } from 'vscode';
import vscode, { MarkdownString } from 'vscode';

import { getCSpellDiags } from './diags';
import type { Disposable } from './disposable';

export class SpellingIssueDecorator implements Disposable {
    private decorationType: TextEditorDecorationType | undefined;
    private disposables = createDisposableList();
    public dispose = this.disposables.dispose;

    constructor() {
        this.decorationType = this.createDecorator();
        this.disposables.push(
            () => this.clearDecoration(),
            vscode.workspace.onDidChangeConfiguration((e) => e.affectsConfiguration('cSpell') && this.resetDecorator()),
        );
    }

    handleOnDidChangeDiagnostics(event: DiagnosticChangeEvent) {
        this.refreshDiagnostics(event.uris);
    }

    refreshDiagnostics(uris: readonly Uri[]) {
        const updated = new Set(uris.map((uri) => uri.toString()));
        const editors = vscode.window.visibleTextEditors.filter((editor) => updated.has(editor.document.uri.toString()));
        editors.forEach((editor) => this.refreshDiagnosticsInEditor(editor));
    }

    refreshDiagnosticsInEditor(editor: TextEditor) {
        if (!this.decorationType) return;
        const diags = getCSpellDiags(editor.document.uri);

        const decorations: DecorationOptions[] = diags.map(diagToDecorationOptions);
        editor.setDecorations(this.decorationType, decorations);
    }

    private clearDecoration() {
        this.decorationType?.dispose();
        this.decorationType = undefined;
    }

    private resetDecorator() {
        this.decorationType = this.createDecorator();
    }

    private createDecorator(): TextEditorDecorationType | undefined {
        this.clearDecoration();
        const diagLevel = vscode.workspace.getConfiguration('cSpell').get('diagnosticLevel');
        const decorateIssues = vscode.workspace.getConfiguration('cSpell').get('decorateIssues');
        if (diagLevel !== 'Hint' || !decorateIssues) return undefined;

        const overviewRulerColor: string | undefined = vscode.workspace.getConfiguration('cSpell').get('overviewRulerColor') || undefined;
        const textDecoration: string | undefined = vscode.workspace.getConfiguration('cSpell').get('textDecoration') || undefined;

        return vscode.window.createTextEditorDecorationType({
            isWholeLine: false,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            overviewRulerColor: overviewRulerColor,
            textDecoration: textDecoration,
        });
    }
}

function diagToDecorationOptions(diag: Diagnostic): DecorationOptions {
    const { range } = diag;
    const hoverMessage = new MarkdownString(diag.message);
    return { range, hoverMessage };
}
