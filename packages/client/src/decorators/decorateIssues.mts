import { isDefined } from '@internal/common-utils';
import { createDisposableList } from 'utils-disposables';
import type { DecorationOptions, DiagnosticChangeEvent, TextEditor, TextEditorDecorationType, Uri } from 'vscode';
import vscode, { ColorThemeKind, MarkdownString, Range, window, workspace } from 'vscode';

import type { PartialCSpellUserSettings } from '../client/index.mjs';
import { commandUri, createTextEditCommand } from '../commands.mjs';
import type { Disposable } from '../disposable.js';
import type { IssueTracker, SpellingCheckerIssue } from '../issueTracker.mjs';
import type { CSpellSettings } from '../settings/index.mjs';
import { ConfigFields } from '../settings/index.mjs';
import { setContext } from '../storage/context.mjs';
import { findEditor } from '../vscode/findEditor.js';

const defaultHideIssuesWhileTyping: Required<PartialCSpellUserSettings<'hideIssuesWhileTyping'>>['hideIssuesWhileTyping'] = 'Word';
const defaultRevealIssuesAfterDelayMS: Required<PartialCSpellUserSettings<'revealIssuesAfterDelayMS'>>['revealIssuesAfterDelayMS'] = 1000;

const debug = false;
const logDbg: typeof console.log = debug ? console.log : () => undefined;

export class SpellingIssueDecorator implements Disposable {
    private decorationTypeForIssues: TextEditorDecorationType | undefined;
    private decorationTypeForFlagged: TextEditorDecorationType | undefined;
    private decorationTypeForSuggestions: TextEditorDecorationType | undefined;
    private decorationTypeForDebug: TextEditorDecorationType | undefined;
    private disposables = createDisposableList();
    private visibleEditors = new Set<TextEditor>();
    private _visible = true;
    public dispose = this.disposables.dispose;
    private docChanges = new Map<string, LastDocumentChange>();
    private refreshTimeout: NodeJS.Timeout | undefined;
    private urisToRefresh = new Set<vscode.Uri>();
    private hideIssuesWhileTyping = defaultHideIssuesWhileTyping;
    private revealIssuesAfterDelayMS = defaultRevealIssuesAfterDelayMS;
    private emitterVisibility: vscode.EventEmitter<boolean> = new vscode.EventEmitter();
    private overrides: Exclude<CSpellSettings[typeof ConfigFields.doNotUseCustomDecorationForScheme], undefined> = {};

