import type { Suggestion } from 'code-spell-checker-server/api';
import { createDisposableList } from 'utils-disposables';
import type { Disposable, ExtensionContext, ProviderResult, Range, TextDocument, TreeDataProvider } from 'vscode';
import * as vscode from 'vscode';
import { TreeItem } from 'vscode';

import { commandHandlers, knownCommands } from '../commands.mjs';
import type { IssueTracker, SpellingCheckerIssue } from '../issueTracker.mjs';
import { createEmitter, debounce, rx } from '../Subscribables/index.js';
import { findConicalDocument, findNotebookCellForDocument } from '../util/documentUri.js';
import { logErrors } from '../util/errors.js';
import { getIconForIssues, icons } from './icons.mjs';
import { createIsItemVisibleFilter } from './issueFilter.mjs';
import { IssueTreeItemBase } from './IssueTreeItemBase.js';
import { cleanWord, markdownInlineCode } from './markdownHelper.mjs';

export function activate(context: ExtensionContext, issueTracker: IssueTracker) {
    context.subscriptions.push(UnknownWordsExplorer.register(issueTracker));
    context.subscriptions.push(
        vscode.commands.registerCommand(knownCommands['cSpell.issueViewer.item.openSuggestionsForIssue'], handleOpenSuggestionsForIssue),
        vscode.commands.registerCommand(knownCommands['cSpell.issueViewer.item.autoFixSpellingIssues'], handleAutoFixSpellingIssues),
        vscode.commands.registerCommand(knownCommands['cSpell.issueViewer.item.addWordToDictionary'], handleAddWordToDictionary),
    );
}

const debounceUIDelay = 100;

type OnDidChangeEventType = IssueTreeItemBase | undefined;

interface RequestSuggestionsParam {
    readonly word: string;
    readonly document: TextDocument;
    readonly onUpdate: (suggestions: Suggestion[]) => void;
}

interface ActiveDocumentSelection {
    document: TextDocument;
    selection: vscode.Selection | vscode.Range;
}

class UnknownWordsExplorer {
    private disposeList = createDisposableList();
    private treeView: vscode.TreeView<IssueTreeItemBase>;
    private uiEventFnEmitter = createEmitter<() => void>();
    private treeDataProvider: UnknownWordsTreeDataProvider;

    constructor(issueTracker: IssueTracker) {
        this.treeDataProvider = new UnknownWordsTreeDataProvider({
            issueTracker,
            setDescription: (des) => {
                this.treeView.description = des;
            },
            setMessage: (msg) => {
                this.treeView.message = msg;
            },
        });
        this.treeView = vscode.window.createTreeView(UnknownWordsExplorer.viewID, {
            treeDataProvider: this.treeDataProvider,
            showCollapseAll: true,
        });
        this.disposeList.push(
            this.treeView,
            rx(this.uiEventFnEmitter, debounce(debounceUIDelay)).subscribe((fn) => fn()),
            this.listenEvent(vscode.window.onDidChangeTextEditorSelection, (e) => this.handleOnDidChangeTextEditorSelection(e)),
            this.listenEvent(vscode.window.onDidChangeActiveTextEditor, (e) => this.handleTextEditorChange(e)),
            this.listenEvent(this.treeDataProvider.onDidChangeTreeData.bind(this.treeDataProvider), () =>
                this.handleTextEditorChange(vscode.window.activeTextEditor),
            ),
        );
        this.treeView.title = 'Words with Issues';
        this.treeView.message = 'No open documents.';
    }

    readonly dispose = this.disposeList.dispose;

    private handleOnDidChangeTextEditorSelection(e: vscode.TextEditorSelectionChangeEvent) {
        this.handleTextEditorChange(e.textEditor);
    }

    private handleTextEditorChange(e: vscode.TextEditor | undefined) {
        if (!this.treeView.visible) return;
        if (!e) return;
        const found = this.treeDataProvider.findRelatedIssue(e);
        if (!found) return;
        this.treeView.reveal(found, { select: true, focus: false });
    }

    private listenEvent<T>(event: vscode.Event<T>, fn: (e: T) => void) {
        return event((e) => this.uiEventFnEmitter.notify(() => fn(e)));
    }

    static viewID = 'cspell-info.issuesView';

    static register(issueTracker: IssueTracker) {
        return new UnknownWordsExplorer(issueTracker);
    }
}

interface Context {
    onlyVisible: boolean;
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
    private children: WordIssueTreeItem[] | undefined;

    constructor(private options: ProviderOptions) {
        this.issueTracker = options.issueTracker;
        this.disposeList.push(
            this.emitOnDidChange,
            this.issueTracker.onDidChangeDiagnostics((e) => this.handleOnDidChangeDiagnostics(e)),
            vscode.window.onDidChangeVisibleTextEditors(() => this.refresh()),
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
            onlyVisible: true, // Maybe add a setting for this.
            issueTracker: this.issueTracker,
            invalidate: (item) => this.emitOnDidChange.notify(item),
            requestSuggestions: (item) => {
                logErrors(this.fetchSuggestions(item), 'IssuesTreeDataProvider requestSuggestions');
                return this.suggestions.get(item.word);
            },
        };
        const issues = collectIssues(context);
        this.children = issues;
        this.updateMessage(issues.length ? undefined : 'No issues found...');
        return issues;
    }

    getParent(element: IssueTreeItemBase): ProviderResult<IssueTreeItemBase>;
    getParent(element: unknown): ProviderResult<IssueTreeItemBase> {
        if (!(element instanceof IssueTreeItemBase)) return undefined;
        return element.getParent();
    }

