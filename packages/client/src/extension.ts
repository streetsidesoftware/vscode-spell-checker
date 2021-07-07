import { performance } from './util/perf';
performance.mark('cspell_start_extension');
import * as path from 'path';
performance.mark('import 1');
import { sectionCSpell } from './settings';
performance.mark('import 2');
import * as settings from './settings';
performance.mark('import 3');
import { Utils as UriUtils } from 'vscode-uri';
performance.mark('import 4');
import { CSpellClient } from './client';
performance.mark('import 5');

import { ExtensionContext } from 'vscode';

import * as di from './di';

performance.mark('import 6');
import * as vscode from 'vscode';
performance.mark('import 7');

import { initStatusBar } from './statusbar';
performance.mark('import 8');

performance.mark('import 9');
import * as commands from './commands';
performance.mark('import 10');

import * as settingsViewer from './infoViewer/infoView';
import { ExtensionApi } from './extensionApi';

import * as modules from './modules';

import * as ExtensionRegEx from './extensionRegEx';
import { registerCspellInlineCompletionProviders } from './autocomplete';
import { updateDocumentRelatedContext } from './context';
import { logErrors, silenceErrors } from './util/errors';

performance.mark('cspell_done_import');

modules.init();

export async function activate(context: ExtensionContext): Promise<ExtensionApi> {
    performance.mark('cspell_activate_start');

    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('packages/_server/dist/main.js'));
    // Get the cSpell Client
    const client = await CSpellClient.create(serverModule);
    context.subscriptions.push(client);

    di.set('client', client);
    di.set('extensionContext', context);

    ExtensionRegEx.activate(context, client);

    // Start the client.
    context.subscriptions.push(client.start());

    function triggerGetSettings(delayInMs = 0) {
        setTimeout(() => silenceErrors(client.triggerSettingsRefresh()), delayInMs);
    }

    initStatusBar(context, client);

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(
        settings.watchSettingsFiles(triggerGetSettings),
        vscode.workspace.onDidSaveTextDocument(handleOnDidSaveTextDocument),
        vscode.workspace.onDidRenameFiles(handleRenameFile),
        vscode.workspace.onDidDeleteFiles(handleDeleteFile),
        vscode.workspace.onDidCreateFiles(handleCreateFile),
        vscode.window.onDidChangeActiveTextEditor(handleOnDidChangeActiveTextEditor),
        vscode.window.onDidChangeVisibleTextEditors(handleOnDidChangeVisibleTextEditors),
        vscode.languages.onDidChangeDiagnostics(handleOnDidChangeDiagnostics),

        ...registerCspellInlineCompletionProviders(),
        ...commands.registerCommands(),

        /*
         * We need to listen for all change events and see of `cSpell` section changed.
         * When it does, we have to trigger the server to fetch the settings again.
         * This is to handle a bug in the language-server synchronize configuration. It will not synchronize
         * if the section didn't already exist. This leads to a poor user experience in situations like
         * adding a word to be ignored for the first time.
         */
        vscode.workspace.onDidChangeConfiguration(handleOnDidChangeConfiguration)
    );

    function handleOnDidChangeConfiguration(event: vscode.ConfigurationChangeEvent) {
        if (event.affectsConfiguration(sectionCSpell)) {
            triggerGetSettings();
        }
    }

    /** Watch for changes to possible configuration files. */
    function handleOnDidSaveTextDocument(event: vscode.TextDocument) {
        detectPossibleCSpellConfigChange([event.uri]);
    }

    function handleRenameFile(event: vscode.FileRenameEvent) {
        const uris = event.files.map((f) => f.newUri).concat(event.files.map((f) => f.oldUri));
        detectPossibleCSpellConfigChange(uris);
    }

    function handleDeleteFile(event: vscode.FileDeleteEvent) {
        detectPossibleCSpellConfigChange(event.files);
    }

    function handleCreateFile(event: vscode.FileCreateEvent) {
        detectPossibleCSpellConfigChange(event.files);
    }

    function handleOnDidChangeActiveTextEditor(e?: vscode.TextEditor) {
        logErrors(updateDocumentRelatedContext(client, e?.document));
    }

    function handleOnDidChangeVisibleTextEditors(_e: vscode.TextEditor[]) {
        logErrors(updateDocumentRelatedContext(client, vscode.window.activeTextEditor?.document));
    }

    function handleOnDidChangeDiagnostics(e: vscode.DiagnosticChangeEvent) {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) return;

        const uris = new Set(e.uris.map((u) => u.toString()));
        if (uris.has(activeTextEditor.document.uri.toString())) {
            logErrors(updateDocumentRelatedContext(client, activeTextEditor.document));
        }
    }

    function detectPossibleCSpellConfigChange(files: ReadonlyArray<vscode.Uri>) {
        for (const uri of files) {
            if (settings.configFilesToWatch.has(UriUtils.basename(uri))) {
                triggerGetSettings();
                break;
            }
        }
    }

    // infoViewer.activate(context, client);
    settingsViewer.activate(context, client);

    function registerConfig(path: string) {
        client.registerConfiguration(path);
    }

    const server = {
        registerConfig,
        triggerGetSettings,
        enableLanguageId: commands.enableLanguageId,
        disableLanguageId: commands.disableLanguageId,
        enableCurrentLanguage: commands.enableCurrentLanguage,
        disableCurrentLanguage: commands.disableCurrentLanguage,
        addWordToUserDictionary: commands.addWordToUserDictionary,
        addWordToWorkspaceDictionary: commands.addWordToWorkspaceDictionary,
        enableLocale: settings.enableLocale,
        disableLocale: settings.disableLocale,
        updateSettings: () => false,
        cSpellClient: () => client,
        getConfigurationForDocument: (doc: vscode.TextDocument) => client.getConfigurationForDocument(doc),

        // Legacy
        enableLocal: settings.enableLocale,
        disableLocal: settings.disableLocale,
    };

    performance.mark('cspell_activate_end');
    performance.measure('cspell_activation', 'cspell_activate_start', 'cspell_activate_end');
    return server;
}

performance.mark('cspell_done_load');
