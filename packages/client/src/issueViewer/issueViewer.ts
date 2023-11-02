import { uriToName } from '@internal/common-utils';
import type { Suggestion } from 'code-spell-checker-server/api';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, ExtensionContext, ProviderResult, Range, TextDocument, TreeDataProvider, Uri } from 'vscode';
import * as vscode from 'vscode';
import { TreeItem } from 'vscode';

import { handleFixSpellingIssue } from '../applyCorrections';
import type { CSpellClient } from '../client';
import { actionSuggestSpellingCorrections } from '../codeActions/actionSuggestSpellingCorrections';
import { commandHandlers, knownCommands } from '../commands';
import type { IssueTracker, SpellingDiagnostic } from '../issueTracker';
import { createEmitter } from '../Subscribables';
import { logErrors } from '../util/errors';
import { findEditor, findTextDocument } from '../util/findEditor';

export function activate(context: ExtensionContext, issueTracker: IssueTracker, client: CSpellClient) {
    context.subscriptions.push(IssueExplorer.register(issueTracker, client));
    context.subscriptions.push(
        vscode.commands.registerCommand(knownCommands['cSpell.issueViewer.item.openSuggestionsForIssue'], handleOpenSuggestionsForIssue),
        vscode.commands.registerCommand(knownCommands['cSpell.issueViewer.item.autoFixSpellingIssues'], handleAutoFixSpellingIssues),
        vscode.commands.registerCommand(knownCommands['cSpell.issueViewer.item.addWordToDictionary'], handleAddWordToDictionary),
    );
}

type OnDidChangeEventType = IssueTreeItemBase | undefined;

interface RequestSuggestionsParam {
    readonly word: string;
    readonly document: TextDocument;
    readonly onUpdate: (suggestions: Suggestion[]) => void;
}

class IssueExplorer {
    private disposeList = createDisposableList();
    private treeView: vscode.TreeView<IssueTreeItemBase>;

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
        this.treeView = vscode.window.createTreeView(IssueExplorer.viewID, { treeDataProvider, showCollapseAll: true });
        this.disposeList.push(this.treeView);
        this.treeView.title = 'Spelling Issues';
        this.treeView.message = 'No open documents.';
    }

    readonly dispose = this.disposeList.dispose;

    static viewID = 'cspell-info.issuesView';

    static register(issueTracker: IssueTracker, client: CSpellClient) {
        return new IssueExplorer(issueTracker, client);
    }
}

interface Context {
    client: CSpellClient;
    issueTracker: IssueTracker;
    document: TextDocument;
    invalidate: (item: OnDidChangeEventType) => void;
    requestSuggestions: (item: RequestSuggestionsParam) => Suggestion[] | undefined;
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
    private currentEditor: vscode.TextEditor | undefined = undefined;
    private currentDocUri: Uri | undefined = undefined;
    private suggestions = new Map<string, Suggestion[]>();
    private issueTracker: IssueTracker;
    private client: CSpellClient;

    constructor(private options: ProviderOptions) {
        this.issueTracker = options.issueTracker;
        this.client = options.client;
        this.currentEditor = vscode.window.activeTextEditor;
        this.disposeList.push(
            this.emitOnDidChange,
            vscode.window.onDidChangeActiveTextEditor((editor) => this.updateEditor(editor)),
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
        const editor = this.currentEditor;
        const document = editor?.document || findTextDocument(this.currentDocUri);
        if (!document) return this.updateMessage('No open documents.');
        const context: Context = {
            issueTracker: this.issueTracker,
            client: this.client,
            document: document,
            invalidate: (item) => this.emitOnDidChange.notify(item),
            requestSuggestions: (item) => {
                logErrors(this.fetchSuggestions(item), 'IssuesTreeDataProvider requestSuggestions');
                return this.suggestions.get(item.word);
            },
        };
        const issues = collectIssues(context);
        this.updateMessage(issues.length ? undefined : 'No issues found...');
        return issues;
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
        const current = this.currentEditor?.document.uri.toString();
        if (!current) return;
        const matching = e.uris.filter((u) => u.toString() === current);
        if (matching.length) {
            this.emitOnDidChange.notify(undefined);
        }
    }

    private async fetchSuggestions(item: RequestSuggestionsParam) {
        const { word, document } = item;
        const result = await this.client.requestSpellingSuggestions(word, document);
        const suggestions = result.suggestions;
        this.suggestions.set(word, suggestions);
        // this.updateVSCodeContext();
        item.onUpdate(suggestions);
    }

    private updateEditor(editor: vscode.TextEditor | undefined) {
        if (editor === this.currentEditor) return;
        if (editor) {
            this.currentEditor = editor;
            this.currentDocUri = editor.document.uri;
            this.emitOnDidChange.notify(undefined);
            return;
        }
        this.currentEditor = this.currentDocUri && findEditor(this.currentDocUri);
        this.emitOnDidChange.notify(undefined);
    }

    private updateMessage(msg: string | undefined) {
        const doc = findTextDocument(this.currentDocUri);
        const uri = doc?.uri;
        const name = uri && uriToName(uri);
        this.options.setDescription(name);
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
        const hasPreferred = this.hasPreferred();
        const isFlagged = this.diags[0]?.data?.isFlagged;
        item.iconPath = isFlagged ? icons.error : icons.warning;
        item.description = this.diags.length + (hasPreferred ? ' (auto fix)' : '');
        const cWord = cleanWord(this.word);
        item.tooltip = new vscode.MarkdownString().appendMarkdown((isFlagged ? 'Flagged' : 'Unknown') + ' word: `' + cWord + '`');
        // if (this.diags.length === 1) {
        //     item.command = {
        //         title: 'Goto Issue',
        //         command: knownCommands['cSpell.selectRange'],
        //         arguments: [this.context.document.uri, this.diags[0].range],
        //     };
        // }
        item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        item.contextValue = hasPreferred ? 'issue.hasPreferred' : 'issue';
        return item;
    }

    getChildren() {
        const { context, word, diags, suggestions } = this;
        return [new IssueLocationsTreeItem(context, word, diags), new IssueFixesTreeItem(this.context, word, diags, suggestions)];
    }

    getRange(): Range | undefined {
        return this.diags[0]?.range;
    }

    hasPreferred(): boolean {
        const preferred = this.suggestions?.filter((sug) => sug.isPreferred);
        return preferred?.length === 1;
    }

    getPreferred(): PreferredFix | undefined {
        const preferred = this.suggestions?.filter((sug) => sug.isPreferred);
        if (preferred?.length !== 1) return undefined;
        const { word } = preferred[0];
        return {
            text: this.word,
            newText: word,
            ranges: this.diags.map((d) => d.range),
        };
    }

    async autoFix() {
        const pref = this.getPreferred();
        if (!pref) return;
        return handleFixSpellingIssue(this.context.document.uri, pref.text, pref.newText, pref.ranges);
    }

    async addToDictionary() {
        return commandHandlers['cSpell.addWordToDictionary'](this.word, this.context.document.uri);
    }

    private onUpdate(suggestions: Suggestion[]) {
        this.suggestions = suggestions;
        this.context.invalidate(this);
    }
}

class IssueLocationsTreeItem extends IssueTreeItemBase {
    constructor(
        readonly context: Context,
        readonly word: string,
        readonly diags: SpellingDiagnostic[],
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem('Locations:');
        item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        return item;
    }

