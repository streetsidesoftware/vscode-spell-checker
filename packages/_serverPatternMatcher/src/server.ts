import { log, setWorkspaceBase } from '@internal/common-utils/log';
import type { Disposable, InitializeParams, InitializeResult, ServerCapabilities } from 'vscode-languageserver/node';
import { createConnection, ProposedFeatures, TextDocuments, TextDocumentSyncKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import type * as Api from './api';
import type { MatchResult, RegExpMatches } from './PatternMatcher';
import { PatternMatcher } from './PatternMatcher';

log('Starting Pattern Matcher Server');

export function run(): void {
    const disposables: Disposable[] = [];

    const requestMethodApi: Api.ServerRequestApiHandlers = {
        matchPatternsInDocument: handleMatchPatternsInDocument,
    };

    // Create a connection for the server. The connection uses Node's IPC as a transport
    log('Create Connection');
    const connection = createConnection(ProposedFeatures.all);

    // Create a simple text document manager.
    const documents = new TextDocuments(TextDocument);
    const patternMatcher = new PatternMatcher();

    connection.onInitialize((params: InitializeParams): InitializeResult => {
        // Hook up the logger to the connection.
        log('onInitialize');
        setWorkspaceBase(params.workspaceFolders?.[0].uri ?? '');
        const capabilities: ServerCapabilities = {
            // Tell the client that the server works in text document sync mode
            textDocumentSync: {
                openClose: true,
                change: TextDocumentSyncKind.Incremental,
                willSave: true,
                save: { includeText: true },
            },
        };
        return { capabilities };
    });

    async function handleMatchPatternsInDocument(params: Api.MatchPatternsToDocumentRequest): Promise<Api.MatchPatternsToDocumentResult> {
        const { uri, patterns, settings } = params;
        const doc = uri && documents.get(uri);
        if (!doc) {
            return {
                uri,
                version: -1,
                patternMatches: [],
                message: 'Document not found.',
            };
        }
        const text = doc.getText();
        const version = doc.version;
        const result = await patternMatcher.matchPatternsInText(patterns, text, settings);
        const emptyResult = { ranges: [], message: undefined };
        function mapMatch(r: RegExpMatches): Api.RegExpMatchResults {
            const { elapsedTimeMs, message, regexp, ranges } = { ...emptyResult, ...r };
            return {
                regexp: regexp.toString(),
                elapsedTime: elapsedTimeMs,
                matches: ranges,
                errorMessage: message,
            };
        }
        function mapResult(r: MatchResult): Api.PatternMatch {
            return {
                name: r.name,
                defs: r.matches.map(mapMatch),
            };
        }
        const patternMatches = result.map(mapResult);
        return {
            uri,
            version,
            patternMatches,
        };
    }

    // Register API Handlers
    Object.entries(requestMethodApi).forEach(([name, fn]) => {
        connection.onRequest(name, fn);
    });

    // Make the text document manager listen on the connection
    // for open, change and close text document events
    documents.listen(connection);

    disposables.push(
        // Remove subscriptions when a document closes.
        patternMatcher,
    );

    // Free up the validation streams on shutdown.
    connection.onShutdown(() => {
        disposables.forEach((d) => d.dispose());
        disposables.length = 0;
    });

    // Listen on the connection
    connection.listen();
}
