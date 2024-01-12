import { IssueType } from '@cspell/cspell-types';
import { logError } from '@internal/common-utils';
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

    public getDiagnostics(uri: Uri): SpellingDiagnostic[];
    public getDiagnostics(): [Uri, SpellingDiagnostic[]][];
    public getDiagnostics(uri?: Uri): SpellingDiagnostic[] | [Uri, SpellingDiagnostic[]][] {
        if (!uri) return [...this.issues.values()].map((d) => [d.uri, d.issues.map((issue) => issue.diag)] as [Uri, SpellingDiagnostic[]]);
        return this.issues.get(uri.toString())?.issues.map((issue) => issue.diag) || [];
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

    public readonly dispose = this.disposables.dispose;

    private handleDiagsFromServer(diags: DiagnosticsFromServer) {
        const fileIssue = this.mapToFileIssues(diags);
        this.issues.set(fileIssue.uri.toString(), fileIssue);
        this.subscribable.notify({ uris: [diags.uri] });
    }

    private handleDocClose(doc: TextDocument) {
        const uri = doc.uri.toString();
        this.issues.delete(uri);
    }

    private mapToFileIssues(diag: DiagnosticsFromServer): FileIssues {
        const document = findTextDocument(diag.uri);
        if (!document) {
            logError(`Failed to find document for ${diag.uri.toString()}`);
            return { uri: diag.uri, issues: [] };
        }

        return {
            uri: diag.uri,
            issues: diag.diagnostics.map((d) => SpellingCheckerIssue.fromDiagnostic(document, d, diag.version || document.version)),
        };
    }
}

interface FileIssues {
    uri: Uri;
    issues: SpellingCheckerIssue[];
}

export interface SpellingDiagnostic extends Diagnostic {
    data?: SpellCheckerDiagnosticData;
}

export class SpellingCheckerIssue {
    protected document: TextDocument;

    protected constructor(
        document: TextDocument,
        readonly diag: SpellingDiagnostic,
        /** document version that generated the issue. */
        readonly version: number,
    ) {
        this.document = document;
    }

    isFlagged(): boolean {
        return this.diag.data?.isFlagged || false;
    }

    isSuggestion(): boolean {
        return this.diag.data?.isSuggestion || false;
    }

    text(): string {
        const text = this.diag.data?.text;
        if (text !== undefined) return text;

        return this.document.getText(this.diag.range);
    }

    isIssueTypeSpelling(): boolean {
        return !this.diag.data?.issueType;
    }

    isIssueTypeDirective(): boolean {
        return this.diag.data?.issueType === IssueType.directive;
    }

    isStale(): boolean {
        return this.version !== this.document.version;
    }

    static fromDiagnostic(document: TextDocument, diag: SpellingDiagnostic, version: number): SpellingCheckerIssue {
        return new SpellingCheckerIssue(document, diag, version);
    }
}
