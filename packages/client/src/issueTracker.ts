import { createDisposableList } from 'utils-disposables';
import type { Diagnostic, DiagnosticChangeEvent, TextDocument, Uri } from 'vscode';
import { workspace } from 'vscode';

import type { CSpellClient, DiagnosticsFromServer, SpellCheckerDiagnosticData } from './client';
import { createEmitter } from './Subscribables';

type UriString = string;

export class IssueTracker {
    private disposables = createDisposableList();
    private issues = new Map<UriString, DiagnosticsFromServer>();
    private subscribable = createEmitter<DiagnosticChangeEvent>();

    constructor(readonly client: CSpellClient) {
        this.disposables.push(client.onDiagnostics((diags) => this.handleDiagsFromServer(diags)));
        this.disposables.push(workspace.onDidCloseTextDocument((doc) => this.handleDocClose(doc)));
    }

    public getDiagnostics(uri: Uri): SpellingDiagnostic[];
    public getDiagnostics(): [Uri, SpellingDiagnostic[]][];
    public getDiagnostics(uri?: Uri): SpellingDiagnostic[] | [Uri, SpellingDiagnostic[]][] {
        if (!uri) return [...this.issues.values()].map((d) => [d.uri, d.diagnostics] as [Uri, SpellingDiagnostic[]]);
        return this.issues.get(uri.toString())?.diagnostics || [];
    }

    public getUrisWithIssues(): Uri[] {
        return [...this.issues.values()].filter((d) => d.diagnostics.length).map((d) => d.uri);
    }

    public onDidChangeDiagnostics(fn: (e: DiagnosticChangeEvent) => void) {
        return this.subscribable.subscribe(fn);
    }

    public readonly dispose = this.disposables.dispose;

    private handleDiagsFromServer(diags: DiagnosticsFromServer) {
        this.issues.set(diags.uri.toString(), diags);
        this.subscribable.notify({ uris: [diags.uri] });
    }

    private handleDocClose(doc: TextDocument) {
        const uri = doc.uri.toString();
        this.issues.delete(uri);
    }
}

export interface SpellingDiagnostic extends Diagnostic {
    data?: SpellCheckerDiagnosticData;
}
