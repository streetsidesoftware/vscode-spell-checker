import { logger } from '@internal/common-utils/log';
import { setOfSupportedSchemes, supportedSchemes } from '@internal/common-utils/uriHelper';
import type {
    ConfigFieldSelector,
    ConfigurationFields,
    GetConfigurationTargetsResult,
    SpellingSuggestionsResult,
    WorkspaceConfigForDocument,
} from 'code-spell-checker-server/api';
import { extractEnabledSchemeList, extractKnownFileTypeIds } from 'code-spell-checker-server/lib';
import type { DisposableHybrid } from 'utils-disposables';
import type { CodeAction, Diagnostic, DiagnosticCollection, ExtensionContext, Range, TextDocument } from 'vscode';
import { Disposable, languages as vsCodeSupportedLanguages, Uri, workspace } from 'vscode';

import { diagnosticSource } from '../constants.js';
import { isLcCodeAction, mapDiagnosticToLc, mapLcCodeAction, mapRangeToLc } from '../languageServer/clientHelpers.js';
import type { Inspect } from '../settings/index.mjs';
import * as Settings from '../settings/index.mjs';
import { ConfigFields, inspectConfigKeys, sectionCSpell } from '../settings/index.mjs';
import * as LanguageIds from '../settings/languageIds.js';
import { createBroadcaster } from '../util/broadcaster.js';
import { extractUriFromConfigurationScope, findConicalDocumentScope } from '../util/documentUri.js';
import { logErrors, silenceErrors, toError } from '../util/errors.js';
import type { Maybe } from '../util/index.mjs';
import { Resolvable } from './Resolvable.js';
import type {
    FieldExistsInTarget,
    GetConfigurationForDocumentResult,
    IsSpellCheckEnabledResult,
    OnSpellCheckDocumentStep,
    ServerApi,
    WorkspaceConfigForDocumentRequest,
    WorkspaceConfigForDocumentResponse,
} from './server/index.mjs';
import { createServerApi, requestCodeAction } from './server/index.mjs';
import type { CodeActionParams, ForkOptions, LanguageClientOptions, ServerOptions } from './vscode-languageclient.js';
import {
    CodeActionContext as VSCodeLangClientCodeActionContext,
    LanguageClient,
    TextDocumentIdentifier as VSCodeLangClientTextDocumentIdentifier,
    TransportKind as VSCodeLangClientTransportKind,
} from './vscode-languageclient.js';

