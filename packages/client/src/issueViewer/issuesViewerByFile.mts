import { groupByField } from '@internal/common-utils';
import type { ConfigTarget, Suggestion } from 'code-spell-checker-server/api';
import { createDisposableList } from 'utils-disposables';
import type { ExtensionContext, ProviderResult, Range, TextDocument, TreeDataProvider, Uri } from 'vscode';
import * as vscode from 'vscode';
import { TreeItem } from 'vscode';

import { actionAutoFixSpellingIssues } from '../applyCorrections.mjs';
import { commandHandlers, knownCommands } from '../commands.mjs';
import * as di from '../di.mjs';
import { createEmitter, pipe } from '../EventEmitter/index.mjs';
import { debounce } from '../EventEmitter/operators/index.mjs';
import type { IssueTracker, SpellingCheckerIssue } from '../issueTracker.mjs';
import { consoleDebug } from '../repl/consoleDebug.mjs';
import { findConicalDocument, findNotebookCellForDocument } from '../util/documentUri.js';
import { handleErrors, logErrors } from '../util/errors.js';
import { findTextDocument } from '../util/findEditor.js';
import { isDefined } from '../util/index.js';
import { IssueTreeItemBase } from './IssueTreeItemBase.js';
import { cleanWord, markdownInlineCode } from './markdownHelper.mjs';

const useConsoleLog = false;
const log = useConsoleLog ? console.log : consoleDebug;

// const debounceRevealDelay = 100;
const debounceUIDelay = 200;

export function activate(context: ExtensionContext, issueTracker: IssueTracker) {
    context.subscriptions.push(IssueExplorerByFile.register(issueTracker));
    context.subscriptions.push(
        // vscode.commands.registerCommand(
        //     knownCommands['cSpell.issuesViewByFile.item.openSuggestionsForIssue'],
        //     handleOpenSuggestionsForIssue,
        // ),
        vscode.commands.registerCommand(knownCommands['cSpell.issuesViewByFile.item.autoFixSpellingIssues'], handleAutoFixSpellingIssues),
        vscode.commands.registerCommand(knownCommands['cSpell.issuesViewByFile.item.addWordToDictionary'], handleAddWordToDictionary),
        vscode.commands.registerCommand('cSpell.issuesViewByFile.item.addWordToTarget', handleAddWordToTarget),
    );
}

type OnDidChangeEventType = IssueTreeItemBase | undefined;

class IssueExplorerByFile {
    private disposeList = createDisposableList();
    private treeView: vscode.TreeView<IssueTreeItemBase>;
    private treeDataProvider: IssuesTreeDataProvider;
    private uiEventFnEmitter = createEmitter<() => void>();

    constructor(issueTracker: IssueTracker) {
        const treeDataProvider = new IssuesTreeDataProvider({
            issueTracker,
            setDescription: (des) => {
                this.treeView.description = des;
            },
            setMessage: (msg) => {
                this.treeView.message = msg;
            },
            onDidUpdate: () => this.onDidUpdate(),
        });
        this.treeDataProvider = treeDataProvider;
        this.treeView = vscode.window.createTreeView(IssueExplorerByFile.viewID, { treeDataProvider, showCollapseAll: true });
        this.disposeList.push(
            this.treeView,
            this.uiEventFnEmitter,
            pipe(this.uiEventFnEmitter, debounce(debounceUIDelay))((fn) => fn()),
            vscode.window.onDidChangeActiveTextEditor((e) => this._emitUIEvent(() => this.onDidChangeActiveTextEditor(e))),
            vscode.window.onDidChangeActiveNotebookEditor((e) => this._emitUIEvent(() => this.onDidChangeActiveNotebookEditor(e))),
            treeDataProvider.onDidChangeTreeData((e) => this.onDidChangeTreeData(e)),
            this.treeView.onDidChangeSelection((e) => this.onDidChangeSelection(e)),
            this.treeView.onDidChangeVisibility(
                (e) => (
                    log('onDidChangeVisibility', e),
                    this._emitUIEvent(() => this.onDidChangeActiveTextEditor(vscode.window.activeTextEditor))
                ),
            ),
        );
        this.treeView.title = 'Spelling Issues';
        this.treeView.message = 'No open documents.';
    }

