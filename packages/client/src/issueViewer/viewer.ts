import type { Suggestion } from 'code-spell-checker-server/api';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, ExtensionContext, ProviderResult, Range, TextDocument, TreeDataProvider } from 'vscode';
import * as vscode from 'vscode';
import { TreeItem } from 'vscode';

import type { CSpellClient } from '../client';
import { actionSuggestSpellingCorrections } from '../codeActions/actionSuggestSpellingCorrections';
import { knownCommands } from '../commands';
import type { IssueTracker, SpellingDiagnostic } from '../issueTracker';
import { createEmitter } from '../Subscribables';
import { logErrors } from '../util/errors';

export function activate(context: ExtensionContext, issueTracker: IssueTracker, client: CSpellClient) {
    context.subscriptions.push(IssuesTreeDataProvider.register(issueTracker, client));
    context.subscriptions.push(
        vscode.commands.registerCommand(knownCommands['cSpell.openSuggestionsForIssue'], handleOpenSuggestionsForIssue),
    );
}

type OnDidChangeEventType = IssueTreeItemBase | undefined;

interface RequestSuggestionsParam {
    readonly word: string;
    readonly document: TextDocument;
    readonly onUpdate: (suggestions: Suggestion[]) => void;
}

interface Context {
    client: CSpellClient;
    issueTracker: IssueTracker;
    document: TextDocument;
    currentEditor: vscode.TextEditor | undefined;
    invalidate: (item: OnDidChangeEventType) => void;
    requestSuggestions: (item: RequestSuggestionsParam) => Suggestion[] | undefined;
}

class IssuesTreeDataProvider implements TreeDataProvider<IssueTreeItemBase> {
    private emitOnDidChange = createEmitter<OnDidChangeEventType>();
    private disposeList = createDisposableList();
    private currentEditor: vscode.TextEditor | undefined = undefined;
    private suggestions = new Map<string, Suggestion[]>();

    constructor(
        private issueTracker: IssueTracker,
        private client: CSpellClient,
    ) {
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
        const context: Context = {
            issueTracker: this.issueTracker,
            client: this.client,
            document: editor.document,
            currentEditor: editor,
            invalidate: (item) => this.emitOnDidChange.notify(item),
            requestSuggestions: (item) => {
                logErrors(this.fetchSuggestions(item), 'IssuesTreeDataProvider requestSuggestions');
                return this.suggestions.get(item.word);
            },
        };
        return collectIssues(context);
    }

    onDidChangeTreeData(listener: (e: OnDidChangeEventType) => void, thisArg?: unknown, disposables?: Disposable[]): Disposable {
        const fn = thisArg ? listener.bind(thisArg) : listener;
        const d = this.emitOnDidChange.subscribe((e) => fn(e));
        if (disposables) {
            disposables.push(d);
        }
        return d;
    }

    private async fetchSuggestions(item: RequestSuggestionsParam) {
        const { word, document } = item;
        const result = await this.client.requestSpellingSuggestions(word, document);
        const suggestions = result.suggestions;
        this.suggestions.set(word, suggestions);
        item.onUpdate(suggestions);
    }

    readonly dispose = this.disposeList.dispose;

    static register(issueTracker: IssueTracker, client: CSpellClient, name = 'cspell-info.issuesView') {
        const provider = new IssuesTreeDataProvider(issueTracker, client);
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
    doc: new vscode.ThemeIcon('go-to-file'),
    suggestion: new vscode.ThemeIcon('lightbulb'),
    suggestionPreferred: new vscode.ThemeIcon('lightbulb-autofix'),
} as const;

abstract class IssueTreeItemBase {
    abstract getTreeItem(): TreeItem | Promise<TreeItem>;
    abstract getChildren(): ProviderResult<IssueTreeItemBase[]>;
}

class IssueTreeItem extends IssueTreeItemBase {
    suggestions: Suggestion[] | undefined;
    constructor(
        readonly context: Context,
        readonly word: string,
        readonly diags: SpellingDiagnostic[] = [],
    ) {
        super();
        this.suggestions = context.requestSuggestions({ word, document: context.document, onUpdate: (sugs) => this.onUpdate(sugs) });
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
                arguments: [this.context.document.uri, this.diags[0].range],
            };
        }
        item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        return item;
    }

    getChildren() {
        const locations = this.diags.map((d) => new IssueInstanceTreeItem(this.context, this.word, d));
        const suggestions = this.suggestions?.map((sug) => new IssueSuggestionTreeItem(this.context, this.word, sug, this.diags));
        return suggestions ? [...locations, ...suggestions] : locations;
    }

    getRange(): Range | undefined {
        return this.diags[0]?.range;
    }

    private onUpdate(suggestions: Suggestion[]) {
        this.suggestions = suggestions;
        this.context.invalidate(this);
    }
}

class IssueInstanceTreeItem extends IssueTreeItemBase {
    constructor(
        readonly context: Context,
        readonly word: string,
        readonly diag: SpellingDiagnostic,
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const range = this.diag.range;
        const item = new TreeItem(`${range.start.line}:${range.start.character}`);
        item.iconPath = icons.doc;
        item.description = this.word;
        item.command = {
            title: 'Goto Issue',
            command: knownCommands['cSpell.selectRange'],
            arguments: [this.context.document.uri, this.diag.range],
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

class IssueSuggestionTreeItem extends IssueTreeItemBase {
    constructor(
        readonly context: Context,
        readonly word: string,
        readonly suggestion: Suggestion,
        readonly diags: SpellingDiagnostic[],
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const { word, isPreferred } = this.suggestion;
        const item = new TreeItem(word);
        item.iconPath = isPreferred ? icons.suggestionPreferred : icons.suggestion;
        item.description = isPreferred && '(preferred)';
        item.command = {
            title: 'Fix Issue with ' + word,
            command: knownCommands['cSpell.fixSpellingIssue'],
            arguments: [this.context.document.uri, this.word, word, this.diags.map((d) => d.range)],
        };
        return item;
    }

    getChildren() {
        return undefined;
    }
}

function collectIssues(context: Context): IssueTreeItem[] {
    const doc = context.document;
    const issues = context.issueTracker.getDiagnostics(doc.uri);
    const groupedByWord = new Map<string, IssueTreeItem>();
    const getGroup = getResolve(groupedByWord, (word) => new IssueTreeItem(context, word));
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
    return actionSuggestSpellingCorrections(item.context.document.uri, item.getRange(), item.word);
}
