import { IssueType } from '@cspell/cspell-types';
import { autoResolve, logError } from '@internal/common-utils';
import type { Suggestion } from 'code-spell-checker-server/api';
import type { DisposableHybrid } from 'utils-disposables';
import { createDisposableList } from 'utils-disposables';
import type { Diagnostic, DiagnosticChangeEvent, TextDocument, Uri } from 'vscode';
import { workspace } from 'vscode';

import type { CSpellClient, DiagnosticsFromServer, SpellCheckerDiagnosticData } from './client/index.mjs';
import { createEmitter } from './Subscribables/index.js';
import { findTextDocument } from './util/findEditor.js';

type UriString = string;

export type IssueTrackerChangeEvent = DiagnosticChangeEvent;

export class IssueTracker {
    private disposables = createDisposableList();
    private issues = new Map<UriString, FileIssues>();
    private subscribable = createEmitter<IssueTrackerChangeEvent>();
    /**
     * cached suggestions for a given word in a given document uri.
     */
    private cachedSuggestions = new Map<UriString, Map<string, Promise<Suggestion[]>>>();

    constructor(readonly client: CSpellClient) {
        this.disposables.push(client.onDiagnostics((diags) => this.handleDiagsFromServer(diags)));
        this.disposables.push(workspace.onDidCloseTextDocument((doc) => this.handleDocClose(doc)));
    }

    public getIssues(uri: Uri): SpellingCheckerIssuesCollection | undefined;
    public getIssues(): [Uri, SpellingCheckerIssuesCollection][];
    public getIssues(uri?: Uri): SpellingCheckerIssuesCollection | [Uri, SpellingCheckerIssuesCollection][] | undefined {
        if (!uri)
            return [...this.issues.values()].map(
                (d) => [d.uri, new SpellingCheckerIssuesCollection(d.issues)] as [Uri, SpellingCheckerIssuesCollection],
            );
        const issues = this.issues.get(uri.toString())?.issues;
        return issues ? new SpellingCheckerIssuesCollection(issues) : undefined;
    }

    public getIssueCount(uri?: Uri): number {
        if (!uri) return [...this.issues.values()].reduce((a, b) => a + b.issues.length, 0);
        return this.issues.get(uri.toString())?.issues.length || 0;
    }

    public getUrisWithIssues(): Uri[] {
        return [...this.issues.values()].filter((d) => d.issues.length).map((d) => d.uri);
    }

    public onDidChangeDiagnostics(fn: (e: IssueTrackerChangeEvent) => void): DisposableHybrid {
        return this.subscribable.subscribe(fn);
    }

    /**
     * Get suggestions for a given issue. The suggestions are cached.
     * @param issue - issues to get suggestions for.
     * @returns a promise that resolves to an array of suggestions.
     */
    public getSuggestionsForIssue(issue: SpellingCheckerIssue | { word: string; document: TextDocument }): Promise<Suggestion[]> {
        const key = issue.document.uri.toString();
        const cached = autoResolve(this.cachedSuggestions, key, () => new Map<string, Promise<Suggestion[]>>());
        return autoResolve(cached, issue.word, () => this.fetchSuggestionsForIssue(issue));
    }

    /**
     * Fetch suggestions for a given issue from the server. This does NOT cache the results.
     * @param issue - issues to get suggestions for.
     * @returns a promise that resolves to an array of suggestions.
     */
    public async fetchSuggestionsForIssue(issue: SpellingCheckerIssue | { word: string; document: TextDocument }): Promise<Suggestion[]> {
        const results = await this.client.requestSpellingSuggestions(issue.word, issue.document);
        return results.suggestions;
    }

    public readonly dispose = this.disposables.dispose;

    private handleDiagsFromServer(diags: DiagnosticsFromServer) {
        const fileIssue = this.mapToFileIssues(diags);
        if (!fileIssue) return;
        const uriKey = fileIssue.uri.toString();
        this.cachedSuggestions.delete(uriKey);
        this.issues.set(uriKey, fileIssue);
        this.subscribable.notify({ uris: [diags.uri] });
    }

    private handleDocClose(doc: TextDocument) {
        const uri = doc.uri.toString();
        this.cachedSuggestions.delete(uri);
        this.issues.delete(uri);
    }

    private mapToFileIssues(diag: DiagnosticsFromServer): FileIssues | undefined {
        const document = findTextDocument(diag.uri);
        if (!document) {
            logError(`Failed to find document for ${diag.uri.toString()}`);
            return undefined;
        }

        return {
            uri: document.uri,
            document,
            issues: diag.diagnostics.map((d) => SpellingCheckerIssue.fromDiagnostic(document, d, diag.version || document.version)),
        };
    }
}