    private _emitUIEvent(fn: () => void) {
        this.uiEventFnEmitter.fire(fn);
    }

    private onDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined) {
        if (!editor) return;
        log('onDidChangeActiveTextEditor', editor.document.uri.toString());
        logErrors(this.adjustRevel(editor.document, editor.visibleRanges), 'onDidChangeActiveTextEditor');
    }

    private onDidChangeActiveNotebookEditor(editor: vscode.NotebookEditor | undefined, ranges?: readonly vscode.NotebookRange[]) {
        if (!editor) return;

        const notebook = editor.notebook;
        ranges ??= editor.visibleRanges;

        const activeEditors = vscode.window.visibleTextEditors;
        const editorsByDocument = groupByField(activeEditors, 'document');

        const itemsToReveal: CalcRevealResult[] = [];

        for (const range of ranges) {
            for (let cellIndex = range.start; cellIndex < range.end; cellIndex++) {
                const cell = notebook.cellAt(cellIndex);
                const editors = editorsByDocument.get(cell.document);
                if (!editors) continue;
                // const ranges = editors.flatMap((e) => e.visibleRanges);
                const items = undefined; // this.findElementsToReveal(cell.document, ranges);
                if (items) {
                    itemsToReveal.push(items);
                }
            }
        }

        if (!itemsToReveal.length) return;

        const item = itemsToReveal.reduce(
            (a, b) => {
                a.top ??= b.top;
                a.bottom = b.bottom ?? a.bottom;
                a.closest ??= b.closest;
                return a;
            },
            { ...itemsToReveal[0] },
        );
        const middles = itemsToReveal.map((i) => i.middle).filter(isDefined);
        item.middle = middles[Math.floor(middles.length / 2)];

        // return this.revealItems(item);
    }

    /** The tree data has updated */
    private onDidUpdate() {
        log('IssueExplorerByFile.onDidUpdate', vscode.window.activeTextEditor?.document.uri.toString());
        this.onDidChangeActiveTextEditor(vscode.window.activeTextEditor);
    }

    private onDidChangeTreeData(_e: OnDidChangeEventType) {
        log('onDidChangeTreeData');
        const count = this.treeDataProvider.getIssueCount();
        this.treeView.badge = count
            ? {
                  tooltip: `Issues found: ${count}`,
                  value: count,
              }
            : undefined;
    }

    private onDidChangeSelection(e: vscode.TreeViewSelectionChangeEvent<IssueTreeItemBase>) {
        log('onDidChangeSelection', e.selection.length);
        const selected = e.selection[0];
        if (selected instanceof FileIssueTreeItem) {
            log('IssueExplorerByFile.onDidChangeSelection', selected.issue.diag.message);
            // const cmd = selected.getCommand();
            // if (cmd) {
            //     vscode.commands.executeCommand(cmd.command, ...(cmd.arguments || []));
            // }
        }
    }

    private async adjustRevel(document: TextDocument, ranges: readonly Range[]) {
        if (!this.treeView.visible) return;
        const item = this.treeDataProvider.findMatchingChild(document.uri);
        if (!item) return;
        const items = item.findMatchingIssues(ranges);
        if (!items) return this.revealItems([item], true);
        return this.revealItems(items, false);
    }

    private async revealItems(items: IssueTreeItemBase[], expand: boolean) {
        log('revealItems', items.length, this.treeView.visible);
        if (!this.treeView.visible) return;
        if (!items.length) return;
        const bottom = items[items.length - 1];
        const top = items[0];
        await this.treeView.reveal(bottom, { select: false, focus: false, expand });
        await this.treeView.reveal(top, { select: false, focus: false, expand });
    }

    readonly dispose = this.disposeList.dispose;

    static viewID = 'cspell.issuesViewByFile';

    static register(issueTracker: IssueTracker) {
        return new IssueExplorerByFile(issueTracker);
    }
}

