import { IssueType } from '@cspell/cspell-types';
import { logError } from '@internal/common-utils';
import type { Suggestion } from 'code-spell-checker-server/api';
import { createDisposableList } from 'utils-disposables';
import type { Diagnostic, DiagnosticChangeEvent, TextDocument, Uri } from 'vscode';
import { workspace } from 'vscode';

import type { CSpellClient, DiagnosticsFromServer, SpellCheckerDiagnosticData } from './client';
import { createEmitter } from './Subscribables';
import { findTextDocument } from './util/findEditor';

type UriString = string;

export type IssueTrackerChangeEvent = DiagnosticChangeEvent;

export class IssueTracker {
    private disposables = createDisposableList();
    private issues = new Map<UriString, FileIssues>();
    private subscribable = createEmitter<IssueTrackerChangeEvent>();

    constructor(readonly client: CSpellClient) {
        this.disposables.push(client.onDiagnostics((diags) => this.handleDiagsFromServer(diags)));
        this.disposables.push(workspace.onDidCloseTextDocument((doc) => this.handleDocClose(doc)));
    }

    public getIssues(uri: Uri): SpellingCheckerIssue[] | undefined;
    public getIssues(): [Uri, SpellingCheckerIssue[]][];
    public getIssues(uri?: Uri): SpellingCheckerIssue[] | [Uri, SpellingCheckerIssue[]][] | undefined {
        if (!uri) return [...this.issues.values()].map((d) => [d.uri, d.issues] as [Uri, SpellingCheckerIssue[]]);
        return this.issues.get(uri.toString())?.issues;
    }

    public getIssueCount(uri?: Uri): number {
        if (!uri) return [...this.issues.values()].reduce((a, b) => a + b.issues.length, 0);
        return this.issues.get(uri.toString())?.issues.length || 0;
    }

    public getUrisWithIssues(): Uri[] {
        return [...this.issues.values()].filter((d) => d.issues.length).map((d) => d.uri);
    }

    public onDidChangeDiagnostics(fn: (e: IssueTrackerChangeEvent) => void) {
        return this.subscribable.subscribe(fn);
    }

    public async getSuggestionsForIssue(issue: SpellingCheckerIssue | { word: string; document: TextDocument }): Promise<Suggestion[]> {
        const result = await this.client.requestSpellingSuggestions(issue.word, issue.document);
        return result.suggestions;
    }

    public readonly dispose = this.disposables.dispose;

    private handleDiagsFromServer(diags: DiagnosticsFromServer) {
        const fileIssue = this.mapToFileIssues(diags);
        if (!fileIssue) return;
        this.issues.set(fileIssue.uri.toString(), fileIssue);
        this.subscribable.notify({ uris: [diags.uri] });
    }

    private handleDocClose(doc: TextDocument) {
        const uri = doc.uri.toString();
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
