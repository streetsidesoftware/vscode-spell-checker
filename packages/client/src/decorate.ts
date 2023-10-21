import { createDisposableList } from 'utils-disposables';
import type { DecorationOptions, Diagnostic, DiagnosticChangeEvent, TextEditor, TextEditorDecorationType, Uri } from 'vscode';
import vscode, { DiagnosticSeverity, MarkdownString } from 'vscode';

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
        const doc = editor.document;
        const diags = getCSpellDiags(doc.uri);

        const decorations: DecorationOptions[] = diags
            .filter((diag) => diag.severity === DiagnosticSeverity.Hint)
            .map((diag) => diagToDecorationOptions(diag, doc.getText(diag.range)));
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

        const decorator = vscode.window.createTextEditorDecorationType({
            isWholeLine: false,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            overviewRulerColor: overviewRulerColor,
            textDecoration: textDecoration,
        });
        return decorator;
    }
}

function diagToDecorationOptions(diag: Diagnostic, text: string): DecorationOptions {
    const { range } = diag;
    const commandSuggest = commandUri('cSpell.suggestSpellingCorrections', { text, range });
    const commandAdd = commandUri('cSpell.addWordToDictionary', text);
    const hoverMessage = new MarkdownString(diag.message)
        .appendText(' ')
        .appendMarkdown(markdownLink('Suggest', commandSuggest, 'Show suggestions.'))
        .appendText(', ')
        .appendMarkdown(markdownLink('Add', commandAdd, 'Add word to dictionary.'));
    hoverMessage.isTrusted = true;
    return { range, hoverMessage };
}

function commandUri(command: string, ...params: unknown[]): string {
    return `command:${command}?${encodeURIComponent(JSON.stringify(params))}`;
}

function markdownLink(text: string, uri: string, hover?: string) {
    const hoverText = hover ? ` "${hover}"` : '';
    return `[${text}](${uri}${hoverText})`;
}