    onDidChangeTreeData(listener: (e: OnDidChangeEventType) => void, thisArg?: unknown, disposables?: Disposable[]): Disposable {
        this.children = undefined;
        const fn = thisArg ? listener.bind(thisArg) : listener;
        const d = this.emitOnDidChange.subscribe((e) => fn(e));
        if (disposables) {
            disposables.push(d);
        }
        return d;
    }

    findRelatedIssue(active: ActiveDocumentSelection) {
        if (!this.children) return;
        const found = this.children.find((item) => item.intersectsActiveSelection(active));
        return found;
    }

    private handleOnDidChangeDiagnostics(_e: vscode.DiagnosticChangeEvent) {
        this.refresh();
    }

    private refresh(item?: OnDidChangeEventType) {
        this.emitOnDidChange.notify(item);
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

    readonly dispose = this.disposeList.dispose;
}

class WordIssueTreeItem extends IssueTreeItemBase {
    suggestions: Suggestion[] | undefined;
    suggestionsByDocument = new Map<TextDocument, Suggestion[]>();
    conicalDocuments = new Set<TextDocument | vscode.NotebookDocument>();
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
        return this.issues.push(issue);
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(this.word);
        const hasPreferred = this.hasPreferred();
        const isFlagged = this.issues.some((issue) => issue.isFlagged());
        const isKnown = this.issues.some((issue) => issue.isKnown());
        item.iconPath = getIconForIssues({
            isFlagged: () => isFlagged,
            isKnown: () => isKnown,
            isSuggestion: () => this.issues.some((issue) => issue.treatAsSuggestion()),
        });

        item.description = `${nText(this.issues.length, 'issue', 'issues')} in ${nText(this.conicalDocuments.size, 'file', 'files')}${
            hasPreferred ? '*' : ''
        }`;

        const verboseDescription =
            `Number of occurrences: ${this.issues.length}, files: ${this.conicalDocuments.size}` + (hasPreferred ? ' (auto fix)' : '');
        const inlineWord = markdownInlineCode(this.word);
        item.tooltip = new vscode.MarkdownString()
            .appendMarkdown((isFlagged ? 'Flagged' : isKnown ? 'Misspelled' : 'Unknown') + ' word: ' + inlineWord)
            .appendText('\n\n')
            .appendText(verboseDescription);
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

    getParent(): IssueTreeItemBase | undefined {
        return undefined;
    }

    getChildren() {
        const { context, word, issues: diags, suggestions } = this;
        return [new IssueLocationsTreeItem(context, this, word, diags), new IssueFixesTreeItem(this, word, diags, suggestions)];
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

    intersectsActiveSelection(active: ActiveDocumentSelection): boolean {
        const { document, selection } = active;
        const { issues } = this;
        const matching = issues.filter((issue) => issue.document === document).find((issue) => issue.range.intersection(selection));
        return !!matching;
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
        readonly parent: WordIssueTreeItem,
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
        return this.issues.map((issue) => new IssueLocationTreeItem(this, issue)).sort(IssueLocationTreeItem.compare);
    }

    getParent(): IssueTreeItemBase | undefined {
        return this.parent;
    }
}

class IssueFixesTreeItem extends IssueTreeItemBase {
    suggestions: Suggestion[] | undefined;
    constructor(
        readonly parent: WordIssueTreeItem,
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
        return this.suggestions?.map((sug) => new IssueSuggestionTreeItem(this, this.word, sug));
    }

    getParent(): IssueTreeItemBase | undefined {
        return this.parent;
    }
}

class IssueLocationTreeItem extends IssueTreeItemBase {
    readonly cell: vscode.NotebookCell | undefined;
    constructor(
        readonly parent: IssueLocationsTreeItem,
        readonly issue: SpellingCheckerIssue,
    ) {
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
        item.resourceUri = this.doc.uri;
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

    getParent(): IssueTreeItemBase | undefined {
        return this.parent;
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
        readonly parent: IssueFixesTreeItem,
        readonly word: string,
        readonly suggestion: Suggestion,
    ) {
        super();
    }

    getTreeItem(): TreeItem {
        const { word, isPreferred } = this.suggestion;
        const item = new TreeItem(word);
        item.iconPath = isPreferred ? icons.applySuggestionPreferred : icons.applySuggestion;
        item.description = isPreferred && '(preferred)';
        const inlineWord = markdownInlineCode(word);
        const cleanedWord = cleanWord(word);
        const fixMessage = 'Find and Replace Issue with: ' + cleanedWord;
        // item.command = {
        //     title: fixMessage,
        //     command: knownCommands['cSpell.fixSpellingIssue'],
        //     arguments: [this.issue.doc.uri, this.issue.word, word, this.issue..map((d) => d.range)],
        // };
        item.command = {
            title: fixMessage,
            command: 'workbench.action.findInFiles',
            arguments: [
                {
                    query: this.word,
                    replace: word,
                    preserveCase: true,
                    triggerSearch: true,
                    isRegex: false,
                    isCaseSensitive: false,
                    onlyOpenEditors: true,
                },
            ],
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

function collectIssues(context: Context): WordIssueTreeItem[] {
    const isVisible = createIsItemVisibleFilter(context.onlyVisible);
    const issues = (context.issueTracker.getSpellingIssues() || []).filter(isVisible);
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

function nText(n: number, singular: string, plural: string): string {
    return `${n} ${n === 1 ? singular : plural}`;
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