    constructor(
        readonly context: vscode.ExtensionContext,
        readonly issueTracker: IssueTracker,
    ) {
        this.getConfiguration();
        const decorators = this.createDecorators();
        this._visible = context.globalState.get(SpellingIssueDecorator.globalStateKey, true);
        this.decorationTypeForIssues = decorators?.decoratorIssues;
        this.decorationTypeForFlagged = decorators?.decoratorFlagged;
        this.decorationTypeForSuggestions = decorators?.decoratorSuggestions;
        this.decorationTypeForDebug = decorators?.decoratorDebug;
        this.disposables.push(
            () => this.clearDecoration(),
            workspace.onDidChangeConfiguration((e) => this.#onConfigChange(e)),
            window.onDidChangeActiveColorTheme(() => this.resetDecorator()),
            issueTracker.onDidChangeDiagnostics((e) => this.handleOnDidChangeDiagnostics(e)),
            window.onDidChangeActiveTextEditor((e) => this.refreshEditor(e)),
            window.onDidChangeVisibleTextEditors((e) => this.handleOnDidChangeVisibleTextEditors(e)),
            window.onDidChangeTextEditorSelection((e) => this.#onSelectionChange(e)),
            workspace.onDidChangeTextDocument((e) => this.#onDocumentChange(e)),
            workspace.onDidCloseTextDocument((doc) => this.docChanges.delete(doc.uri.toString())),
        );
        this.setContext(this._visible);
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
        // log('refreshDiagnostics %o', {
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
        if (
            !this.decorationTypeForIssues ||
            !this.decorationTypeForFlagged ||
            !this.decorationTypeForDebug ||
            !this.decorationTypeForSuggestions
        )
            return;
        const doc = editor.document;
        if (!this.#useCustomDecorators(doc.uri)) {
            editor.setDecorations(this.decorationTypeForIssues, []);
            editor.setDecorations(this.decorationTypeForFlagged, []);
            editor.setDecorations(this.decorationTypeForSuggestions, []);
            return;
        }

        const delay = this.revealIssuesAfterDelayMS;
        const mode = this.hideIssuesWhileTyping;
        const rangeDoc = doc.validateRange(new Range(doc.positionAt(0), doc.positionAt(doc.getText().length)));
        const activeRangeMap =
            mode === 'Word'
                ? (r: Range) => union(r, doc.getWordRangeAtPosition(r.start), doc.getWordRangeAtPosition(r.end))
                : mode === 'Line'
                  ? (r: Range) => doc.lineAt(r.start.line).range
                  : (_r: Range) => rangeDoc;
        const now = performance.now();
        const recentChanges = this.docChanges.get(doc.uri.toString());
        const toDelay = recentChanges && delay - (now - recentChanges.timestamp);
        logDbg('refreshDiagnosticsInEditor %o', {
            t: performance.now().toFixed(2),
            version: recentChanges?.version,
            delay,
            mode,
            delta: now - (recentChanges?.timestamp || now),
            toDelay,
        });
        const activeRanges = ((mode !== 'Off' && recentChanges && now - recentChanges.timestamp < delay && recentChanges.ranges) || []).map(
            activeRangeMap,
        );
        const active = editor.selections
            .map((s) => {
                const intersections = activeRanges.filter((r) => r.intersection(s));
                if (!intersections.length) return undefined;
                return union(s, ...intersections);
            })
            .filter(isDefined);

        let hasHidden = false;

        const issues = (this.issueTracker.getSpellingIssues(doc.uri) || []).filter((issue) => {
            const range = issue.range;
            const hide = active.some((r) => r.intersection(range));
            hasHidden ||= hide;
            return !hide;
        });

        if (hasHidden) {
            this.#addUriToRefreshTimeout(doc.uri);
        }

        const decorationsIssues: DecorationOptions[] = issues
            .filter((issue) => !issue.isFlagged() && !issue.treatAsSuggestion())
            .map((diag) => diagToDecorationOptions(diag))
            .filter(isDefined);
        editor.setDecorations(this.decorationTypeForIssues, decorationsIssues);

        const decorationsSuggestions: DecorationOptions[] = issues
            .filter((issue) => issue.treatAsSuggestion())
            .map((diag) => diagToDecorationOptions(diag))
            .filter(isDefined);
        editor.setDecorations(this.decorationTypeForSuggestions, decorationsSuggestions);

        const decorationsFlagged: DecorationOptions[] = issues
            .filter((issue) => issue.isFlagged() && issue.isIssueTypeSpelling())
            .map((diag) => diagToDecorationOptions(diag))
            .filter(isDefined);
        editor.setDecorations(this.decorationTypeForFlagged, decorationsFlagged);

        // editor.setDecorations(this.decorationTypeForDebug, activeRanges);
    }

    get visible() {
        return this.context.globalState.get(SpellingIssueDecorator.globalStateKey, this._visible);
    }

    set visible(value: boolean) {
        this.setContext(value);
        if (this._visible === value) return;
        this._visible = value;
        this.resetDecorator();
    }

    toggleVisible() {
        this.visible = !this.visible;
    }

    onDidChangeVisibility = this.emitterVisibility.event;

    private setContext(value: boolean) {
        this.context.globalState.update(SpellingIssueDecorator.globalStateKey, value);
        this.emitterVisibility.fire(value);
        Promise.resolve(setContext({ showDecorations: value })).catch(() => undefined);
    }

    private clearDecoration() {
        this.visibleEditors.clear();
        this.decorationTypeForIssues?.dispose();
        this.decorationTypeForIssues = undefined;
        this.decorationTypeForFlagged?.dispose();
        this.decorationTypeForFlagged = undefined;
        this.decorationTypeForSuggestions?.dispose();
        this.decorationTypeForSuggestions = undefined;
        this.decorationTypeForDebug?.dispose();
        this.decorationTypeForDebug = undefined;
    }

    private getConfiguration() {
        const cfg = workspace.getConfiguration('cSpell') as PartialCSpellUserSettings<
            'hideIssuesWhileTyping' | 'revealIssuesAfterDelayMS' | 'doNotUseCustomDecorationForScheme'
        >;
        this.hideIssuesWhileTyping = cfg.hideIssuesWhileTyping ?? defaultHideIssuesWhileTyping;
        this.revealIssuesAfterDelayMS = cfg.revealIssuesAfterDelayMS ?? defaultRevealIssuesAfterDelayMS;
        this.overrides = cfg[ConfigFields.doNotUseCustomDecorationForScheme] ?? this.overrides;
    }

    private resetDecorator() {
        this.docChanges.clear();
        this.getConfiguration();
        const decorators = this.createDecorators();
        this.decorationTypeForIssues = decorators?.decoratorIssues;
        this.decorationTypeForFlagged = decorators?.decoratorFlagged;
        this.decorationTypeForSuggestions = decorators?.decoratorSuggestions;
        this.decorationTypeForDebug = decorators?.decoratorDebug;
        this.refreshDiagnostics();
    }

    private createDecorators():
        | {
              decoratorIssues: TextEditorDecorationType;
              decoratorFlagged: TextEditorDecorationType;
              decoratorSuggestions: TextEditorDecorationType;
              decoratorDebug: TextEditorDecorationType;
          }
        | undefined {
        this.clearDecoration();
        const useCustomDecorations = this.visible && (workspace.getConfiguration('cSpell').get<boolean>('useCustomDecorations') ?? true);
        if (!useCustomDecorations) return undefined;

        const mode = calcMode(window.activeColorTheme.kind);
        const cfg = workspace.getConfiguration('cSpell') as PartialCSpellUserSettings<
            | 'dark'
            | 'doNotUseCustomDecorationForScheme'
            | 'hideIssuesWhileTyping'
            | 'light'
            | 'overviewRulerColor'
            | 'revealIssuesAfterDelayMS'
            | 'textDecoration'
            | 'textDecorationColor'
            | 'textDecorationColorFlagged'
            | 'textDecorationColorSuggestion'
            | 'textDecorationLine'
            | 'textDecorationStyle'
            | 'textDecorationThickness'
        >;

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

        const decoratorSuggestions = window.createTextEditorDecorationType({
            isWholeLine: false,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            overviewRulerColor: overviewRulerColor,
            textDecoration: calcTextDecoration(cfg, mode, 'textDecorationColorSuggestion'),
        });

        const decoratorDebug = window.createTextEditorDecorationType({
            isWholeLine: false,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
        });

        return { decoratorIssues, decoratorFlagged, decoratorSuggestions, decoratorDebug };
    }

    #scheduleUriRefresh() {
        if (this.refreshTimeout || this.urisToRefresh.size < 1) return;
        this.refreshTimeout = setTimeout(() => {
            this.refreshTimeout = undefined;
            const uris = [...this.urisToRefresh];
            this.urisToRefresh.clear();
            const now = performance.now();
            uris.forEach((uri) => {
                const change = this.docChanges.get(uri.toString());
                if (!change || now - change.timestamp >= this.revealIssuesAfterDelayMS) return;
                this.urisToRefresh.add(uri);
            });
            const toRefresh = uris.filter((uri) => !this.urisToRefresh.has(uri));
            this.refreshDiagnostics(toRefresh);
            this.#scheduleUriRefresh();
        }, 100);
    }

    #addUriToRefreshTimeout(uri: vscode.Uri) {
        this.urisToRefresh.add(uri);
        this.#scheduleUriRefresh();
    }

    #onSelectionChange(_e: vscode.TextEditorSelectionChangeEvent) {
        logDbg('onSelectionChange %o', {
            t: performance.now().toFixed(2),
            kind: _e.kind,
            v: _e.textEditor.document.version,
            sel: JSON.stringify(_e.selections.map((s) => s.active)),
            uri: _e.textEditor.document.uri.toString(),
        });
    }
    #onDocumentChange(e: vscode.TextDocumentChangeEvent) {
        const { document, contentChanges } = e;
        const uriKey = document.uri.toString();

