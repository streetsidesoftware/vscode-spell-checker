import { groupByField } from '@internal/common-utils';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, ExtensionContext, ProviderResult, Range, TextDocument, TreeDataProvider, Uri } from 'vscode';
import * as vscode from 'vscode';
import { TreeItem } from 'vscode';

import type { CSpellClient } from '../client';
import { knownCommands } from '../commands';
import type { IssueTracker, SpellingDiagnostic } from '../issueTracker';
import { createEmitter } from '../Subscribables';
import { isDefined } from '../util';
import { findConicalDocument, findNotebookCellForDocument } from '../util/documentUri';
import { logErrors } from '../util/errors';
import { findTextDocument } from '../util/findEditor';

export function activate(context: ExtensionContext, issueTracker: IssueTracker, client: CSpellClient) {
    context.subscriptions.push(IssueExplorerByFile.register(issueTracker, client));
    context.subscriptions
        .push
        // vscode.commands.registerCommand(
        //     knownCommands['cSpell.issuesViewByFile.item.openSuggestionsForIssue'],
        //     handleOpenSuggestionsForIssue,
        // ),
        // vscode.commands.registerCommand(knownCommands['cSpell.issuesViewByFile.item.autoFixSpellingIssues'], handleAutoFixSpellingIssues),
        // vscode.commands.registerCommand(knownCommands['cSpell.issuesViewByFile.item.addWordToDictionary'], handleAddWordToDictionary),
        ();
}

type OnDidChangeEventType = IssueTreeItemBase | undefined;

class IssueExplorerByFile {
    private disposeList = createDisposableList();
    private treeView: vscode.TreeView<IssueTreeItemBase>;
    private treeDataProvider: IssuesTreeDataProvider;

    constructor(issueTracker: IssueTracker, client: CSpellClient) {
        const treeDataProvider = new IssuesTreeDataProvider({
            issueTracker,
            client,
            setDescription: (des) => {
                this.treeView.description = des;
            },
            setMessage: (msg) => {
                this.treeView.message = msg;
            },
        });
        this.treeDataProvider = treeDataProvider;
        this.treeView = vscode.window.createTreeView(IssueExplorerByFile.viewID, { treeDataProvider, showCollapseAll: true });
        this.disposeList.push(
            this.treeView,
            vscode.window.onDidChangeActiveTextEditor((e) => this.onDidChangeActiveTextEditor(e)),
            vscode.window.onDidChangeActiveNotebookEditor((e) => this.onDidChangeActiveNotebookEditor(e)),
            // vscode.window.onDidChangeTextEditorVisibleRanges((e) => this.adjustRevel(e.textEditor.document, e.visibleRanges)),
            vscode.window.onDidChangeNotebookEditorVisibleRanges((e) =>
                this.onDidChangeActiveNotebookEditor(e.notebookEditor, e.visibleRanges),
            ),
        );
        this.treeView.title = 'Spelling Issues';
        this.treeView.message = 'No open documents.';
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

        const itemsToReveal: IssueTreeItemBase[] = [];

        for (const range of ranges) {
            for (let cellIndex = range.start; cellIndex < range.end; cellIndex++) {
                const cell = notebook.cellAt(cellIndex);
                const editors = editorsByDocument.get(cell.document);
                if (!editors) continue;
                const ranges = editors.flatMap((e) => e.visibleRanges);
                const items = this.findElementsToReveal(cell.document, ranges);
                if (items?.length) {
                    itemsToReveal.push(...items);
                }
            }
        }

        return this.revealItems(itemsToReveal);
    }

    private findElementsToReveal(document: TextDocument, ranges: readonly Range[]): IssueTreeItemBase[] | undefined {
        if (!this.treeView.visible) return;
        // if (!_ranges.length) return;
        return this.treeDataProvider.findMatchingItems(document, ranges);
    }

    private revealItems(items: IssueTreeItemBase[] | undefined) {
        if (!items?.length) return;

        const start = items[0];
        const end = items[items.length - 1];

        /**
         * Try to show all the elements in the view.
         * First scroll to the end, then scroll to the start.
         * This is to ensure that the start is visible.
         */
        const reveal = async () => {
            if (end !== start) {
                await this.treeView.reveal(end, { select: false, focus: false, expand: true });
            }
            await this.treeView.reveal(start, { select: true, focus: false, expand: true });
        };

        return logErrors(reveal(), 'IssueExplorerByFile.revealItem');
    }

    private adjustRevel(document: TextDocument, ranges: readonly Range[]) {
        return this.revealItems(this.findElementsToReveal(document, ranges));
    }