interface Context {
    issueTracker: IssueTracker;
    invalidate: (item: OnDidChangeEventType) => void;
    requestSuggestions: (item: RequestSuggestionsParam) => Promise<Suggestion[]>;
}

interface RequestSuggestionsParam {
    readonly word: string;
    readonly document: TextDocument;
}

interface ProviderOptions {
    issueTracker: IssueTracker;
    setMessage(msg: string | undefined): void;
    setDescription(des: string | undefined): void;
    /** This function is called after the children have been generated. */
    onDidUpdate(): void;
}

class IssuesTreeDataProvider implements TreeDataProvider<IssueTreeItemBase> {
    private emitOnDidChange = new vscode.EventEmitter<OnDidChangeEventType>();
    private disposeList = createDisposableList();
    private issueTracker: IssueTracker;
    private children: FileWithIssuesTreeItem[] | undefined;

    constructor(private options: ProviderOptions) {
        this.issueTracker = options.issueTracker;
        this.disposeList.push(
            this.emitOnDidChange,
            // vscode.window.onDidChangeActiveTextEditor((editor) => this.updateEditor(editor)),
            this.issueTracker.onDidChangeDiagnostics((e) => this.handleOnDidChangeDiagnostics(e)),
        );
    }

    getTreeItem(element: IssueTreeItemBase): TreeItem | Promise<TreeItem> {
        return element.getTreeItem();
    }

    getChildren(element?: IssueTreeItemBase | undefined): ProviderResult<IssueTreeItemBase[]> {
        if (element) {
            return element.getChildren();
        }
        if (this.children) return this.children;
        const context: Context = {
            issueTracker: this.issueTracker,
            invalidate: (item) => this.updateChild(item),
            requestSuggestions: (item) => this.issueTracker.getSuggestionsForIssue(item),
        };
        this.children = collectIssuesByFile(context);
        this.updateMessage(this.children.length ? undefined : 'No issues found...');
        setTimeout(() => this.options.onDidUpdate(), 10);
        return this.children;
    }

    getParent(element: IssueTreeItemBase): ProviderResult<IssueTreeItemBase>;
    getParent(element: unknown): ProviderResult<IssueTreeItemBase> {
        if (element instanceof IssueTreeItemBase) {
            return element.getParent();
        }
        return undefined;
    }

    onDidChangeTreeData = this.emitOnDidChange.event;

    private handleOnDidChangeDiagnostics(e: vscode.DiagnosticChangeEvent) {
        log(
            'IssuesTreeDataProvider.handleOnDidChangeDiagnostics',
            e.uris.map((u) => u.toString(true)),
        );
        this.updateChild();
    }

    private updateChild(e: OnDidChangeEventType = undefined) {
        if (!e) {
            this.children = undefined;
        }
        this.emitOnDidChange.fire(e);
    }

    private updateMessage(msg: string | undefined, des?: string) {
        this.options.setDescription(des);
        this.options.setMessage(msg);
        return undefined;
    }

    getIssueCount(): number {
        return this.issueTracker.getIssueCount();
    }

    findMatchingChild(uri: Uri): FileWithIssuesTreeItem | undefined {
        return this.children?.find((c) => c.document.uri.toString() === uri.toString());
    }

    readonly dispose = this.disposeList.dispose;
}