export { GetConfigurationForDocumentResult } from './server/index.mjs';

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
    readonly import = new Set<string>();
    readonly languageIds: Set<string>;
    readonly allowedSchemas: Set<string>;

    serverApi: ServerApi;
    private disposables = new Set<Disposable>();
    private broadcasterOnSpellCheckDocument = createBroadcaster<OnSpellCheckDocumentStep>();
    private ready = new Resolvable<void>();

    /**
     * @param: {string} module -- absolute path to the server module.
     */
    constructor(context: ExtensionContext, languageIds: string[]) {
        // The server is implemented in node
        const module = context.asAbsolutePath('packages/_server/dist/main.cjs');

        const settings: Settings.CSpellSettings = {
            enabledLanguageIds: Settings.getScopedSettingFromVSConfig(ConfigFields.enabledLanguageIds, Settings.Scopes.Workspace),
            enableFiletypes: Settings.getScopedSettingFromVSConfig(ConfigFields.enableFiletypes, Settings.Scopes.Workspace),
            enabledFileTypes: Settings.getScopedSettingFromVSConfig(ConfigFields.enabledFileTypes, Settings.Scopes.Workspace),
            allowedSchemas:
                Settings.getScopedSettingFromVSConfig(ConfigFields.allowedSchemas, Settings.Scopes.Workspace) || supportedSchemes,
            enabledSchemes: Settings.getScopedSettingFromVSConfig(ConfigFields.enabledSchemes, Settings.Scopes.Workspace),
        };

        this.allowedSchemas = new Set(extractEnabledSchemeList(settings));
        setOfSupportedSchemes.clear();
        this.allowedSchemas.forEach((schema) => setOfSupportedSchemes.add(schema));

        this.languageIds = new Set([...languageIds, ...LanguageIds.languageIds, ...extractKnownFileTypeIds(settings)]);

        const uniqueLangIds = [...this.languageIds];
        const documentSelector = [...this.allowedSchemas].flatMap((scheme) => uniqueLangIds.map((language) => ({ language, scheme })));
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
        this.client = new LanguageClient('cspell', 'Code Spell Checker Server', serverOptions, clientOptions);
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

    public async restart(): Promise<void> {
        try {
            logger.log('Restarting the server');
            await this.client.restart();
            logger.log('Server restarted');
        } catch (e) {
            logger.error(`Failed to restart the server: ${toError(e).message}`);
        }
    }

    public async isSpellCheckEnabled(document: TextDocument): Promise<ServerResponseIsSpellCheckEnabledForFile> {
        const { uri, languageId = '' } = document;

        if (!uri || !languageId) {
            return { uri };
        }
        const response = await this.serverApi.isSpellCheckEnabled({ uri: uri.toString(), languageId });
        return { ...response, uri };
    }

    async getConfigurationTargets(document: TextDocument | TextDocumentInfo | undefined): Promise<GetConfigurationTargetsResult> {
        const { uri, languageId } = document || {};

        const emptyResult: GetConfigurationTargetsResult = {
            configTargets: [],
        };

        try {
            const workspaceConfig = calculateWorkspaceConfigForDocument(uri);
            if (!uri || !workspaceConfig.uri) {
                return await this.serverApi.getConfigurationTargets({ workspaceConfig });
            }
            return await this.serverApi.getConfigurationTargets({ uri: uri.toString(), languageId, workspaceConfig });
        } catch (e) {
            console.error(`Failed to get configuration for document: ${uri} ${languageId} ${e}`);
            return emptyResult;
        }
    }

    #getConfigurationForDocument = this.factoryGetConfigurationForDocument();

    getConfigurationForDocument<F extends ConfigurationFields>(
        document: TextDocument | TextDocumentInfo | undefined,
        fields: ConfigFieldSelector<F>,
    ): Promise<GetConfigurationForDocumentResult<F>> {
        return this.#getConfigurationForDocument(document, fields as ConfigFieldSelector<ConfigurationFields>);
    }

    private async _getConfigurationForDocument(
        document: TextDocument | TextDocumentInfo | undefined,
        fields: ConfigFieldSelector<ConfigurationFields>,
    ): Promise<GetConfigurationForDocumentResult<ConfigurationFields>> {
        const { uri, languageId } = document || {};

        const emptyResult: GetConfigurationForDocumentResult<ConfigurationFields> = {
            configFiles: [],
            configTargets: [],
            fileEnabled: false,
            fileIsIncluded: false,
            fileIsExcluded: false,
        };

        try {
            const workspaceConfig = calculateWorkspaceConfigForDocument(uri);
            if (!uri || !workspaceConfig.uri) {
                return await this.serverApi.getConfigurationForDocument({ workspaceConfig, fields });
            }
            return await this.serverApi.getConfigurationForDocument({ uri: uri.toString(), languageId, workspaceConfig, fields });
        } catch (e) {
            console.error(`Failed to get configuration for document: ${uri} ${languageId} ${e}`);
            return emptyResult;
        }
    }

    private cacheGetConfigurationForDocument = new Map<
        string | undefined,
        Promise<GetConfigurationForDocumentResult<ConfigurationFields>>
    >();

    private factoryGetConfigurationForDocument(): (
        document: TextDocument | TextDocumentInfo | undefined,
        fields: ConfigFieldSelector<ConfigurationFields>,
    ) => Promise<GetConfigurationForDocumentResult<ConfigurationFields>> {
        return (document: TextDocument | TextDocumentInfo | undefined, fields) => {
            const key = document?.uri?.toString() + ':' + Object.keys(fields).sort().join(',');
            const found = this.cacheGetConfigurationForDocument.get(key);
            if (found) return found;
            const result = this._getConfigurationForDocument(document, fields);
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

    public onDiagnostics(fn: (diags: DiagnosticsFromServer) => void): DisposableHybrid {
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
    const scopeUri = extractUriFromConfigurationScope(scope);
    const cfg = inspectConfigKeys(scope, ['words', 'userWords', 'ignoreWords']);
    const workspaceFile = workspace.workspaceFile?.toString();
    const workspaceFolder = scopeUri && workspace.getWorkspaceFolder(scopeUri)?.uri.toString();

    const allowFolder = workspaceFile !== undefined;

    const tUserWords = toConfigTarget(cfg.userWords, allowFolder);
    const tWords = toConfigTarget(cfg.words, allowFolder);
    const tIgnoreWords = toConfigTarget(cfg.ignoreWords, allowFolder);

    tWords.user = tUserWords.user;

    const resp: WorkspaceConfigForDocumentResponse = {
        uri: scopeUri?.toString(),
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
