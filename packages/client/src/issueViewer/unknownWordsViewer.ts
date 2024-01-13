import type { Suggestion } from 'code-spell-checker-server/api';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, ExtensionContext, ProviderResult, Range, TextDocument, TreeDataProvider } from 'vscode';
import * as vscode from 'vscode';
import { TreeItem } from 'vscode';

import { commandHandlers, knownCommands } from '../commands';
import type { IssueTracker, SpellingCheckerIssue } from '../issueTracker';
import { createEmitter } from '../Subscribables';
import { findConicalDocument, findNotebookCellForDocument } from '../util/documentUri';
import { logErrors } from '../util/errors';

export function activate(context: ExtensionContext, issueTracker: IssueTracker) {
    context.subscriptions.push(UnknownWordsExplorer.register(issueTracker));
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

    constructor(issueTracker: IssueTracker) {
        const treeDataProvider = new UnknownWordsTreeDataProvider({
            issueTracker,
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

    static register(issueTracker: IssueTracker) {
        return new UnknownWordsExplorer(issueTracker);
    }
}

interface Context {
    issueTracker: IssueTracker;
    invalidate: (item: OnDidChangeEventType) => void;
    requestSuggestions: (item: RequestSuggestionsParam) => Suggestion[] | undefined;
}

interface ProviderOptions {
    issueTracker: IssueTracker;
    setMessage(msg: string | undefined): void;
    setDescription(des: string | undefined): void;
}

class UnknownWordsTreeDataProvider implements TreeDataProvider<IssueTreeItemBase> {
    private emitOnDidChange = createEmitter<OnDidChangeEventType>();
    private disposeList = createDisposableList();
    private suggestions = new Map<string, Suggestion[]>();
    private issueTracker: IssueTracker;

    constructor(private options: ProviderOptions) {
        this.issueTracker = options.issueTracker;
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
        const { word } = item;
        const suggestions = await this.issueTracker.getSuggestionsForIssue(item);
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
    readonly issues: SpellingCheckerIssue[] = [];

    constructor(
        readonly context: Context,
        readonly word: string,
        issues: SpellingCheckerIssue[] = [],
    ) {
        super();
        issues.forEach((issue) => this.addIssue(issue));
    }

    addIssue(issue: SpellingCheckerIssue) {
        const document = issue.document;
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
        const doc = this.issues[0]?.document;
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
        readonly issues: SpellingCheckerIssue[],
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
        readonly issues: SpellingCheckerIssue[],
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
    readonly cell: vscode.NotebookCell | undefined;
    constructor(readonly issue: SpellingCheckerIssue) {
        super();
        this.cell = findNotebookCellForDocument(this.doc);
    }

    get doc() {
        return this.issue.document;
    }

    getTreeItem(): TreeItem {
        const range = this.issue.range;
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
            command: 'vscode.open',
            arguments: [this.issue.document.uri, { selection: this.issue.range }],
        };
        item.contextValue = 'issue.location';
        return item;
    }

    getChildren() {
        return undefined;
    }

    getRange(): Range {
        return this.issue.range;
    }

    static compare(a: IssueLocationTreeItem, b: IssueLocationTreeItem) {
        const uriA = a.cell?.document.uri || a.doc.uri;
        const uriB = b.cell?.document.uri || b.doc.uri;
        const d = uriA.toString().localeCompare(uriB.toString());
        if (d !== 0) return d;
        if (a.cell?.index !== b.cell?.index) {
            return (a.cell?.index || 0) - (b.cell?.index || 0);
        }
        const ra = a.issue.range;
        const rb = b.issue.range;
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

function collectIssues(context: Context): WordIssueTreeItem[] {
    const issues = context.issueTracker.getIssues().flatMap(([_, issues]) => issues);
    const groupedByWord = new Map<string, WordIssueTreeItem>();
    const getGroup = getResolve(groupedByWord, (word) => new WordIssueTreeItem(context, word));
    issues.forEach(groupIssue);

    const comp = new Intl.Collator().compare;

    const sorted = [...groupedByWord.values()].sort((a, b) => comp(a.word, b.word));

    return sorted;

    function groupIssue(issue: SpellingCheckerIssue) {
        const wordIssue = getGroup(issue.word);
        wordIssue.addIssue(issue);
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
