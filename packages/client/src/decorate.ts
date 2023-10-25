import { createDisposableList } from 'utils-disposables';
import type { DecorationOptions, DiagnosticChangeEvent, TextDocument, TextEditor, TextEditorDecorationType, Uri } from 'vscode';
import vscode, { ColorThemeKind, DiagnosticSeverity, MarkdownString } from 'vscode';

import type { CSpellUserSettings } from './client';
import { commandUri, createTextEditCommand } from './commands';
import type { Disposable } from './disposable';
import type { IssueTracker, SpellingDiagnostic } from './issueTracker';

export class SpellingIssueDecorator implements Disposable {
    private decorationType: TextEditorDecorationType | undefined;
    private disposables = createDisposableList();
    public dispose = this.disposables.dispose;

    constructor(readonly issueTracker: IssueTracker) {
        this.decorationType = this.createDecorator();
        this.disposables.push(
            () => this.clearDecoration(),
            vscode.workspace.onDidChangeConfiguration((e) => e.affectsConfiguration('cSpell') && this.resetDecorator()),
            vscode.window.onDidChangeActiveColorTheme(() => this.resetDecorator()),
            issueTracker.onDidChangeDiagnostics((e) => this.handleOnDidChangeDiagnostics(e)),
            vscode.window.onDidChangeActiveTextEditor((e) => this.refreshEditor(e)),
        );
    }

    private handleOnDidChangeDiagnostics(event: DiagnosticChangeEvent) {
        this.refreshDiagnostics(event.uris);
    }

    refreshEditor(e: vscode.TextEditor | undefined) {
        e ??= vscode.window.activeTextEditor;
        if (!e) return;
        return this.refreshDiagnostics([e.document.uri]);
    }

    refreshDiagnostics(docUris?: readonly Uri[]) {
        docUris ??= vscode.window.visibleTextEditors.map((e) => e.document.uri);
        const updated = new Set(docUris.map((uri) => uri.toString()));
        const editors = vscode.window.visibleTextEditors.filter((editor) => updated.has(editor.document.uri.toString()));
        editors.forEach((editor) => this.refreshDiagnosticsInEditor(editor));
    }

    refreshDiagnosticsInEditor(editor: TextEditor) {
        if (!this.decorationType) return;
        const doc = editor.document;
        const diags = this.issueTracker.getDiagnostics(doc.uri) || [];

        const decorations: DecorationOptions[] = diags
            .filter((diag) => diag.severity === DiagnosticSeverity.Hint)
            .map((diag) => diagToDecorationOptions(diag, doc));
        editor.setDecorations(this.decorationType, decorations);
    }

    private clearDecoration() {
        this.decorationType?.dispose();
        this.decorationType = undefined;
    }

    private resetDecorator() {
        this.decorationType = this.createDecorator();
        this.refreshDiagnostics();
    }

    private createDecorator(): TextEditorDecorationType | undefined {
        this.clearDecoration();
        const decorateIssues = vscode.workspace.getConfiguration('cSpell').get('decorateIssues');
        if (!decorateIssues) return undefined;

        const mode = calcMode(vscode.window.activeColorTheme.kind);
        const cfg = vscode.workspace.getConfiguration('cSpell') as CSpellUserSettings;

        const overviewRulerColor: string | undefined = cfg[mode]?.overviewRulerColor || cfg.overviewRulerColor || undefined;
        const textDecoration: string | undefined = cfg[mode]?.textDecoration || cfg.textDecoration || undefined;

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

function diagToDecorationOptions(diag: SpellingDiagnostic, doc: TextDocument): DecorationOptions {
    const { range } = diag;
    const { suggestions, isFlagged, isSuggestion } = diag.data || {};
    const text = doc.getText(range);

    const commandSuggest = commandUri('cSpell.suggestSpellingCorrections', doc.uri, range, text);
    // const commandAdd = commandUri('cSpell.addWordToDictionary', text);

    const mdShowSuggestions = markdownLink('Suggestions $(chevron-right)', commandSuggest, 'Show suggestions.');

    const icon = isFlagged ? '$(error)' : isSuggestion ? '$(info)' : '$(warning)';

    const hoverMessage = new MarkdownString(icon + ' ', true);

    hoverMessage.appendMarkdown('***').appendText(text).appendMarkdown('***: ');

    if (isSuggestion) {
        hoverMessage.appendText('Has Suggestions.');
        if (!suggestions?.length) {
            hoverMessage.appendText(' ').appendMarkdown(mdShowSuggestions);
        }
    } else {
        if (isFlagged) {
            hoverMessage.appendText('Forbidden word.');
        } else {
            hoverMessage.appendText('Unknown word.');
        }
        hoverMessage.appendText(' ').appendMarkdown(mdShowSuggestions);
    }

    if (suggestions?.length) {
        for (const suggestion of suggestions) {
            const { word } = suggestion;
            const cmd = createTextEditCommand('fix', doc.uri, doc.version, [{ range, newText: word }]);
            hoverMessage.appendMarkdown('\n- ' + markdownLink(word, commandUri(cmd), `Fix with ${word}`) + '\n');
        }
    }

    hoverMessage.isTrusted = true;
    return { range, hoverMessage };
}

function markdownLink(text: string, uri: string, hover?: string) {
    const hoverText = hover ? ` "${hover}"` : '';
    return `[${text}](${uri}${hoverText})`;
}

type ColorMode = 'dark' | 'light';

function calcMode(kind: ColorThemeKind): ColorMode {
    switch (kind) {
        case ColorThemeKind.Dark:
        case ColorThemeKind.HighContrast:
            return 'dark';
        case ColorThemeKind.HighContrastLight:
        case ColorThemeKind.Light:
            return 'light';
    }
}
