import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind, ForkOptions } from 'vscode-languageclient/node';

import { DiagnosticCollection, Disposable, languages as vsCodeSupportedLanguages, TextDocument, Uri } from 'vscode';

import {
    GetConfigurationForDocumentResult,
    SplitTextIntoWordsResult,
    IsSpellCheckEnabledResult,
    NamedPattern,
    MatchPatternsToDocumentResult,
    createServerApi,
    ServerApi,
} from '../server';
import * as Settings from '../settings';

import * as LanguageIds from '../settings/languageIds';
import { Maybe, supportedSchemes, setOfSupportedSchemes } from '../util';

// The debug options for the server
const debugExecArgv = ['--nolazy', '--inspect=60048'];

const diagnosticCollectionName = 'cSpell';

export interface ServerResponseIsSpellCheckEnabled extends Partial<IsSpellCheckEnabledResult> {}

export interface ServerResponseIsSpellCheckEnabledForFile extends ServerResponseIsSpellCheckEnabled {
    uri: Uri;
}

export class CSpellClient {
    readonly client: LanguageClient;
    readonly import: Set<string> = new Set();
    readonly languageIds: Set<string>;
    readonly allowedSchemas: Set<string>;

    private serverApi: ServerApi;

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
    }

    public needsStart(): boolean {
        return this.client.needsStart();
    }

    public needsStop(): boolean {
        return this.client.needsStop();
    }

    public start(): Disposable {
        return this.client.start();
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

    public async notifySettingsChanged(): Promise<void> {
        await this.client.onReady();
        return this.serverApi.onConfigChange();
    }

    public async registerConfiguration(path: string): Promise<void> {
        await this.client.onReady();
        return this.serverApi.registerConfigurationFile(path);
    }

    get diagnostics(): Maybe<DiagnosticCollection> {
        return (this.client && this.client.diagnostics) || undefined;
    }

    public triggerSettingsRefresh(): Promise<void> {
        return this.notifySettingsChanged();
    }

    public static create(module: string): Promise<CSpellClient> {
        return Promise.resolve(vsCodeSupportedLanguages.getLanguages().then((langIds) => new CSpellClient(module, langIds)));
    }

    private calcServerArgs(): string[] {
        const args: string[] = [];
        return args;
    }
}
