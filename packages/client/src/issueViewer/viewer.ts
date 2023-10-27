import { createDisposableList } from 'utils-disposables';
import type { Disposable, ExtensionContext, ProviderResult, Range, TextDocument, TreeDataProvider } from 'vscode';
import { TreeItem } from 'vscode';
import * as vscode from 'vscode';

import { actionSuggestSpellingCorrections } from '../codeActions/actionSuggestSpellingCorrections';
import { knownCommands } from '../commands';
import type { IssueTracker, SpellingDiagnostic } from '../issueTracker';
import { createEmitter } from '../Subscribables';

export function activate(context: ExtensionContext, issueTracker: IssueTracker) {
    context.subscriptions.push(IssuesTreeDataProvider.register(issueTracker));
    context.subscriptions.push(
        vscode.commands.registerCommand(knownCommands['cSpell.openSuggestionsForIssue'], handleOpenSuggestionsForIssue),
    );
}

type OnDidChangeEventType = IssueTreeItemBase | undefined;

class IssuesTreeDataProvider implements TreeDataProvider<IssueTreeItemBase> {
    private emitOnDidChange = createEmitter<OnDidChangeEventType>();
    private disposeList = createDisposableList();
    private currentEditor: vscode.TextEditor | undefined = undefined;

    constructor(private issueTracker: IssueTracker) {
        this.disposeList.push(
            this.emitOnDidChange,
            vscode.window.onDidChangeActiveTextEditor((editor) => {
                if (editor === this.currentEditor) return;
                this.currentEditor = editor;
                this.emitOnDidChange.notify(undefined);
            }),
            issueTracker.onDidChangeDiagnostics((e) => {
                const activeTextEditor = vscode.window.activeTextEditor;
                if (activeTextEditor && activeTextEditor !== this.currentEditor) {
                    this.currentEditor = activeTextEditor;
                    this.emitOnDidChange.notify(undefined);
                    return;
                }
                const current = this.currentEditor?.document.uri.toString();
                if (!current) return;
                const matching = e.uris.filter((u) => u.toString() === current);
                if (matching.length) {
                    this.emitOnDidChange.notify(undefined);
                }
            }),
        );
    }

    getTreeItem(element: IssueTreeItemBase): TreeItem | Promise<TreeItem> {
        return element.getTreeItem();
    }

    getChildren(element?: IssueTreeItemBase | undefined): ProviderResult<IssueTreeItemBase[]> {
        if (element) return element.getChildren();
        const editor = vscode.window.activeTextEditor;
        if (!editor) return [];
        return collectIssues(this.issueTracker, editor.document);
    }

    onDidChangeTreeData(listener: (e: OnDidChangeEventType) => void, thisArg?: unknown, disposables?: Disposable[]): Disposable {
        const fn = thisArg ? listener.bind(thisArg) : listener;
        const d = this.emitOnDidChange.subscribe((e) => fn(e));
        if (disposables) {
            disposables.push(d);
        }
        return d;
    }

    readonly dispose = this.disposeList.dispose;

    static register(issueTracker: IssueTracker, name = 'cspell-info.issuesView') {
        const provider = new IssuesTreeDataProvider(issueTracker);
        const disposeList = createDisposableList(
            [provider, vscode.window.registerTreeDataProvider(name, provider)],
            'IssuesTreeDataProvider.register',
        );
        return disposeList;
    }
}

const icons = {
    warning: new vscode.ThemeIcon('warning', new vscode.ThemeColor('list.warningForeground')),
    error: new vscode.ThemeIcon('error', new vscode.ThemeColor('list.errorForeground')),
} as const;

abstract class IssueTreeItemBase {
    abstract getTreeItem(): TreeItem | Promise<TreeItem>;
    abstract getChildren(): ProviderResult<IssueTreeItemBase[]>;
}

class IssueTreeItem extends IssueTreeItemBase {
    constructor(
        readonly uri: vscode.Uri,
        readonly word: string,
        readonly diags: SpellingDiagnostic[] = [],
    ) {
        super();
    }

    addIssue(issue: SpellingDiagnostic) {
        this.diags.push(issue);
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(this.word);
        item.iconPath = this.diags[0]?.data?.isFlagged ? icons.error : icons.warning;
        item.description = this.diags.length.toString();
        if (this.diags.length === 1) {
            item.command = {
                title: 'Goto Issue',
                command: knownCommands['cSpell.selectRange'],
                arguments: [this.uri, this.diags[0].range],
            };
        }
        item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        return item;
    }

    getChildren() {
        return this.diags.map((d) => new IssueInstanceTreeItem(this.uri, this.word, d));
    }

    getRange(): Range | undefined {
        return this.diags[0]?.range;
    }
}

class IssueInstanceTreeItem extends IssueTreeItemBase {
    constructor(
        readonly uri: vscode.Uri,
        readonly word: string,
        readonly diag: SpellingDiagnostic,
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const range = this.diag.range;
        const item = new TreeItem(`${range.start.line}:${range.start.character}`);
        // item.iconPath = icons.warning;
        item.description = this.word;
        item.command = {
            title: 'Goto Issue',
            command: knownCommands['cSpell.selectRange'],
            arguments: [this.uri, this.diag.range],
        };
        return item;
    }

    getChildren() {
        return undefined;
    }

    getRange(): Range {
        return this.diag.range;
    }
}

function collectIssues(issueTracker: IssueTracker, doc: TextDocument): IssueTreeItem[] {
    const issues = issueTracker.getDiagnostics(doc.uri);
    const groupedByWord = new Map<string, IssueTreeItem>();
    const getGroup = getResolve(groupedByWord, (word) => new IssueTreeItem(doc.uri, word));
    issues.forEach(groupIssue);

    const comp = new Intl.Collator().compare;

    const sorted = [...groupedByWord.values()].sort((a, b) => comp(a.word, b.word));

    return sorted;

    function getWord(issue: SpellingDiagnostic): string {
        return doc.getText(issue.range);
    }

    function groupIssue(issue: SpellingDiagnostic) {
        const word = getWord(issue);
        getGroup(word).addIssue(issue);
    }
}

function getResolve<K, V>(map: Map<K, V>, resolver: (k: K) => V): (k: K) => V {
    return (k: K) => {
        const v = map.get(k);
        if (v !== undefined) return v;
        const vv = resolver(k);
        map.set(k, vv);
        return vv;
    };
}

function handleOpenSuggestionsForIssue(item?: IssueTreeItem | IssueInstanceTreeItem) {
    if (!item || !(item instanceof IssueTreeItemBase)) return;
    return actionSuggestSpellingCorrections(item.uri, item.getRange(), item.word);
}