interface FileIssues {
    readonly uri: Uri;
    readonly document: TextDocument;
    readonly issues: SpellingCheckerIssue[];
}

export interface SpellingDiagnostic extends Diagnostic {
    readonly data?: SpellCheckerDiagnosticData;
}

export class SpellingCheckerIssue {
    protected constructor(
        readonly document: TextDocument,
        readonly diag: SpellingDiagnostic,
        /** document version that generated the issue. */
        readonly version: number,
    ) {
        this.document = document;
    }

    get uri(): Uri {
        return this.document.uri;
    }

    /**
     * @returns true if it is a more severe spelling issue should be addressed.
     */
    isFlagged(): boolean {
        return this.diag.data?.isFlagged || false;
    }

    /**
     * @returns true if the issue is a suggestion, but not a real problem.
     */
    isSuggestion(): boolean {
        return this.diag.data?.isSuggestion || false;
    }

    hasPreferredSuggestions(): boolean {
        const sugs = this.providedSuggestions();
        if (!sugs) return false;
        return sugs.filter((s) => s.isPreferred).length === 1;
    }

    getPreferredSuggestions(): string[] | undefined {
        const sugs = this.providedSuggestions();
        if (!sugs) return undefined;
        const pref = sugs.filter((s) => s.isPreferred);
        if (pref.length !== 1) return undefined;
        return pref.map((s) => s.word);
    }

    /**
     * @returns the text of the issue.
     */
    get word(): string {
        const text = this.diag.data?.text;
        if (text !== undefined) return text;

        return this.document.getText(this.diag.range);
    }

    isIssueTypeSpelling(): boolean {
        return !this.diag.data?.issueType;
    }

    /**
     * @returns true if the issue is related to an inline directive and not a spelling issue.
     */
    isIssueTypeDirective(): boolean {
        return this.diag.data?.issueType === IssueType.directive;
    }

    /**
     * @returns true if the document has been modified since the issue was generated.
     */
    isStale(): boolean {
        return this.version !== this.document.version;
    }

    get severity() {
        return this.diag.severity;
    }

    get range(): Diagnostic['range'] {
        return this.diag.range;
    }

    /**
     * These suggestions were provided by the server as part of the diagnostic.
     * This is the way preferred suggestions are provided without needing to
     * calculate a full set of suggestions.
     * @returns the suggestions for the issue.
     */
    providedSuggestions(): Suggestion[] | undefined {
        return this.diag.data?.suggestions;
    }

    static fromDiagnostic(document: TextDocument, diag: SpellingDiagnostic, version: number): SpellingCheckerIssue {
        return new SpellingCheckerIssue(document, diag, version);
    }
}

export class SpellingCheckerIssuesCollection implements Iterable<SpellingCheckerIssue> {
    map: SpellingCheckerIssue[]['map'];
    filter: SpellingCheckerIssue[]['filter'];
    forEach: SpellingCheckerIssue[]['forEach'];

    constructor(readonly issues: SpellingCheckerIssue[]) {
        this.map = issues.map.bind(issues);
        this.filter = issues.filter.bind(issues);
        this.forEach = issues.forEach.bind(issues);
    }

    get length(): number {
        return this.issues.length;
    }

    getSpellingIssues(): SpellingCheckerIssue[] {
        return this.issues.filter((issue) => issue.isIssueTypeSpelling());
    }

    getDirectiveIssues(): SpellingCheckerIssue[] {
        return this.issues.filter((issue) => issue.isIssueTypeDirective());
    }

    getStats(): IssuesStats {
        const result = { spelling: 0, directive: 0, flagged: 0, suggestions: 0, haveSuggestions: 0 };
        for (const issue of this.issues) {
            if (issue.isIssueTypeSpelling()) {
                result.spelling++;
                if (issue.isFlagged()) result.flagged++;
                if (issue.isSuggestion()) result.suggestions++;
                if (issue.providedSuggestions()?.length) result.haveSuggestions++;
            } else if (issue.isIssueTypeDirective()) {
                result.directive++;
            }
        }
        return result;
    }

    [Symbol.iterator](): Iterator<SpellingCheckerIssue> {
        return this.issues[Symbol.iterator]();
    }
}

export interface IssuesStats {
    /** Number of spelling issues including ({@link flagged} and {@link suggestions}) */
    spelling: number;
    /** Number of directive issues, NOT including in {@link spelling} */
    directive: number;
    /** Number of issues that are flagged. */
    flagged: number;
    /** Number of issues that are pure suggestions. */
    suggestions: number;
    /** Number of issues that have suggestions. */
    haveSuggestions: number;
}