const icons = {
    warning: new vscode.ThemeIcon('warning', new vscode.ThemeColor('list.warningForeground')),
    error: new vscode.ThemeIcon('error', new vscode.ThemeColor('list.errorForeground')),
    doc: new vscode.ThemeIcon('go-to-file'),
    suggestion: new vscode.ThemeIcon('pencil'), // new vscode.ThemeIcon('lightbulb'),
    suggestionPreferred: new vscode.ThemeIcon('pencil'), // new vscode.ThemeIcon('lightbulb-autofix'),
    gear: new vscode.ThemeIcon('gear'),
} as const;

interface CalcRevealResult {
    top: IssueTreeItemBase | undefined;
    closest: IssueTreeItemBase | undefined;
    middle: IssueTreeItemBase | undefined;
    bottom: IssueTreeItemBase | undefined;
}

interface Targets {
    targets: ConfigTarget[];
}

class FileWithIssuesTreeItem extends IssueTreeItemBase {
    private children: FileIssueTreeItem[] | undefined;
    private targets: Promise<Targets> | undefined;
    constructor(
        readonly context: Context,
        readonly document: TextDocument | vscode.NotebookDocument,
        readonly issues: SpellingIssue[],
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const rel = vscode.workspace.asRelativePath(this.document.uri, true);
        const item = new TreeItem(rel);
        item.resourceUri = this.document.uri;
        item.iconPath = vscode.ThemeIcon.File;
        item.description = `${this.issues.length}`;
        const hasPreferred = this.issues.some((issue) => issue.hasPreferredSuggestions());
        item.contextValue = hasPreferred ? 'issue.FileWithIssuesTreeItem.hasPreferred' : 'issue.FileWithIssuesTreeItem';
        const activeUris = [
            vscode.window.activeTextEditor?.document.uri,
            vscode.window.activeNotebookEditor?.notebook.uri,
            ...(vscode.window.activeNotebookEditor?.notebook.getCells().map((c) => c.document.uri) || []),
        ];
        const isActive = activeUris.includes(this.document.uri);
        item.collapsibleState = this.issues.length
            ? isActive
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.Collapsed
            : undefined;
        return item;
    }

    getChildren() {
        if (this.children) return this.children;
        this.children = this.issues
            .map((issue) => new FileIssueTreeItem(this.context, this, issue, this.getTargets))
            .sort(FileIssueTreeItem.compare);
        return this.children;
    }

    getParent() {
        return undefined;
    }

    findMatchingIssues(ranges: readonly Range[] | undefined): FileIssueTreeItem[] | undefined {
        if (!ranges) return this.children;
        const found = this.children?.filter((c) => c.findMatchingIssues(ranges));
        return found?.length ? found : undefined;
    }

    getTargets = () => {
        if (this.targets) return this.targets;
        this.targets = this.context.issueTracker.getConfigurationTargets(this.document.uri).then((r) => ({ targets: r.configTargets }));
        return this.targets;
    };
}

class FileIssueTreeItem extends IssueTreeItemBase {
    private children: IssueFixTreeItem[] | undefined;
    private pChildren: Promise<IssueFixTreeItem[]> | undefined;
    readonly cell: vscode.NotebookCell | undefined;
    readonly document: TextDocument;
    readonly cellIndex: number;
    readonly range: Range;
    constructor(
        readonly context: Context,
        readonly file: FileWithIssuesTreeItem,
        readonly issue: SpellingIssue,
        readonly getTargets: (uri: Uri) => Promise<Targets>,
    ) {
        super();
        this.cell = findNotebookCellForDocument(issue.document);
        this.document = this.cell?.document ?? issue.document;
        this.cellIndex = this.cell ? this.cell.index : -1;
        this.range = issue.range;
    }

