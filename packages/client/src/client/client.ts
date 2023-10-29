import { setOfSupportedSchemes, supportedSchemes } from '@internal/common-utils/uriHelper';
import type { SpellingSuggestionsResult, WorkspaceConfigForDocument } from 'code-spell-checker-server/api';
import type { CodeAction, Diagnostic, DiagnosticCollection, ExtensionContext, Range, TextDocument } from 'vscode';
import { Disposable, languages as vsCodeSupportedLanguages, Uri, workspace } from 'vscode';
import type { CodeActionParams, ForkOptions, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';
import {
    CodeActionContext as VSCodeLangClientCodeActionContext,
    LanguageClient,
    TextDocumentIdentifier as VSCodeLangClientTextDocumentIdentifier,
    TransportKind as VSCodeLangClientTransportKind,
} from 'vscode-languageclient/node';

import { diagnosticSource } from '../constants';
import { isLcCodeAction, mapDiagnosticToLc, mapLcCodeAction, mapRangeToLc } from '../languageServer/clientHelpers';
import type { Inspect } from '../settings';
import * as Settings from '../settings';
import { inspectConfigKeys, sectionCSpell } from '../settings';
import * as LanguageIds from '../settings/languageIds';
import type { Maybe } from '../util';
import { createBroadcaster } from '../util/broadcaster';
import { findConicalDocumentScope } from '../util/documentUri';
import { logErrors, silenceErrors } from '../util/errors';
import { Resolvable } from './Resolvable';
import type {
    FieldExistsInTarget,
    GetConfigurationForDocumentResult,
    IsSpellCheckEnabledResult,
    OnSpellCheckDocumentStep,
    ServerApi,
    WorkspaceConfigForDocumentRequest,
    WorkspaceConfigForDocumentResponse,
} from './server';
import { createServerApi, requestCodeAction } from './server';

// The debug options for the server
const debugExecArgv = ['--nolazy', '--inspect=60048'];

const diagnosticCollectionName = diagnosticSource;

export type ServerResponseIsSpellCheckEnabled = Partial<IsSpellCheckEnabledResult>;

export interface ServerResponseIsSpellCheckEnabledForFile extends ServerResponseIsSpellCheckEnabled {
    uri: Uri;
}

const cacheTimeout = 2000;

interface TextDocumentInfo {
    uri?: Uri;
    languageId?: string;
}

export class CSpellClient implements Disposable {
    readonly client: LanguageClient;
    readonly import: Set<string> = new Set();
    readonly languageIds: Set<string>;
    readonly allowedSchemas: Set<string>;

    private serverApi: ServerApi;
    private disposables: Set<Disposable> = new Set();
    private broadcasterOnSpellCheckDocument = createBroadcaster<OnSpellCheckDocumentStep>();
    private ready: Resolvable<void> = new Resolvable();

    /**
     * @param: {string} module -- absolute path to the server module.
     */
    constructor(context: ExtensionContext, languageIds: string[]) {
        // The server is implemented in node
        const module = context.asAbsolutePath('packages/_server/dist/main.cjs');

        const enabledLanguageIds = Settings.getScopedSettingFromVSConfig('enabledLanguageIds', Settings.Scopes.Workspace);
        this.allowedSchemas = new Set(
            Settings.getScopedSettingFromVSConfig('allowedSchemas', Settings.Scopes.Workspace) || supportedSchemes,
        );
        setOfSupportedSchemes.clear();
        this.allowedSchemas.forEach((schema) => setOfSupportedSchemes.add(schema));

        this.languageIds = new Set([...languageIds, ...(enabledLanguageIds || []), ...LanguageIds.languageIds]);
        const uniqueLangIds = [...this.languageIds];
        const documentSelector = [...this.allowedSchemas]
            .map((scheme) => uniqueLangIds.map((language) => ({ language, scheme })))
            .reduce((a, b) => a.concat(b));
        // Options to control the language client
        const clientOptions: LanguageClientOptions = {
            documentSelector,
            diagnosticCollectionName,
            synchronize: {
                // Synchronize the setting section 'spellChecker' to the server
                configurationSection: [sectionCSpell, 'search'],
            },
            middleware: {
                handleDiagnostics(uri, diagnostics, next) {
                    // console.error(`${new Date().toISOString()} Client handleDiagnostics: ${uri.toString()}`);
                    next(uri, diagnostics);
                },
            },
        };

        const execArgv = this.calcServerArgs();
        const options: ForkOptions = { execArgv };
        // The debug options for the server
        const debugOptions: ForkOptions = { execArgv: [...execArgv, ...debugExecArgv] };

        // If the extension is launched in debug mode the debug server options are use
        // Otherwise the run options are used
        const serverOptions: ServerOptions = {
            run: { module, transport: VSCodeLangClientTransportKind.ipc, options },
            debug: { module, transport: VSCodeLangClientTransportKind.ipc, options: debugOptions },
        };

        // Create the language client and start the client.
        this.client = new LanguageClient('cspell', 'Code Spell Checker', serverOptions, clientOptions);
        this.client.registerProposedFeatures();
        this.serverApi = createServerApi(this.client);
        context.subscriptions.push(this.serverApi);
        this.initWhenReady();
    }

    public start(): Promise<void> {
        if (this.ready.isPending()) {
            this.ready.attach(this.client.start());
        }
        return this.ready.promise;
    }

    public async isSpellCheckEnabled(document: TextDocument): Promise<ServerResponseIsSpellCheckEnabledForFile> {
        const { uri, languageId = '' } = document;

        if (!uri || !languageId) {
            return { uri };
        }
        const response = await this.serverApi.isSpellCheckEnabled({ uri: uri.toString(), languageId });
        return { ...response, uri };
    }

    readonly getConfigurationForDocument = this.factoryGetConfigurationForDocument();

    private async _getConfigurationForDocument(
        document: TextDocument | TextDocumentInfo | undefined,
    ): Promise<GetConfigurationForDocumentResult> {
        const { uri, languageId } = document || {};

        const workspaceConfig = calculateWorkspaceConfigForDocument(uri);
        if (!uri) {
            return this.serverApi.getConfigurationForDocument({ workspaceConfig });
        }
        return this.serverApi.getConfigurationForDocument({ uri: uri.toString(), languageId, workspaceConfig });
    }

    private cacheGetConfigurationForDocument = new Map<string | undefined, Promise<GetConfigurationForDocumentResult>>();

    private factoryGetConfigurationForDocument(): (
        document: TextDocument | TextDocumentInfo | undefined,
    ) => Promise<GetConfigurationForDocumentResult> {
        return (document: TextDocument | TextDocumentInfo | undefined) => {
            const key = document?.uri?.toString();
            const found = this.cacheGetConfigurationForDocument.get(key);
            if (found) return found;
            const result = this._getConfigurationForDocument(document);
            this.cacheGetConfigurationForDocument.set(key, result);
            setTimeout(() => this.cacheGetConfigurationForDocument.delete(key), cacheTimeout);
            return result;
        };
    }

    public notifySettingsChanged(): Promise<void> {
        this.cacheGetConfigurationForDocument.clear();
        setTimeout(() => this.cacheGetConfigurationForDocument.clear(), 250);
        return silenceErrors(
            this.whenReady(() => this.serverApi.notifyConfigChange()),
            'notifySettingsChanged',
        );
    }

    public registerConfiguration(path: string): Promise<void> {
        return logErrors(
            this.whenReady(() => this.serverApi.registerConfigurationFile(path)),
            'registerConfiguration',
        );
    }

    get diagnostics(): Maybe<DiagnosticCollection> {
        return (this.client && this.client.diagnostics) || undefined;
    }

    public triggerSettingsRefresh(): Promise<void> {
        return this.notifySettingsChanged();
    }

    public async whenReady<R>(fn: () => R): Promise<Awaited<R>> {
        await this.onReady();
        return await fn();
    }

    private onReady(): Promise<void> {
        return this.ready.promise;
    }

    public static create(context: ExtensionContext): Promise<CSpellClient> {
        return Promise.resolve(vsCodeSupportedLanguages.getLanguages().then((langIds) => new CSpellClient(context, langIds)));
    }

    private registerDisposable(...disposables: Disposable[]) {
        for (const d of disposables) {
            this.disposables.add(d);
        }
    }

    public dispose(): void {
        this.client.stop();
        const toDispose = [...this.disposables];
        this.disposables.clear();
        Disposable.from(...toDispose).dispose();
    }

    private calcServerArgs(): string[] {
        const args: string[] = [];
        return args;
    }

    public onSpellCheckDocumentNotification(fn: (p: OnSpellCheckDocumentStep) => void): Disposable {
        return this.broadcasterOnSpellCheckDocument.listen(fn);
    }

    public async requestSpellingSuggestionsCodeActions(doc: TextDocument, range: Range, diagnostics: Diagnostic[]): Promise<CodeAction[]> {
        const params: CodeActionParams = {
            textDocument: VSCodeLangClientTextDocumentIdentifier.create(doc.uri.toString()),
            range: mapRangeToLc(range),
            context: VSCodeLangClientCodeActionContext.create(diagnostics.map(mapDiagnosticToLc)),
        };
        const r = await requestCodeAction(this.client, params);
        if (!r) return [];

        const actions = r.filter(isLcCodeAction).map(mapLcCodeAction);
        return actions;
    }

    public async requestSpellingSuggestions(word: string, document: TextDocument): Promise<SpellingSuggestionsResult> {
        const doc = { uri: document.uri.toString() };
        return this.serverApi.spellingSuggestions(word, doc);
    }

    public onDiagnostics(fn: (diags: DiagnosticsFromServer) => void) {
        return this.serverApi.onDiagnostics((pub) => {
            const cvt = this.client.protocol2CodeConverter;
            const uri = cvt.asUri(pub.uri);
            const diags: DiagnosticsFromServer = {
                uri,
                version: pub.version,
                diagnostics: pub.diagnostics.map((diag) => cvt.asDiagnostic(diag)),
            };
            return fn(diags);
        });
    }

    private async initWhenReady() {
        await this.onReady();
        this.registerHandleNotificationsFromServer();
        this.registerHandleOnWorkspaceConfigForDocumentRequest();
    }

    private registerHandleOnWorkspaceConfigForDocumentRequest() {
        this.registerDisposable(this.serverApi.onWorkspaceConfigForDocumentRequest(handleOnWorkspaceConfigForDocumentRequest));
    }

    private registerHandleNotificationsFromServer() {
        this.registerDisposable(this.serverApi.onSpellCheckDocument((p) => this.broadcasterOnSpellCheckDocument.send(p)));
    }
}

function handleOnWorkspaceConfigForDocumentRequest(req: WorkspaceConfigForDocumentRequest): WorkspaceConfigForDocumentResponse {
    const { uri } = req;
    const docUri = Uri.parse(uri);
    return calculateWorkspaceConfigForDocument(docUri);
}

function calculateWorkspaceConfigForDocument(docUri: Uri | undefined): WorkspaceConfigForDocument {
    const scope = findConicalDocumentScope(docUri);
    const cfg = inspectConfigKeys(scope, ['words', 'userWords', 'ignoreWords']);
    const workspaceFile = workspace.workspaceFile?.toString();
    const workspaceFolder = scope && workspace.getWorkspaceFolder(scope)?.uri.toString();

    const allowFolder = workspaceFile !== undefined;

    const tUserWords = toConfigTarget(cfg.userWords, allowFolder);
    const tWords = toConfigTarget(cfg.words, allowFolder);
    const tIgnoreWords = toConfigTarget(cfg.ignoreWords, allowFolder);

    tWords.user = tUserWords.user;

    const resp: WorkspaceConfigForDocumentResponse = {
        uri: docUri?.toString(),
        workspaceFile,
        workspaceFolder,
        words: tWords,
        ignoreWords: tIgnoreWords,
    };

    // console.log('handleOnWorkspaceConfigForDocumentRequest Req: %o Res: %o cfg: %o', req, resp, cfg);

    return resp;
}

function toConfigTarget<T>(ins: Inspect<T> | undefined, allowFolder: boolean): FieldExistsInTarget {
    if (!ins) return {};
    const { globalValue, workspaceValue, workspaceFolderValue } = ins;
    return {
        user: globalValue !== undefined || undefined,
        workspace: workspaceValue !== undefined || undefined,
        folder: allowFolder && (workspaceFolderValue !== undefined || undefined),
    };
}

export interface DiagnosticsFromServer {
    /**
     * The URI for which diagnostic information is reported.
     */
    uri: Uri;
    /**
     * Optional the version number of the document the diagnostics are published for.
     *
     * @since 3.15.0
     */
    version?: number;
    /**
     * An array of diagnostic information items.
     */
    diagnostics: Diagnostic[];
}
