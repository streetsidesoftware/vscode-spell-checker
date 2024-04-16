import { groupByField, logDebug } from '@internal/common-utils';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, ExtensionContext, ProviderResult, Range, TextDocument, TreeDataProvider, Uri } from 'vscode';
import * as vscode from 'vscode';
import { TreeItem } from 'vscode';

import { actionAutoFixSpellingIssues } from '../applyCorrections.mjs';
import { commandHandlers, knownCommands } from '../commands.mjs';
import type { IssueTracker, SpellingCheckerIssue } from '../issueTracker.mjs';
import { createEmitter, debounce, rx } from '../Subscribables/index.js';
import { isDefined } from '../util/index.js';
import { findConicalDocument, findNotebookCellForDocument } from '../util/documentUri.js';
import { logErrors } from '../util/errors.js';
import { findTextDocument } from '../util/findEditor.js';
import { IssueTreeItemBase } from './IssueTreeItemBase.js';

const log = logDebug;

const debounceRevealDelay = 100;
const debounceUIDelay = 500;
const viewItemSpan = 5;

export function activate(context: ExtensionContext, issueTracker: IssueTracker) {
    context.subscriptions.push(IssueExplorerByFile.register(issueTracker));
    context.subscriptions.push(
        // vscode.commands.registerCommand(
        //     knownCommands['cSpell.issuesViewByFile.item.openSuggestionsForIssue'],
        //     handleOpenSuggestionsForIssue,
        // ),
        vscode.commands.registerCommand(knownCommands['cSpell.issuesViewByFile.item.autoFixSpellingIssues'], handleAutoFixSpellingIssues),
        vscode.commands.registerCommand(knownCommands['cSpell.issuesViewByFile.item.addWordToDictionary'], handleAddWordToDictionary),
    );
}

type OnDidChangeEventType = IssueTreeItemBase | undefined;