        const editor = findEditor(document.uri);
        if (!editor) {
            this.docChanges.delete(uriKey);
            return;
        }

        logDbg('onDocumentChange %o', {
            t: performance.now().toFixed(2),
            v: document.version,
            sel: JSON.stringify(editor.selections.map((s) => s.active)),
            c: JSON.stringify(contentChanges.map((c) => ({ r: c.range, t: c.text }))),
            uri: document.uri.toString(),
        });

        const ranges = changesToRanges(contentChanges);

        if (!ranges.length) {
            this.docChanges.delete(uriKey);
            return;
        }

        this.docChanges.set(uriKey, {
            uri: document.uri,
            version: document.version,
            ranges,
            timestamp: performance.now(),
        });
    }

    #useCustomDecorators(uri: vscode.Uri): boolean {
        return !this.overrides[uri.scheme];
    }

    #onConfigChange(e: vscode.ConfigurationChangeEvent) {
        if (!e.affectsConfiguration('cSpell')) return;
        this.resetDecorator();
    }

    public clearActiveChanges() {
        this.docChanges.clear();
    }

    static globalStateKey = 'showDecorations';
}

function calcTextDecoration(
    cfg: PartialCSpellUserSettings<
        | 'light'
        | 'dark'
        | 'textDecoration'
        | 'textDecorationLine'
        | 'textDecorationStyle'
        | 'textDecorationThickness'
        | 'textDecorationColor'
        | 'textDecorationColorFlagged'
        | 'textDecorationColorSuggestion'
    >,
    mode: ColorMode,
    colorField: 'textDecorationColor' | 'textDecorationColorFlagged' | 'textDecorationColorSuggestion',
) {
    const textDecoration = cfg[mode]?.textDecoration || cfg.textDecoration || '';
    const line = cfg[mode]?.textDecorationLine || cfg.textDecorationLine || 'underline';
    const style = cfg[mode]?.textDecorationStyle || cfg.textDecorationStyle || 'wavy';
    const thickness = cfg[mode]?.textDecorationThickness || cfg.textDecorationThickness || 'auto';
    const color = cfg[mode]?.[colorField] || cfg[colorField] || '#fc4';
    return textDecoration || `${line} ${style} ${color} ${thickness}`;
}

