import {
    LanguageClient, LanguageClientOptions, ServerOptions, TransportKind,
    ForkOptions
} from 'vscode-languageclient';

import * as vscode from 'vscode';

import {
    GetConfigurationForDocumentResult,
    NotifyServerMethods,
    ServerRequestMethodResults,
    ServerRequestMethodConstants,
    SplitTextIntoWordsResult,
    ServerRequestMethodRequests,
} from '../server';
import * as Settings from '../settings';

import * as LanguageIds from '../settings/languageIds';
import { Maybe, supportedSchemes, setOfSupportedSchemes } from '../util';

// The debug options for the server
const debugExecArgv = ['--nolazy', '--inspect=60048'];

const diagnosticCollectionName = 'cSpell';

export interface ServerResponseIsSpellCheckEnabled {
    languageEnabled?: boolean;
    fileEnabled?: boolean;
}

export interface ServerResponseIsSpellCheckEnabledForFile extends ServerResponseIsSpellCheckEnabled {
    uri: vscode.Uri;
}

const methodNames: ServerRequestMethodConstants = {
    isSpellCheckEnabled: 'isSpellCheckEnabled',
    getConfigurationForDocument: 'getConfigurationForDocument',
    splitTextIntoWords: 'splitTextIntoWords',
    spellingSuggestions: 'spellingSuggestions',
    matchPatternsInDocument: 'matchPatternsInDocument',
};

export class CSpellClient {

    readonly client: LanguageClient;
    readonly import: Set<string> = new Set();
    readonly languageIds: Set<string>;
    readonly allowedSchemas: Set<string>;

    /**
     * @param: {string} module -- absolute path to the server module.
     */
    constructor(module: string, languageIds: string[]) {
        const enabledLanguageIds = Settings.getScopedSettingFromVSConfig('enabledLanguageIds', Settings.Scopes.Workspace);
        this.allowedSchemas = new Set(
            Settings.getScopedSettingFromVSConfig('allowedSchemas', Settings.Scopes.Workspace) || supportedSchemes
        );
        setOfSupportedSchemes.clear();
        this.allowedSchemas.forEach(schema => setOfSupportedSchemes.add(schema));

        this.languageIds = new Set(
            languageIds
            .concat(enabledLanguageIds || [])
            .concat(LanguageIds.languageIds)
        );
        const uniqueLangIds = [...this.languageIds];
        const documentSelector = [...this.allowedSchemas]
            .map(scheme => uniqueLangIds.map(language => ({ language, scheme })))
            .reduce( (a, b) => a.concat(b));
        // Options to control the language client
        const clientOptions: LanguageClientOptions = {
            documentSelector,
            diagnosticCollectionName,
            synchronize: {
                // Synchronize the setting section 'spellChecker' to the server
                configurationSection: ['cSpell', 'search']
            }
        };

        const execArgv = this.calcServerArgs();
        const options: ForkOptions = { execArgv };
        // The debug options for the server
        const debugOptions: ForkOptions = { execArgv: [...execArgv, ...debugExecArgv] };

        // If the extension is launched in debug mode the debug server options are use
        // Otherwise the run options are used
        const serverOptions: ServerOptions = {
            run : { module, transport: TransportKind.ipc, options },
            debug: { module, transport: TransportKind.ipc, options: debugOptions }
        };

        // Create the language client and start the client.
        this.client = new LanguageClient('cspell', 'Code Spell Checker', serverOptions, clientOptions);
        this.client.registerProposedFeatures();
    }

    public needsStart() {
        return this.client.needsStart();
    }

    public needsStop() {
        return this.client.needsStop();
    }

    public start() {
        return this.client.start();
    }

    public async isSpellCheckEnabled(document: vscode.TextDocument): Promise<ServerResponseIsSpellCheckEnabledForFile> {
        const { uri, languageId = '' } = document;

        if (!uri || !languageId) {
            return { uri };
        }
        const response = (await this.sendRequest(
            methodNames.isSpellCheckEnabled,
            { uri: uri.toString(), languageId }
        ));
        return { ...response, uri };
    }

    public async getConfigurationForDocument(document: vscode.TextDocument | undefined): Promise<GetConfigurationForDocumentResult> {
        if (!document) {
            return this.sendRequest(methodNames.getConfigurationForDocument, {});
        }

        const { uri, languageId = '' } = document;

        if (!uri || !languageId) {
            return this.sendRequest(methodNames.getConfigurationForDocument, {});
        }

        return this.sendRequest(methodNames.getConfigurationForDocument, { uri: uri.toString(), languageId });
    }

    public async matchPatternsInDocument(document: vscode.TextDocument, patterns: string[]) {
        return this.sendRequest(methodNames.matchPatternsInDocument, { uri: document.uri.toString(), patterns })
    }

    public splitTextIntoDictionaryWords(text: string): Thenable<SplitTextIntoWordsResult> {
        return this.sendRequest(
            methodNames.splitTextIntoWords,
            text
        );
    }

    public notifySettingsChanged() {
        return this.client.onReady().then(() => this.sendNotification('onConfigChange'));
    }

    public registerConfiguration(path: string) {
        return this.client.onReady().then(() => this.sendNotification('registerConfigurationFile', path));
    }

    get diagnostics(): Maybe<vscode.DiagnosticCollection> {
        return (this.client && this.client.diagnostics) || undefined;
    }

    public triggerSettingsRefresh() {
        return this.notifySettingsChanged();
    }

    private async sendRequest<K extends keyof ServerRequestMethodRequests>(
        method: K,
        param: ServerRequestMethodRequests[K]
    ): Promise<ServerRequestMethodResults[K]> {
        await this.client.onReady();
        return this.client.sendRequest(method, param);
    }

    private sendNotification(method: NotifyServerMethods, params?: any): void {
        this.client.sendNotification(method, params);
    }

    public static create(module: string) {
        return vscode.languages.getLanguages().then(langIds => new CSpellClient(module, langIds));
    }

    public isLookBackSupported(): boolean {
        try {
            return /(?<=\s)x/.test(' x');
        } catch (_) {
        }
        return false;
    }

    private calcServerArgs(): string[] {
        const args: string[] = [];
        if (!this.isLookBackSupported()) {
            args.push('--harmony_regexp_lookbehind');
        }
        return args;
    }
}