class IssueExplorerByFile {
    private disposeList = createDisposableList();
    private treeView: vscode.TreeView<IssueTreeItemBase>;
    private treeDataProvider: IssuesTreeDataProvider;
    private pendingReveal: Promise<void> | undefined;
    private revealEmitter = createEmitter<CalcRevealResult>();
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
            this.revealEmitter,
            this.uiEventFnEmitter,
            rx(this.revealEmitter, debounce(debounceRevealDelay)).subscribe((calc) => this._handleReveal(calc)),
            rx(this.uiEventFnEmitter, debounce(debounceUIDelay)).subscribe((fn) => fn()),
            vscode.window.onDidChangeActiveTextEditor((e) => this._emitUIEvent(() => this.onDidChangeActiveTextEditor(e))),
            vscode.window.onDidChangeActiveNotebookEditor((e) => this._emitUIEvent(() => this.onDidChangeActiveNotebookEditor(e))),
            // vscode.window.onDidChangeTextEditorVisibleRanges((e) =>
            //     this._emitUIEvent(() => this.adjustRevel(e.textEditor.document, e.visibleRanges)),
            // ),
            // vscode.window.onDidChangeNotebookEditorVisibleRanges((e) =>
            //     this._emitUIEvent(() => this.onDidChangeActiveNotebookEditor(e.notebookEditor, e.visibleRanges)),
            // ),
            // vscode.window.onDidChangeTextEditorSelection((e) => this._emitUIEvent(() => this.onDidChangeActiveTextEditor(e.textEditor))),
            treeDataProvider.onDidChangeTreeData((e) => this.onDidChangeTreeData(e)),
            this.treeView.onDidChangeSelection((e) => this.onDidChangeSelection(e)),
        );
        this.treeView.title = 'Spelling Issues';
        this.treeView.message = 'No open documents.';
    }

    private _emitUIEvent(fn: () => void) {
        this.uiEventFnEmitter.notify(fn);
    }

    private onDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined) {
        if (!editor) return;
        this.adjustRevel(editor.document, editor.visibleRanges);
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
                const ranges = editors.flatMap((e) => e.visibleRanges);
                const items = this.findElementsToReveal(cell.document, ranges);
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

        return this.revealItems(item);
    }

    private findElementsToReveal(document: TextDocument, ranges: readonly Range[] | undefined): CalcRevealResult | undefined {
        if (!this.treeView.visible) return;
        const point = vscode.window.activeTextEditor?.document === document ? vscode.window.activeTextEditor?.selection.active : undefined;
        // Make sure the point is in the visible ranges.
        const found = (point && (ranges?.some((range) => range.contains(point)) ?? true)) || undefined;
        return this.treeDataProvider.calculateReveal(document, ranges, found && point);
    }

    private revealItems(calc: CalcRevealResult | undefined) {
        if (!calc) return;
        this.revealEmitter.notify(calc);
    }

    private _handleReveal(calc: CalcRevealResult) {
        if (this.pendingReveal) {
            // It seems to have take a long time to reveal the items.
            log('IssueExplorerByFile.handleReveal: pending reveal');
            // We could re-queue the reveal, but for now, we will just ignore it.
            // this.revealEmitter.notify(calc);
            return;
        }

        logErrors(
            (this.pendingReveal = this._reveal(calc).finally(() => (this.pendingReveal = undefined))),
            'IssueExplorerByFile.handleReveal',
        );
    }

    /**
     * Try to show all the elements in the view.
     * First scroll to the end, then scroll to the start.
     * This is to ensure that the start is visible.
     * Note: VSCode does not offer a way to scroll to the start / end / or middle.
     */
    private async _reveal(calc: CalcRevealResult) {
        log('IssueExplorerByFile._reveal');
        const { top, closest, middle, bottom } = calc;
        const reveals: PromiseLike<void>[] = [];

        if (bottom && bottom !== top) {
            reveals.push(this.treeView.reveal(bottom, { select: false, focus: false, expand: true }));
        }
        top && reveals.push(this.treeView.reveal(top, { select: false, focus: false, expand: true }));
        !closest && middle && reveals.push(this.treeView.reveal(middle, { select: false, focus: false, expand: true }));
        closest && reveals.push(this.treeView.reveal(closest, { select: false, focus: false, expand: true }));
        for (const reveal of reveals) {
            // We need to wait for each one or the reveal will not work.
            await reveal;
        }
        log('IssueExplorerByFile._reveal done');
    }

    private adjustRevel(document: TextDocument, ranges: readonly Range[]) {
        const toReveal = this.findElementsToReveal(document, ranges);
        this.revealItems(toReveal);
    }

    /** The tree data has updated */
    private onDidUpdate() {
        log('IssueExplorerByFile.onDidUpdate', vscode.window.activeTextEditor?.document.uri.toString());
        this.onDidChangeActiveTextEditor(vscode.window.activeTextEditor);
    }

    private onDidChangeTreeData(_e: OnDidChangeEventType) {
        const count = this.treeDataProvider.getIssueCount();
        this.treeView.badge = count
            ? {
                  tooltip: `Issues found: ${count}`,
                  value: count,
              }
            : undefined;
    }

    private onDidChangeSelection(e: vscode.TreeViewSelectionChangeEvent<IssueTreeItemBase>) {
        const selected = e.selection[0];
        if (selected instanceof FileIssueTreeItem) {
            log('IssueExplorerByFile.onDidChangeSelection', selected.issue.diag.message);
            // const cmd = selected.getCommand();
            // if (cmd) {
            //     vscode.commands.executeCommand(cmd.command, ...(cmd.arguments || []));
            // }
        }
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
}

interface ProviderOptions {
    issueTracker: IssueTracker;
    setMessage(msg: string | undefined): void;
    setDescription(des: string | undefined): void;
    /** This function is called after the children have been generated. */
    onDidUpdate(): void;
}

class IssuesTreeDataProvider implements TreeDataProvider<IssueTreeItemBase> {
    private emitOnDidChange = createEmitter<OnDidChangeEventType>();
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