function diagToDecorationOptions(issue: SpellingCheckerIssue): DecorationOptions | undefined {
    const { range } = issue;
    const suggestions = issue.providedSuggestions();
    const isFlagged = issue.isFlagged();
    const isKnown = issue.isKnown();
    const isSuggestion = issue.treatAsSuggestion();
    const text = issue.word;
    const doc = issue.document;

    const commandSuggest = commandUri('cSpell.suggestSpellingCorrections', doc.uri, range, text);
    // const commandAdd = commandUri('cSpell.addWordToDictionary', text);

    const mdShowSuggestions = markdownLink('Suggestions $(chevron-right)', commandSuggest, 'Show suggestions.');

    const icon = isFlagged ? '$(error)' : isSuggestion ? '$(info)' : isKnown ? '$(warning)' : '$(issues)';

    const hoverMessage = new MarkdownString(icon + ' ', true);

    hoverMessage.appendMarkdown('***').appendText(text).appendMarkdown('***: ');
    const issueMsg = isFlagged ? 'Forbidden word.' : isKnown ? 'Misspelled word.' : 'Unknown word.';

    if (issue.isIssueTypeSpelling()) {
        if (issue.isSuggestion()) {
            hoverMessage.appendText('Has Suggestions.');
            if (!suggestions?.length) {
                hoverMessage.appendText(' ').appendMarkdown(mdShowSuggestions);
            }
        } else {
            hoverMessage.appendText(issueMsg);
            hoverMessage.appendText(' ').appendMarkdown(mdShowSuggestions);
        }
    } else if (issue.isIssueTypeDirective()) {
        hoverMessage.appendText('Unknown directive.');
        hoverMessage.appendText(' ').appendMarkdown(mdShowSuggestions);
    } else {
        logDbg('Unknown issue type: %o', issue);
        return undefined;
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

interface LastDocumentChange {
    uri: vscode.Uri;
    version: number;
    ranges: Range[];
    /**
     * The time the change notification was received.
     * `performance.now()` is used to get the current time in milliseconds.
     */
    timestamp: number;
}

function changeToRange(change: vscode.TextDocumentContentChangeEvent): Range {
    // Note: the start of the range is the right location, but the end, doesn't contain the text.
    return change.range.with(undefined, change.range.start.with(undefined, change.text.length + change.range.start.character));
}

function changesToRanges(changes: readonly vscode.TextDocumentContentChangeEvent[]): Range[] {
    return changes.map(changeToRange);
}

function union(r: Range, ...ranges: (Range | undefined)[]) {
    return ranges.filter(isDefined).reduce((acc, r2) => acc.union(r2), r);
}