    getChildren() {
        return this.diags.map((d) => new IssueLocationTreeItem(this.context, this.word, d));
    }
}

class IssueFixesTreeItem extends IssueTreeItemBase {
    suggestions: Suggestion[] | undefined;
    constructor(
        readonly context: Context,
        readonly word: string,
        readonly diags: SpellingDiagnostic[],
        suggestions: Suggestion[] | undefined,
    ) {
        super();
        this.suggestions = suggestions;
    }

    getTreeItem(): TreeItem {
        return new TreeItem('Fixes:', vscode.TreeItemCollapsibleState.Expanded);
    }

    getChildren() {
        return this.suggestions?.map((sug) => new IssueSuggestionTreeItem(this.context, this.word, sug, this.diags));
    }
}

class IssueLocationTreeItem extends IssueTreeItemBase {
    constructor(
        readonly context: Context,
        readonly word: string,
        readonly diag: SpellingDiagnostic,
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const range = this.diag.range;
        const item = new TreeItem(`${range.start.line + 1}:${range.start.character + 1}`);
        item.iconPath = icons.doc;
        item.description = this.word;
        item.command = {
            title: 'Goto Issue',
            command: knownCommands['cSpell.selectRange'],
            arguments: [this.context.document.uri, this.diag.range],
        };
        item.contextValue = 'issue.location';
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
        const fixMessage = 'Fix Issue with: ' + word;
        item.command = {
            title: fixMessage,
            command: knownCommands['cSpell.fixSpellingIssue'],
            arguments: [this.context.document.uri, this.word, word, this.diags.map((d) => d.range)],
        };
        item.tooltip = fixMessage;
        item.accessibilityInformation = { label: fixMessage };
        item.contextValue = isPreferred ? 'issue.suggestion-preferred' : 'issue.suggestion';
        // item.checkboxState = {
        //     state: vscode.TreeItemCheckboxState.Unchecked,
        //     tooltip: fixMessage,
        // };
        return item;
    }

    getChildren() {
        return undefined;
    }

    isPreferred(): boolean {
        return this.suggestion.isPreferred || false;
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

function handleOpenSuggestionsForIssue(item?: IssueTreeItem) {
    if (!(item instanceof IssueTreeItemBase)) return;
    return actionSuggestSpellingCorrections(item.context.document.uri, item.getRange(), item.word);
}

function handleAutoFixSpellingIssues(item?: IssueTreeItem) {
    if (!(item instanceof IssueTreeItem)) return;
    return item.autoFix();
}

function handleAddWordToDictionary(item?: IssueTreeItem) {
    if (!(item instanceof IssueTreeItem)) return;
    return item.addToDictionary();
}

interface PreferredFix {
    text: string;
    newText: string;
    ranges: Range[];
}

// function getPreferredFixes(issueTracker: IssueTracker, uri: Uri): PreferredFix[] | undefined {
//     const issues = issueTracker.getDiagnostics(uri);
//     if (!issues.length) return undefined;
// }

/**
 * Clean a word for markdown.
 * @param word
 */
function cleanWord(word: string): string {
    return word.replace(/\s/g, ' ').replace(/`/g, "'");
}