    onDidChangeTreeData(listener: (e: OnDidChangeEventType) => void, thisArg?: unknown, disposables?: Disposable[]): Disposable {
        const fn = thisArg ? listener.bind(thisArg) : listener;
        const d = this.emitOnDidChange.subscribe((e) => fn(e));
        if (disposables) {
            disposables.push(d);
        }
        return d;
    }

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
        this.emitOnDidChange.notify(e);
    }

    private updateMessage(msg: string | undefined, des?: string) {
        this.options.setDescription(des);
        this.options.setMessage(msg);
        return undefined;
    }

    // private hasPreferred(): boolean {
    //     for (const group of this.suggestions.values()) {
    //         return !!(group[0]?.isPreferred && !group[1].isPreferred);
    //     }
    //     return false;
    // }

    // private updateVSCodeContext() {
    //     const context = this.hasPreferred() ? { hasPreferred: true } : {};
    //     logErrors(vscode.commands.executeCommand('setContext', 'cspell-info.issueViewer', context), 'updateVSCodeContext');
    // }

    calculateReveal(
        document: TextDocument,
        ranges: readonly Range[] | undefined,
        position: vscode.Position | undefined,
    ): CalcRevealResult | undefined {
        if (!this.children) return undefined;
        for (const child of this.children) {
            const calc = child.calculateReveal(document, ranges, position);
            // Each document can be in the list exactly once.
            if (calc) return calc;
        }
        return undefined;
    }

    getIssueCount(): number {
        return this.issueTracker.getIssueCount();
    }

    readonly dispose = this.disposeList.dispose;
}

const icons = {
    warning: new vscode.ThemeIcon('warning', new vscode.ThemeColor('list.warningForeground')),
    error: new vscode.ThemeIcon('error', new vscode.ThemeColor('list.errorForeground')),
    doc: new vscode.ThemeIcon('go-to-file'),
    suggestion: new vscode.ThemeIcon('pencil'), // new vscode.ThemeIcon('lightbulb'),
    suggestionPreferred: new vscode.ThemeIcon('pencil'), // new vscode.ThemeIcon('lightbulb-autofix'),
} as const;

interface CalcRevealResult {
    top: IssueTreeItemBase | undefined;
    closest: IssueTreeItemBase | undefined;
    middle: IssueTreeItemBase | undefined;
    bottom: IssueTreeItemBase | undefined;
}

class FileWithIssuesTreeItem extends IssueTreeItemBase {
    private children: FileIssueTreeItem[] | undefined;
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
        item.collapsibleState = this.issues.length ? vscode.TreeItemCollapsibleState.Expanded : undefined;
        return item;
    }

    getChildren() {
        if (this.children) return this.children;
        this.children = this.issues.map((issue) => new FileIssueTreeItem(this.context, this, issue)).sort(FileIssueTreeItem.compare);
        return this.children;
    }

    getParent() {
        return undefined;
    }

    calculateReveal(
        document: TextDocument,
        ranges: readonly Range[] | undefined,
        position: vscode.Position | undefined,
    ): CalcRevealResult | undefined {
        const conical = findConicalDocument(document);
        if (conical !== this.document) return undefined;
        if (!this.children) return undefined;
        const matchingChildren = this.children.filter((child) => child.document === document);
        if (!matchingChildren.length) return undefined;
        const issuesInRange = ranges
            ? matchingChildren.filter((child) => ranges.some((range) => range.contains(child.range)))
            : matchingChildren;
        const middle = issuesInRange[Math.floor(issuesInRange.length / 2)];

        const indexMiddle = matchingChildren.findIndex((child) => child === middle);

        let top = matchingChildren[0];
        let bottom = matchingChildren[matchingChildren.length - 1];

        if (indexMiddle >= 0) {
            top = matchingChildren[Math.max(0, indexMiddle - viewItemSpan)];
            bottom = matchingChildren[Math.min(matchingChildren.length - 1, indexMiddle + viewItemSpan)];
        }

        const r: CalcRevealResult = { top, middle, closest: undefined, bottom };
        if (!position) {
            return r;
        }
        r.closest = findClosest(matchingChildren, position);

        if (r.closest) {
            const indexClosest = matchingChildren.findIndex((child) => child === r.closest);
            if (indexClosest >= 0) {
                r.top = matchingChildren[Math.max(0, indexClosest - viewItemSpan)];
                r.bottom = matchingChildren[Math.min(matchingChildren.length - 1, indexClosest + viewItemSpan)];
            }
        }

        return r;
    }
}

