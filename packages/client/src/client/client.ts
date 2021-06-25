import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind, ForkOptions } from 'vscode-languageclient/node';

import { DiagnosticCollection, Disposable, languages as vsCodeSupportedLanguages, TextDocument, Uri, workspace } from 'vscode';

import {
    GetConfigurationForDocumentResult,
    SplitTextIntoWordsResult,
    IsSpellCheckEnabledResult,
    NamedPattern,
    MatchPatternsToDocumentResult,
    createServerApi,
    ServerApi,
    OnSpellCheckDocumentStep,
    WorkspaceConfigForDocumentRequest,
    WorkspaceConfigForDocumentResponse,
    ConfigurationTargets,
} from '../server';
import * as Settings from '../settings';

import * as LanguageIds from '../settings/languageIds';
import { Maybe, supportedSchemes, setOfSupportedSchemes } from '../util';
import { createBroadcaster } from '../util/broadcaster';
import { Inspect, inspectConfigKeys } from '../settings';

// The debug options for the server
const debugExecArgv = ['--nolazy', '--inspect=60048'];

const diagnosticCollectionName = 'cSpell';

export interface ServerResponseIsSpellCheckEnabled extends Partial<IsSpellCheckEnabledResult> {}

export interface ServerResponseIsSpellCheckEnabledForFile extends ServerResponseIsSpellCheckEnabled {
    uri: Uri;
}

export class CSpellClient implements Disposable {
    readonly client: LanguageClient;
    readonly import: Set<string> = new Set();
    readonly languageIds: Set<string>;
    readonly allowedSchemas: Set<string>;

    private serverApi: ServerApi;
    private disposables: Set<Disposable> = new Set();
    private broadcasterOnSpellCheckDocument = createBroadcaster<OnSpellCheckDocumentStep>();
    private initComplete: Promise<void>;

    /**
     * @param: {string} module -- absolute path to the server module.
     */
    constructor(module: string, languageIds: string[]) {
        const enabledLanguageIds = Settings.getScopedSettingFromVSConfig('enabledLanguageIds', Settings.Scopes.Workspace);
        this.allowedSchemas = new Set(
            Settings.getScopedSettingFromVSConfig('allowedSchemas', Settings.Scopes.Workspace) || supportedSchemes
        );
        setOfSupportedSchemes.clear();
        this.allowedSchemas.forEach((schema) => setOfSupportedSchemes.add(schema));

        this.languageIds = new Set(languageIds.concat(enabledLanguageIds || []).concat(LanguageIds.languageIds));
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
                configurationSection: ['cSpell', 'search'],
            },
        };

        const execArgv = this.calcServerArgs();
        const options: ForkOptions = { execArgv };
        // The debug options for the server
        const debugOptions: ForkOptions = { execArgv: [...execArgv, ...debugExecArgv] };

        // If the extension is launched in debug mode the debug server options are use
        // Otherwise the run options are used
        const serverOptions: ServerOptions = {
            run: { module, transport: TransportKind.ipc, options },
            debug: { module, transport: TransportKind.ipc, options: debugOptions },
        };

        // Create the language client and start the client.
        this.client = new LanguageClient('cspell', 'Code Spell Checker', serverOptions, clientOptions);
        this.client.registerProposedFeatures();
        this.serverApi = createServerApi(this.client);
        this.initComplete = this.initWhenReady();
    }

    public needsStart(): boolean {
        return this.client.needsStart();
    }

    public needsStop(): boolean {
        return this.client.needsStop();
    }

    public start(): Disposable {
        return this.exposeDisposable(this.client.start());
    }

    public async isSpellCheckEnabled(document: TextDocument): Promise<ServerResponseIsSpellCheckEnabledForFile> {
        const { uri, languageId = '' } = document;

        if (!uri || !languageId) {
            return { uri };
        }
        const response = await this.serverApi.isSpellCheckEnabled({ uri: uri.toString(), languageId });
        return { ...response, uri };
    }

    public async getConfigurationForDocument(document: TextDocument | undefined): Promise<GetConfigurationForDocumentResult> {
        if (!document) {
            return this.serverApi.getConfigurationForDocument({});
        }

        const { uri, languageId = '' } = document;

        if (!uri || !languageId) {
            return this.serverApi.getConfigurationForDocument({});
        }

        return this.serverApi.getConfigurationForDocument({ uri: uri.toString(), languageId });
    }

    public async matchPatternsInDocument(
        document: TextDocument,
        patterns: (string | NamedPattern)[]
    ): Promise<MatchPatternsToDocumentResult> {
        return this.serverApi.matchPatternsInDocument({ uri: document.uri.toString(), patterns });
    }

    public splitTextIntoDictionaryWords(text: string): Promise<SplitTextIntoWordsResult> {
        return this.serverApi.splitTextIntoWords(text);
    }

    public notifySettingsChanged(): Promise<void> {
        return this.whenReady(() => this.serverApi.notifyConfigChange());
    }

    public registerConfiguration(path: string): Promise<void> {
        return this.whenReady(() => this.serverApi.registerConfigurationFile(path));
    }

    get diagnostics(): Maybe<DiagnosticCollection> {
        return (this.client && this.client.diagnostics) || undefined;
    }

    public triggerSettingsRefresh(): Promise<void> {
        return this.notifySettingsChanged();
    }

    public async whenReady<R>(fn: () => R): Promise<R> {
        await this.client.onReady();
        return fn();
    }

    public static create(module: string): Promise<CSpellClient> {
        return Promise.resolve(vsCodeSupportedLanguages.getLanguages().then((langIds) => new CSpellClient(module, langIds)));
    }

    /**
     * @param d - internal disposable to register
     * @returns the disposable to hand out.
     */
    private exposeDisposable(d: Disposable): Disposable {
        this.registerDisposable(d);
        return new Disposable(() => this.disposeOf(d));
    }

    private registerDisposable(...disposables: Disposable[]) {
        for (const d of disposables) {
            this.disposables.add(d);
        }
    }

    private disposeOf(d: Disposable) {
        if (!this.disposables.has(d)) return;
        this.disposables.delete(d);
        d.dispose();
    }

    public dispose(): void {
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

    private async initWhenReady() {
        await this.client.onReady();
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

    const cfg = inspectConfigKeys(docUri, ['words', 'userWords', 'ignoreWords']);
    const workspaceFile = workspace.workspaceFile?.toString();
    const workspaceFolder = workspace.getWorkspaceFolder(docUri)?.uri.toString();

    const allowFolder = workspaceFile !== undefined;

    const tUserWords = toConfigTarget(cfg.userWords, allowFolder);
    const tWords = toConfigTarget(cfg.words, allowFolder);
    const tIgnoreWords = toConfigTarget(cfg.ignoreWords, allowFolder);

    tWords.user = tUserWords.user;

    const resp: WorkspaceConfigForDocumentResponse = {
        uri,
        workspaceFile,
        workspaceFolder,
        words: tWords,
        ignoreWords: tIgnoreWords,
    };

    // console.log('handleOnWorkspaceConfigForDocumentRequest Req: %o Res: %o cfg: %o', req, resp, cfg);

    return resp;
}

function toConfigTarget<T>(ins: Inspect<T> | undefined, allowFolder: boolean): ConfigurationTargets {
    if (!ins) return {};
    const { globalValue, workspaceValue, workspaceFolderValue } = ins;
    return {
        user: globalValue !== undefined || undefined,
        workspace: workspaceValue !== undefined || undefined,
        folder: allowFolder && (workspaceFolderValue !== undefined || undefined),
    };
}