    getTreeItem(): TreeItem {
        const issue = this.issue;
        const item = new TreeItem(issue.diag.message);
        const range = issue.range;
        item.id = [issue.uri.toString(), range.start.line, range.start.character, range.end.line, range.end.character].join(':');
        const location = `${this.cellIndex >= 0 ? `Cell ${this.cellIndex + 1}, ` : ''}Ln ${this.range.start.line + 1}, Col ${
            this.range.start.character + 1
        }`;
        const fixWith = this.issue.getPreferredSuggestions();
        const fixDesc = fixWith ? ` (fix with: ${fixWith.join(', ')})` : '';
        item.description = location + fixDesc;
        const isFlagged = !!this.issue.diag.data?.isFlagged;
        item.contextValue = 'issue.FileIssueTreeItem' + (isFlagged ? '.flagged' : '');
        item.collapsibleState =
            !this.children || this.children.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        item.iconPath = isFlagged ? icons.error : icons.warning;
        item.tooltip = this.tooltip();
        item.command = this.getCommand();
        return item;
    }

    getCommand(): vscode.Command | undefined {
        return {
            title: 'Goto Issue',
            command: 'vscode.open',
            arguments: [this.issue.document.uri, { selection: this.range, preserveFocus: true }],
        };
    }

    getChildren() {
        if (this.children) return this.children;
        this.pChildren ??= this.#getChildren();
    }

    async #getChildren() {
        if (this.children) return this.children;
        const suggestions = await this.context.requestSuggestions(this.issue);
        const targets = await this.getTargets(this.issue.uri);
        const items = (this.children = [
            ...suggestions.map((sug) => new IssueSuggestionTreeItem(this, this.issue, sug)),
            ...targets.targets.map((t) => new IssueAddToTargetTreeItem(this, this.issue, t)),
        ]);

        this.pChildren = undefined;
        this.context.invalidate(this);
        return items;
    }

    getParent() {
        return this.file;
    }

    findMatchingIssues(ranges: readonly Range[] | undefined): [this] | undefined {
        if (!ranges) return [this];
        for (const range of ranges) {
            if (range.contains(this.range)) return [this];
        }
    }

    tooltip(): vscode.MarkdownString | undefined {
        return undefined;
        // const md = new vscode.MarkdownString();
        // md.appendMarkdown(`Unknown word: **\`${cleanWord(this.issue.word)}\`**`);
        // return md;
    }

    static compare(a: FileIssueTreeItem, b: FileIssueTreeItem) {
        const cellComp = a.cellIndex - b.cellIndex;
        if (cellComp) return cellComp;
        const lineComp = a.range.start.line - b.range.start.line;
        if (lineComp) return lineComp;
        return a.range.start.character - b.range.start.character;
    }
}

type IssueFixTreeItem = IssueSuggestionTreeItem | IssueAddToTargetTreeItem;

class IssueSuggestionTreeItem extends IssueTreeItemBase {
    constructor(
        readonly parent: FileIssueTreeItem,
        readonly issue: SpellingIssue,
        readonly suggestion: Suggestion,
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const issue = this.issue;
        const { word, isPreferred } = this.suggestion;
        const item = new TreeItem(word);
        item.id = calcItemId(issue.uri, issue.range, word);
        item.iconPath = isPreferred ? icons.suggestionPreferred : icons.suggestion;
        item.description = isPreferred && '(preferred)';
        const inlineWord = markdownInlineCode(word);
        const cleanedWord = cleanWord(word);
        const fixMessage = 'Replace Issue with: ' + cleanedWord;
        item.command = {
            title: fixMessage,
            command: knownCommands['cSpell.fixSpellingIssue'],
            arguments: [this.issue.uri, this.issue.word, word, [this.issue.range]],
        };
        item.tooltip = new vscode.MarkdownString().appendMarkdown(`Fix Issue with: ${inlineWord}`);
        item.accessibilityInformation = { label: fixMessage };
        item.contextValue = isPreferred ? 'issue.suggestion-preferred' : 'issue.suggestion';
        return item;
    }

    getChildren() {
        return undefined;
    }

    getParent(): IssueTreeItemBase | undefined {
        return this.parent;
    }

    isPreferred(): boolean {
        return this.suggestion.isPreferred || false;
    }
}