    readonly dispose = this.disposeList.dispose;

    static viewID = 'cspell.issuesViewByFile';

    static register(issueTracker: IssueTracker, client: CSpellClient) {
        return new IssueExplorerByFile(issueTracker, client);
    }
}

interface Context {
    client: CSpellClient;
    issueTracker: IssueTracker;
    invalidate: (item: OnDidChangeEventType) => void;
}

interface ProviderOptions {
    issueTracker: IssueTracker;
    client: CSpellClient;
    setMessage(msg: string | undefined): void;
    setDescription(des: string | undefined): void;
}

class IssuesTreeDataProvider implements TreeDataProvider<IssueTreeItemBase> {
    private emitOnDidChange = createEmitter<OnDidChangeEventType>();
    private disposeList = createDisposableList();
    private issueTracker: IssueTracker;
    private client: CSpellClient;
    private children: IssueTreeItemBase[] | undefined;

    constructor(private options: ProviderOptions) {
        this.issueTracker = options.issueTracker;
        this.client = options.client;
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
            client: this.client,
            invalidate: (item) => this.updateChild(item),
        };
        this.children = collectIssuesByFile(context);
        this.updateMessage(this.children.length ? undefined : 'No issues found...');
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

    private handleOnDidChangeDiagnostics(_e: vscode.DiagnosticChangeEvent) {
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

    findMatchingItems(document: TextDocument, ranges: readonly Range[]): IssueTreeItemBase[] | undefined {
        if (!this.children) return undefined;
        for (const child of this.children) {
            const item = child.findMatchingIssues(document, ranges);
            if (item) return item;
        }
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

abstract class IssueTreeItemBase {
    abstract getTreeItem(): TreeItem | Promise<TreeItem>;
    abstract getChildren(): ProviderResult<IssueTreeItemBase[]>;
    abstract getParent(): ProviderResult<IssueTreeItemBase>;
    abstract findMatchingIssues(document: TextDocument, ranges: readonly Range[]): IssueTreeItemBase[] | undefined;
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
        item.contextValue = 'issue.FileWithIssuesTreeItem';
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

    findMatchingIssues(document: TextDocument, ranges: readonly Range[]): IssueTreeItemBase[] | undefined {
        const conical = findConicalDocument(document);
        if (conical !== this.document) return undefined;
        if (!this.children) return undefined;
        const matches = this.children.flatMap((child) => child.findMatchingIssues(document, ranges)).filter(isDefined);
        return matches.length ? matches : undefined;
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
        this.cell = findNotebookCellForDocument(issue.doc);
        this.document = this.cell?.document ?? issue.doc;
        this.cellIndex = this.cell ? this.cell.index : -1;
        this.range = issue.range;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(this.issue.diag.message);
        const location = `${this.cellIndex >= 0 ? `Cell ${this.cellIndex + 1}, ` : ''}Ln ${this.range.start.line + 1}, Col ${
            this.range.start.character + 1
        }`;
        item.description = location;
        item.contextValue = 'issue.FileIssueTreeItem';
        const isFlagged = !!this.issue.diag.data?.isFlagged;
        item.iconPath = isFlagged ? icons.error : icons.warning;
        item.command = {
            title: 'Goto Issue',
            command: knownCommands['cSpell.selectRange'],
            arguments: [this.issue.doc.uri, this.range, true],
        };
        return item;
    }

    getChildren() {
        return undefined;
    }

    getParent() {
        return this.file;
    }

    findMatchingIssues(document: TextDocument, ranges: readonly Range[]): [this] | undefined {
        if (this.document.uri.toString() !== document.uri.toString()) return undefined;
        for (const range of ranges) {
            if (range.contains(this.range)) return [this];
        }
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
    diags: SpellingDiagnostic[];
}

interface SpellingIssue {
    word: string;
    doc: TextDocument;
    diag: SpellingDiagnostic;
    range: Range;
}

function collectIssuesByFile(context: Context): FileWithIssuesTreeItem[] {
    const fileIssues: FileIssue[] = context.issueTracker
        .getDiagnostics()
        .map(([uri, diags]) => ({ uri, doc: findTextDocument(uri), diags }));
    const groupedByFile = groupIssues(fileIssues);

    const comp = new Intl.Collator().compare;

    const sorted = [...groupedByFile]
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

            fileIssue.diags.forEach((diag) => {
                const word = doc.getText(diag.range);
                spellingIssues.push({ word, doc, diag, range: diag.range });
            });

            groupedByFile.set(parent, spellingIssues);
        }
    }
}
