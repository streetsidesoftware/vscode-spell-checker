import { createDisposableList } from 'utils-disposables';
import type { DecorationOptions, DiagnosticChangeEvent, TextEditor, TextEditorDecorationType, Uri } from 'vscode';
import vscode, { ColorThemeKind, DiagnosticSeverity, MarkdownString, window, workspace } from 'vscode';

import type { CSpellUserSettings } from '../client';
import { commandUri, createTextEditCommand } from '../commands';
import type { Disposable } from '../disposable';
import type { IssueTracker, SpellingCheckerIssue } from '../issueTracker';

export class SpellingIssueDecorator implements Disposable {
    private decorationTypeForIssues: TextEditorDecorationType | undefined;
    private decorationTypeForFlagged: TextEditorDecorationType | undefined;
    private disposables = createDisposableList();
    private visibleEditors = new Set<TextEditor>();
    public dispose = this.disposables.dispose;

    constructor(readonly issueTracker: IssueTracker) {
        const decorators = this.createDecorators();

        this.decorationTypeForIssues = decorators?.decoratorIssues;
        this.decorationTypeForFlagged = decorators?.decoratorFlagged;
        this.disposables.push(
            () => this.clearDecoration(),
            workspace.onDidChangeConfiguration((e) => e.affectsConfiguration('cSpell') && this.resetDecorator()),
            window.onDidChangeActiveColorTheme(() => this.resetDecorator()),
            issueTracker.onDidChangeDiagnostics((e) => this.handleOnDidChangeDiagnostics(e)),
            window.onDidChangeActiveTextEditor((e) => this.refreshEditor(e)),
            window.onDidChangeVisibleTextEditors((e) => this.handleOnDidChangeVisibleTextEditors(e)),
        );
    }

    private handleOnDidChangeDiagnostics(event: DiagnosticChangeEvent) {
        this.refreshDiagnostics(event.uris);
    }

    private handleOnDidChangeVisibleTextEditors(editors: readonly TextEditor[]) {
        const added = editors.filter((e) => !this.visibleEditors.has(e));
        this.visibleEditors.clear();
        this.visibleEditors = new Set(editors);
        this.refreshDiagnostics([...added].map((e) => e.document.uri));
    }

    refreshEditor(e: vscode.TextEditor | undefined) {
        e ??= window.activeTextEditor;
        if (!e) return;
        return this.refreshDiagnostics([e.document.uri]);
    }

    refreshDiagnostics(docUris?: readonly Uri[]) {
        // console.log('refreshDiagnostics %o', {
        //     docUris: docUris?.map((u) => u.toString(true)),
        //     docs: workspace.textDocuments.map((d) => ({ uri: d.uri.toString(true), languageId: d.languageId })),
        //     notebooks: workspace.notebookDocuments.map((d) => d.uri.toString(true)),
        //     folders: workspace.workspaceFolders?.map((f) => f.uri.toString(true)),
        //     editors: window.visibleTextEditors.map((e) => e.document.uri.toString(true)),
        //     notebookEditors: window.visibleNotebookEditors.map((e) => e.notebook.uri.toString(true)),
        // });
        docUris ??= window.visibleTextEditors.map((e) => e.document.uri);
        const updated = new Set(docUris.map((uri) => uri.toString()));
        const editors = window.visibleTextEditors.filter((editor) => updated.has(editor.document.uri.toString()));
        editors.forEach((editor) => this.refreshDiagnosticsInEditor(editor));
    }

    refreshDiagnosticsInEditor(editor: TextEditor) {
        if (!this.decorationTypeForIssues || !this.decorationTypeForFlagged) return;
        const doc = editor.document;
        const issues = this.issueTracker.getIssues(doc.uri) || [];

        const decorationsIssues: DecorationOptions[] = issues
            .filter((issue) => issue.severity === DiagnosticSeverity.Hint)
            .filter((issue) => !issue.isFlagged())
            .map((diag) => diagToDecorationOptions(diag));
        editor.setDecorations(this.decorationTypeForIssues, decorationsIssues);

        const decorationsFlagged: DecorationOptions[] = issues
            .filter((issue) => issue.severity === DiagnosticSeverity.Hint)
            .filter((issue) => issue.isFlagged())
            .map((diag) => diagToDecorationOptions(diag));
        editor.setDecorations(this.decorationTypeForFlagged, decorationsFlagged);
    }

    private clearDecoration() {
        this.visibleEditors.clear();
        this.decorationTypeForIssues?.dispose();
        this.decorationTypeForIssues = undefined;
        this.decorationTypeForFlagged?.dispose();
        this.decorationTypeForFlagged = undefined;
    }

    private resetDecorator() {
        const decorators = this.createDecorators();
        this.decorationTypeForIssues = decorators?.decoratorIssues;
        this.decorationTypeForFlagged = decorators?.decoratorFlagged;
        this.refreshDiagnostics();
    }

    private createDecorators(): { decoratorIssues: TextEditorDecorationType; decoratorFlagged: TextEditorDecorationType } | undefined {
        this.clearDecoration();
        const decorateIssues = workspace.getConfiguration('cSpell').get('decorateIssues');
        if (!decorateIssues) return undefined;

        const mode = calcMode(window.activeColorTheme.kind);
        const cfg = workspace.getConfiguration('cSpell') as CSpellUserSettings;

        const overviewRulerColor: string | undefined = cfg[mode]?.overviewRulerColor || cfg.overviewRulerColor || undefined;

        const decoratorIssues = window.createTextEditorDecorationType({
            isWholeLine: false,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            overviewRulerColor: overviewRulerColor,
            textDecoration: calcTextDecoration(cfg, mode, 'textDecorationColor'),
        });

        const decoratorFlagged = window.createTextEditorDecorationType({
            isWholeLine: false,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            overviewRulerColor: overviewRulerColor,
            textDecoration: calcTextDecoration(cfg, mode, 'textDecorationColorFlagged'),
        });

        return { decoratorIssues, decoratorFlagged };
    }
}

function calcTextDecoration(cfg: CSpellUserSettings, mode: ColorMode, colorField: 'textDecorationColor' | 'textDecorationColorFlagged') {
    const textDecoration = cfg[mode]?.textDecoration || cfg.textDecoration || '';
    const line = cfg[mode]?.textDecorationLine || cfg.textDecorationLine || 'underline';
    const style = cfg[mode]?.textDecorationStyle || cfg.textDecorationStyle || 'wavy';
    const thickness = cfg[mode]?.textDecorationThickness || cfg.textDecorationThickness || 'auto';
    const color = cfg[mode]?.[colorField] || cfg[colorField] || '#fc4';
    return textDecoration || `${line} ${style} ${color} ${thickness}`;
}

function diagToDecorationOptions(issue: SpellingCheckerIssue): DecorationOptions {
    const { range } = issue;
    const suggestions = issue.providedSuggestions();
    const isFlagged = issue.isFlagged();
    const isSuggestion = issue.isSuggestion();
    const text = issue.word;
    const doc = issue.document;

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
