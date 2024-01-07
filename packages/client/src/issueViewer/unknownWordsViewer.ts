import type { Suggestion } from 'code-spell-checker-server/api';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, ExtensionContext, ProviderResult, Range, TextDocument, TreeDataProvider, Uri } from 'vscode';
import * as vscode from 'vscode';
import { TreeItem } from 'vscode';

import type { CSpellClient } from '../client';
import { commandHandlers, knownCommands } from '../commands';
import type { IssueTracker, SpellingDiagnostic } from '../issueTracker';
import { createEmitter } from '../Subscribables';
import { findNotebookCellForDocument, findConicalDocument } from '../util/documentUri';
import { logErrors } from '../util/errors';
import { findTextDocument } from '../util/findEditor';

export function activate(context: ExtensionContext, issueTracker: IssueTracker, client: CSpellClient) {
    context.subscriptions.push(UnknownWordsExplorer.register(issueTracker, client));
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

class UnknownWordsExplorer {
    private disposeList = createDisposableList();
    private treeView: vscode.TreeView<IssueTreeItemBase>;

    constructor(issueTracker: IssueTracker, client: CSpellClient) {
        const treeDataProvider = new UnknownWordsTreeDataProvider({
            issueTracker,
            client,
            setDescription: (des) => {
                this.treeView.description = des;
            },
            setMessage: (msg) => {
                this.treeView.message = msg;
            },
        });
        this.treeView = vscode.window.createTreeView(UnknownWordsExplorer.viewID, { treeDataProvider, showCollapseAll: true });
        this.disposeList.push(this.treeView);
        this.treeView.title = 'Unknown Words';
        this.treeView.message = 'No open documents.';
    }

    readonly dispose = this.disposeList.dispose;

    static viewID = 'cspell-info.issuesView';

    static register(issueTracker: IssueTracker, client: CSpellClient) {
        return new UnknownWordsExplorer(issueTracker, client);
    }
}

interface Context {
    client: CSpellClient;
    issueTracker: IssueTracker;
    invalidate: (item: OnDidChangeEventType) => void;
    requestSuggestions: (item: RequestSuggestionsParam) => Suggestion[] | undefined;
}

interface ProviderOptions {
    issueTracker: IssueTracker;
    client: CSpellClient;
    setMessage(msg: string | undefined): void;
    setDescription(des: string | undefined): void;
}

class UnknownWordsTreeDataProvider implements TreeDataProvider<IssueTreeItemBase> {
    private emitOnDidChange = createEmitter<OnDidChangeEventType>();
    private disposeList = createDisposableList();
    private suggestions = new Map<string, Suggestion[]>();
    private issueTracker: IssueTracker;
    private client: CSpellClient;

    constructor(private options: ProviderOptions) {
        this.issueTracker = options.issueTracker;
        this.client = options.client;
        this.disposeList.push(
            this.emitOnDidChange,
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
        const context: Context = {
            issueTracker: this.issueTracker,
            client: this.client,
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

    private handleOnDidChangeDiagnostics(_e: vscode.DiagnosticChangeEvent) {
        this.emitOnDidChange.notify(undefined);
    }

    private async fetchSuggestions(item: RequestSuggestionsParam) {
        const { word, document } = item;
        const result = await this.client.requestSpellingSuggestions(word, document);
        const suggestions = result.suggestions;
        this.suggestions.set(word, suggestions);
        // this.updateVSCodeContext();
        item.onUpdate(suggestions);
    }

    private updateMessage(msg: string | undefined) {
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

class WordIssueTreeItem extends IssueTreeItemBase {
    suggestions: Suggestion[] | undefined;
    suggestionsByDocument: Map<TextDocument, Suggestion[]> = new Map();
    conicalDocuments: Set<TextDocument | vscode.NotebookDocument> = new Set();
    readonly issues: SpellingIssue[] = [];

    constructor(
        readonly context: Context,
        readonly word: string,
        issues: SpellingIssue[] = [],
    ) {
        super();
        issues.forEach((issue) => this.addIssue(issue));
    }

    addIssue(issue: SpellingIssue) {
        const document = issue.doc;
        const suggestions = this.context.requestSuggestions({
            word: this.word,
            document,
            onUpdate: (sugs) => this.onUpdate(document, sugs),
        });
        this.suggestionsByDocument.set(document, suggestions || []);
        this.conicalDocuments.add(findConicalDocument(document));
        this.issues.push(issue);
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(this.word);
        const hasPreferred = this.hasPreferred();
        const isFlagged = !!this.issues.find((issue) => issue.diag.data?.isFlagged);
        item.iconPath = isFlagged ? icons.error : icons.warning;
        item.description =
            `Number of occurrences: ${this.issues.length}, files: ${this.conicalDocuments.size}` + (hasPreferred ? ' (auto fix)' : '');
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
        const { context, word, issues: diags, suggestions } = this;
        return [new IssueLocationsTreeItem(context, word, diags), new IssueFixesTreeItem(word, diags, suggestions)];
    }

    getRange(): Range | undefined {
        return undefined;
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
            ranges: this.issues.map((d) => d.range),
        };
    }

    async addToDictionary() {
        const doc = this.issues[0].doc;
        return commandHandlers['cSpell.addWordToDictionary'](this.word, doc?.uri);
    }

    private onUpdate(document: TextDocument, suggestions: Suggestion[]) {
        this.suggestionsByDocument.set(document, suggestions);
        this.suggestions = gatherSuggestions(this.suggestionsByDocument);
        this.context.invalidate(this);
    }
}

class IssueLocationsTreeItem extends IssueTreeItemBase {
    constructor(
        readonly context: Context,
        readonly word: string,
        readonly issues: SpellingIssue[],
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem('Locations:');
        item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        return item;
    }

    getChildren() {
        return this.issues.map((issue) => new IssueLocationTreeItem(issue)).sort(IssueLocationTreeItem.compare);
    }
}

class IssueFixesTreeItem extends IssueTreeItemBase {
    suggestions: Suggestion[] | undefined;
    constructor(
        readonly word: string,
        readonly issues: SpellingIssue[],
        suggestions: Suggestion[] | undefined,
    ) {
        super();
        this.suggestions = suggestions;
    }

    getTreeItem(): TreeItem {
        return new TreeItem('Fixes:', vscode.TreeItemCollapsibleState.Expanded);
    }

    getChildren() {
        return this.suggestions?.map((sug) => new IssueSuggestionTreeItem(this.word, sug));
    }
}

class IssueLocationTreeItem extends IssueTreeItemBase {
    readonly diag: SpellingDiagnostic;
    readonly doc: TextDocument;
    readonly cell: vscode.NotebookCell | undefined;
    constructor(readonly issue: SpellingIssue) {
        super();
        this.diag = issue.diag;
        this.doc = issue.doc;
        this.cell = findNotebookCellForDocument(this.doc);
    }

    getTreeItem(): TreeItem {
        const range = this.diag.range;
        const cellInfo = this.cell ? `Cell ${this.cell.index + 1} ` : ' ';
        const location = `${cellInfo}Ln ${range.start.line + 1} Col ${range.start.character + 1}`;
        const item = new TreeItem('');
        // const item = new TreeItem('');
        const docUri = this.doc.uri;
        const uri = docUri; // docUri.with({ path: docUri.path + `:${range.start.line + 1}:${range.start.character + 1}` });
        item.resourceUri = uri;
        item.label = undefined;
        item.iconPath = vscode.ThemeIcon.File;
        item.description = location;
        item.command = {
            title: 'Goto Issue',
            command: knownCommands['cSpell.selectRange'],
            arguments: [this.doc.uri, this.diag.range],
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

    static compare(a: IssueLocationTreeItem, b: IssueLocationTreeItem) {
        const uriA = a.cell?.document.uri || a.doc.uri;
        const uriB = b.cell?.document.uri || b.doc.uri;
        const d = uriA.toString().localeCompare(uriB.toString());
        if (d !== 0) return d;
        if (a.cell?.index !== b.cell?.index) {
            return (a.cell?.index || 0) - (b.cell?.index || 0);
        }
        const ra = a.diag.range;
        const rb = b.diag.range;
        return ra.start.line - rb.start.line || ra.start.character - rb.start.character;
    }
}

class IssueSuggestionTreeItem extends IssueTreeItemBase {
    constructor(
        readonly word: string,
        readonly suggestion: Suggestion,
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const { word, isPreferred } = this.suggestion;
        const item = new TreeItem(word);
        item.iconPath = isPreferred ? icons.suggestionPreferred : icons.suggestion;
        item.description = isPreferred && '(preferred)';
        const fixMessage = 'Fix Issue with: ' + word;
        // item.command = {
        //     title: fixMessage,
        //     command: knownCommands['cSpell.fixSpellingIssue'],
        //     arguments: [this.issue.doc.uri, this.issue.word, word, this.issue..map((d) => d.range)],
        // };
        item.tooltip = new vscode.MarkdownString().appendText(fixMessage).appendMarkdown('\n- hello\n');
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

function collectIssues(context: Context): WordIssueTreeItem[] {
    const issues: FileIssue[] = context.issueTracker.getDiagnostics().map(([uri, diags]) => ({ uri, doc: findTextDocument(uri), diags }));
    const groupedByWord = new Map<string, WordIssueTreeItem>();
    issues.forEach(groupIssue);

    const comp = new Intl.Collator().compare;

    const sorted = [...groupedByWord.values()].sort((a, b) => comp(a.word, b.word));

    return sorted;

    function groupIssue(fileIssues: FileIssue) {
        if (!fileIssues.doc) return;
        const doc = fileIssues.doc;
        const issueContext = { ...context, document: doc };

        function getWord(issue: SpellingDiagnostic): string {
            return doc.getText(issue.range);
        }

        const getGroup = getResolve(groupedByWord, (word) => new WordIssueTreeItem(issueContext, word));

        fileIssues.diags.forEach((issue) => {
            const word = getWord(issue);
            getGroup(word).addIssue({ word, doc, diag: issue, range: issue.range });
        });
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

function handleOpenSuggestionsForIssue(item?: WordIssueTreeItem) {
    if (!(item instanceof IssueTreeItemBase)) return;
    // return actionSuggestSpellingCorrections(item.context.document.uri, item.getRange(), item.word);
}

function handleAutoFixSpellingIssues(item?: WordIssueTreeItem) {
    if (!(item instanceof WordIssueTreeItem)) return;
    // return item.autoFix();
}

function handleAddWordToDictionary(item?: WordIssueTreeItem) {
    if (!(item instanceof WordIssueTreeItem)) return;
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

function gatherSuggestions(suggestionsByDocument: Map<TextDocument, Suggestion[]>) {
    const sugMap = new Map<string, boolean | undefined>();
    for (const sugs of suggestionsByDocument.values()) {
        for (const sug of sugs) {
            const isPreferred = sugMap.get(sug.word) || sug.isPreferred;
            sugMap.set(sug.word, isPreferred);
        }
    }
    const sugs = [...sugMap.entries()].map(([word, isPreferred]) => ({ word, isPreferred }));
    const preferred = sugs.filter((sug) => sug.isPreferred);
    const rest = sugs.filter((sug) => !sug.isPreferred);
    return [...preferred, ...rest];
}