class FileIssueTreeItem extends IssueTreeItemBase {
    readonly cell: vscode.NotebookCell | undefined;
    readonly document: TextDocument;
    readonly cellIndex: number;
    readonly range: Range;
    constructor(
        readonly context: Context,
        readonly file: FileWithIssuesTreeItem,
        readonly issue: SpellingIssue,
    ) {
        super();
        this.cell = findNotebookCellForDocument(issue.document);
        this.document = this.cell?.document ?? issue.document;
        this.cellIndex = this.cell ? this.cell.index : -1;
        this.range = issue.range;
    }

    async getTreeItem(): Promise<TreeItem> {
        const item = new TreeItem(this.issue.diag.message);
        const location = `${this.cellIndex >= 0 ? `Cell ${this.cellIndex + 1}, ` : ''}Ln ${this.range.start.line + 1}, Col ${
            this.range.start.character + 1
        }`;
        const fixWith = this.issue.getPreferredSuggestions();
        const fixDesc = fixWith ? ` (fix with: ${fixWith.join(', ')})` : '';
        item.description = location + fixDesc;
        const isFlagged = !!this.issue.diag.data?.isFlagged;
        item.contextValue = 'issue.FileIssueTreeItem' + (isFlagged ? '.flagged' : '');
        item.iconPath = isFlagged ? icons.error : icons.warning;
        item.tooltip = await this.tooltip();
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
        return undefined;
    }

    getParent() {
        return this.file;
    }

    findMatchingIssues(document: TextDocument, ranges: readonly Range[] | undefined): [this] | undefined {
        if (this.document.uri.toString() !== document.uri.toString()) return undefined;
        if (!ranges) return [this];
        for (const range of ranges) {
            if (range.contains(this.range)) return [this];
        }
    }

    async tooltip(): Promise<vscode.MarkdownString | undefined> {
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

interface FileIssue {
    uri: Uri;
    doc: TextDocument | undefined;
    issues: SpellingCheckerIssue[];
}

type SpellingIssue = SpellingCheckerIssue;

function collectIssuesByFile(context: Context): FileWithIssuesTreeItem[] {
    const fileIssues: FileIssue[] = context.issueTracker.getIssues().map(([uri, issues]) => ({ uri, doc: findTextDocument(uri), issues }));
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

/**
 * Try to convert the position into a single number.
 * The whole number is the line, the fraction is the character.
 * @param p - Position
 * @returns number that can be compared to other positions.
 */
function ph(p: vscode.Position, avgMaxLineLength = 100): number {
    // 100 is used to slow down the convergence to 1.
    return p.line + Math.tanh(p.character / avgMaxLineLength);
}

function phRange(range: vscode.Range): number {
    return (ph(range.start) + ph(range.end)) / 2;
}

function findClosest(items: FileIssueTreeItem[], position: vscode.Position): FileIssueTreeItem | undefined {
    if (!items.length) return undefined;
    const p = ph(position);

    let closest = items[0];
    const cDist = phRange(closest.range) - p;
    let cDist2 = cDist * cDist;
    for (let i = 1; i < items.length; i++) {
        const item = items[i];
        const dist = phRange(item.range) - p;
        const dist2 = dist * dist;

        if (dist2 < cDist2) {
            closest = item;
            cDist2 = dist2;
        }
    }
    return closest;
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
