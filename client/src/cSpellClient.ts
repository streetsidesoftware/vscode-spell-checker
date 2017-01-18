import {
    LanguageClient, LanguageClientOptions, ServerOptions, TransportKind
} from 'vscode-languageclient';

import * as vscode from 'vscode';

import { CSpellUserSettings } from './CSpellSettings';
import * as Settings from './settings';

import { languageIds } from './languageIds';
import { unique } from './util';

// The debug options for the server
const debugOptions = { execArgv: ['--nolazy', '--debug=60048'] };

export interface ServerResponseIsSpellCheckEnabled {
    languageEnabled?: boolean;
    fileEnabled?: boolean;
}

export class CSpellClient {

    readonly client: LanguageClient;

    /**
     * @param: {string} module -- absolute path to the server module.
     */
    constructor(module: string) {
        const enabledLanguageIds = Settings.getSettingFromConfig('enabledLanguageIds');
        const documentSelector = unique(languageIds.concat(enabledLanguageIds));
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
        this.client = new LanguageClient('Code Spell Checker', serverOptions, clientOptions);
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

        return this.client.sendRequest(
            {method: 'isSpellCheckEnabled'},
            { uri: uri.toString(), languageId }
        )
        .then((response: ServerResponseIsSpellCheckEnabled) => response);
    }

    public applySettings(settings: { cSpell: CSpellUserSettings, search: any }) {
        this.client.sendNotification({method: 'applySettings'}, { settings });
    }

    get diagnostics(): vscode.DiagnosticCollection {
        return this.client.diagnostics;
    }
}
