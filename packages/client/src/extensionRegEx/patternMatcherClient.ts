import type { Disposable, ExtensionContext, TextDocument } from 'vscode';
import type { ForkOptions, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';

import { logErrors } from '../util/errors';
import type { MatchPatternsToDocumentResult, NamedPattern, PatternMatcherServerApi, PatternSettings } from './server';
import { createServerApi } from './server';

const debugExecArgv = ['--nolazy', '--inspect=60148'];

const enableDebugLogging = false;

export class PatternMatcherClient implements Disposable {
    readonly client: LanguageClient;
    readonly serverApi: PatternMatcherServerApi;

    public static create(context: ExtensionContext): PatternMatcherClient {
        return new PatternMatcherClient(context);
    }

    constructor(context: ExtensionContext) {
        const module = context.asAbsolutePath('packages/_serverPatternMatcher/dist/main.cjs');

        // Create the language client and start the client.
        // Options to control the language client
        const clientOptions: LanguageClientOptions = {
            documentSelector: [{ scheme: 'file' }, { scheme: 'untitled' }],
            diagnosticCollectionName: 'cspell-pattern-matcher',
            initializationFailedHandler: (error) => {
                console.error('Server initialization failed. %o', error);
                return false;
            },
        };

        const execArgv: string[] = [];
        const options: ForkOptions = { execArgv };
        // The debug options for the server
        const debugOptions: ForkOptions = { execArgv: [...execArgv, ...debugExecArgv] };

        // If the extension is launched in debug mode the debug server options are use
        // Otherwise the run options are used
        const serverOptions: ServerOptions = {
            run: { module, transport: TransportKind.ipc, options },
            debug: { module, transport: TransportKind.ipc, options: debugOptions },
        };

        this.client = new LanguageClient(
            'cspell-pattern-matcher',
            serverOptions,
            clientOptions,
            // true
        );
        this.client.registerProposedFeatures();
        this.serverApi = createServerApi(this.client);
        logErrors(this.initWhenReady(), 'Init Pattern Matcher Server');
    }

    public async matchPatternsInDocument(
        document: TextDocument,
        patterns: (string | NamedPattern)[],
        settings: PatternSettings,
    ): Promise<MatchPatternsToDocumentResult> {
        return this.serverApi.matchPatternsInDocument({ uri: document.uri.toString(), patterns, settings });
    }

    public dispose(): void {
        debugLog('Dispose: Pattern Matcher Client');
        this.client.stop();
    }

    public onReady(): Promise<void> {
        return this.client.start();
    }

    private async initWhenReady() {
        debugLog('waiting initWhenReady');
        await this.onReady();
        debugLog('done initWhenReady');
    }
}

const debugLog: typeof console.log = (...params) => {
    if (enableDebugLogging) {
        console.log(...params);
    }
};
