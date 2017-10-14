import {
    LanguageClient, LanguageClientOptions, ServerOptions, TransportKind
} from 'vscode-languageclient';

import * as vscode from 'vscode';

import { CSpellUserSettings, GetConfigurationForDocumentResult, RequestMethodConstants, SplitTextIntoWordsResult } from '../server';
import * as Settings from '../settings';

import * as LanguageIds from '../settings/languageIds';
import { Maybe, uniqueFilter } from '../util';

// The debug options for the server
const debugOptions = { execArgv: ['--nolazy', '--inspect=60048'] };

export interface ServerResponseIsSpellCheckEnabled {
    languageEnabled?: boolean;
    fileEnabled?: boolean;
}

const methodNames: RequestMethodConstants = {
    isSpellCheckEnabled: 'isSpellCheckEnabled',
    getConfigurationForDocument: 'getConfigurationForDocument',
    splitTextIntoWords: 'splitTextIntoWords',
};


export class CSpellClient {

    readonly client: LanguageClient;
    readonly import: Set<string> = new Set();

    /**
     * @param: {string} module -- absolute path to the server module.
     */
    constructor(module: string, languageIds: string[]) {
        const enabledLanguageIds = Settings.getSettingFromVSConfig('enabledLanguageIds');
        const scheme = 'file';
        const uniqueLangIds = languageIds
            .concat(enabledLanguageIds || [])
            .concat(LanguageIds.languageIds)
            .filter(uniqueFilter());
        const documentSelector =
            uniqueLangIds.map(language => ({ language, scheme }))
            .concat(uniqueLangIds.map(language => ({ language, scheme: 'untitled' })));
        // Options to control the language client
        const clientOptions: LanguageClientOptions = {
            documentSelector,
            diagnosticCollectionName: 'cSpell Checker',
            synchronize: {
                // Synchronize the setting section 'spellChecker' to the server
                configurationSection: ['cSpell', 'search']
            }
        };

        // If the extension is launched in debug mode the debug server options are use
        // Otherwise the run options are used
        const serverOptions: ServerOptions = {
            run : { module, transport: TransportKind.ipc },
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

    public isSpellCheckEnabled(document: vscode.TextDocument): Thenable<ServerResponseIsSpellCheckEnabled> {
        const { uri, languageId = '' } = document;

        if (!uri || !languageId) {
            return Promise.resolve({});
        }

        return this.client.onReady().then(() => this.client.sendRequest(
            methodNames.isSpellCheckEnabled,
            { uri: uri.toString(), languageId }
        ))
        .then((response: ServerResponseIsSpellCheckEnabled) => response);
    }

    public getConfigurationForDocument(document: vscode.TextDocument): Thenable<GetConfigurationForDocumentResult> {
        const { uri, languageId = '' } = document;

        if (!uri || !languageId) {
            return Promise.resolve({});
        }

        return this.client.onReady().then(() => this.client.sendRequest(
            methodNames.getConfigurationForDocument,
            { uri: uri.toString(), languageId }
        ));
    }

    public splitTextIntoDictionaryWords(text: string): Thenable<SplitTextIntoWordsResult> {
        return this.client.onReady().then(() => this.client.sendRequest(
            methodNames.splitTextIntoWords,
            text
        ));
    }

    public applySettings(settings: { cSpell: CSpellUserSettings, search: any }) {
        return this.client.onReady().then(() => this.client.sendNotification('applySettings', { settings }));
    }

    public registerConfiguration(path: string) {
        return this.client.onReady().then(() => this.client.sendNotification('registerConfigurationFile', path));
    }

    get diagnostics(): Maybe<vscode.DiagnosticCollection> {
        return (this.client && this.client.diagnostics) || undefined;
    }

    public triggerSettingsRefresh() {
        const workspaceConfig = vscode.workspace.getConfiguration();
        const cSpell = workspaceConfig.get('cSpell') as CSpellUserSettings;
        const search = workspaceConfig.get('search');
        this.applySettings({ cSpell, search });
    }

    public static create(module: string) {
        return vscode.languages.getLanguages().then(langIds => new CSpellClient(module, langIds));
    }
}