class IssueAddToTargetTreeItem extends IssueTreeItemBase {
    constructor(
        readonly parent: FileIssueTreeItem,
        readonly issue: SpellingIssue,
        readonly target: ConfigTarget,
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const issue = this.issue;
        const item = new TreeItem('Add to ' + this.target.name);
        item.id = calcItemId(issue.uri, issue.range, this.target.name);
        item.iconPath = icons.gear;
        item.description = '';
        const inlineWord = markdownInlineCode(issue.word);
        const tType = this.target.kind === 'dictionary' ? 'dictionary' : 'configuration';
        const fixMessage = `Add ${inlineWord} to ${this.target.name} ${tType}.`;
        item.tooltip = new vscode.MarkdownString().appendMarkdown(fixMessage);
        item.accessibilityInformation = { label: fixMessage };
        item.command = { title: fixMessage, command: 'cSpell.issuesViewByFile.item.addWordToTarget', arguments: [this] };
        // item.contextValue = isPreferred ? 'issue.suggestion-preferred' : 'issue.suggestion';
        return item;
    }

    getChildren() {
        return undefined;
    }

    getParent(): IssueTreeItemBase | undefined {
        return this.parent;
    }

    isPreferred(): boolean {
        return false;
    }

    applyFix() {
        return handleErrors(
            di.get('dictionaryHelper').addWordsToTargetServerConfigTarget(this.issue.word, this.target, this.issue.document.uri),
            'addWordsToConfig',
        );
    }
}

interface FileIssue {
    uri: Uri;
    doc: TextDocument | undefined;
    issues: SpellingCheckerIssue[];
}

type SpellingIssue = SpellingCheckerIssue;

function collectIssuesByFile(context: Context): FileWithIssuesTreeItem[] {
    const fileIssues: FileIssue[] = context.issueTracker
        .getIssues()
        .map(([uri, issues]) => ({ uri, doc: findTextDocument(uri), issues: issues.getSpellingIssues() }));
    const groupedByFile = groupIssues(fileIssues);

    const comp = new Intl.Collator().compare;

    const sorted = [...groupedByFile]
        .filter(([_, issues]) => issues.length)
        .map(([doc, issues]) => new FileWithIssuesTreeItem(context, doc, issues))
        .sort((a, b) => comp(a.document.uri.toString(true), b.document.uri.toString(true)));

    return sorted;

    function groupIssues(fileIssues: FileIssue[]): Map<TextDocument | vscode.NotebookDocument, SpellingIssue[]> {
        const groupedByFile = new Map<TextDocument | vscode.NotebookDocument, SpellingIssue[]>();

        for (const fileIssue of fileIssues) {
            groupIssue(fileIssue);
        }

        return groupedByFile;

        function groupIssue(fileIssue: FileIssue) {
            if (!fileIssue.doc) return;
            const doc = fileIssue.doc;
            const parent = findConicalDocument(doc);
            const spellingIssues = groupedByFile.get(parent) || [];
            spellingIssues.push(...fileIssue.issues);
            groupedByFile.set(parent, spellingIssues);
        }
    }
}

function handleAutoFixSpellingIssues(item?: unknown) {
    if (!(item instanceof FileWithIssuesTreeItem)) return;
    return actionAutoFixSpellingIssues(item.document.uri);
}

function handleAddWordToDictionary(item?: unknown) {
    if (!(item instanceof FileIssueTreeItem)) return;

    const doc = item.document;
    return commandHandlers['cSpell.addWordToDictionary'](item.issue.word, doc.uri);
}

function handleAddWordToTarget(item?: unknown) {
    if (!(item instanceof IssueAddToTargetTreeItem)) return;

    log('handleAddWordToTarget %o', { word: item.issue.word, target: item.target });
    return item.applyFix();
}

function calcItemId(uri: Uri, range: Range, ...parts: string[]) {
    return [uri.toString(), range.start.line, range.start.character, range.end.line, range.end.character, ...parts].join(':');
}
