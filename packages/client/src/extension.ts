import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';
import { Utils as UriUtils } from 'vscode-uri';
import { registerCspellInlineCompletionProviders } from './autocomplete';
import { CSpellClient } from './client';
import * as commands from './commands';
import { updateDocumentRelatedContext } from './context';
import * as di from './di';
import { ExtensionApi } from './extensionApi';
import * as ExtensionRegEx from './extensionRegEx';
import * as settingsViewer from './infoViewer/infoView';
import * as modules from './modules';
import * as settings from './settings';
import { ConfigTargetLegacy, sectionCSpell } from './settings';
import { initStatusBar } from './statusbar';
import { logErrors, silenceErrors } from './util/errors';
import { performance } from './util/perf';

performance.mark('cspell_done_import');

modules.init();

export async function activate(context: ExtensionContext): Promise<ExtensionApi> {
    performance.mark('cspell_activate_start');

    // Get the cSpell Client
    const client = await CSpellClient.create(context);
    context.subscriptions.push(client);

    di.set('client', client);
    di.set('extensionContext', context);

    ExtensionRegEx.activate(context, client);

    // Start the client.
    context.subscriptions.push(client.start());

    function triggerGetSettings(delayInMs = 0) {
        setTimeout(() => silenceErrors(client.triggerSettingsRefresh(), 'triggerGetSettings'), delayInMs);
    }

    function triggerConfigChange() {
        triggerGetSettings();
    }

    initStatusBar(context, client);

    const configWatcher = vscode.workspace.createFileSystemWatcher(settings.configFileLocationGlob);

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(
        configWatcher,
        configWatcher.onDidChange(triggerConfigChange),
        configWatcher.onDidCreate(triggerConfigChange),
        configWatcher.onDidDelete(triggerConfigChange),
        vscode.workspace.onDidSaveTextDocument(handleOnDidSaveTextDocument),
        vscode.workspace.onDidRenameFiles(handleRenameFile),
        vscode.workspace.onDidDeleteFiles(handleDeleteFile),
        vscode.workspace.onDidCreateFiles(handleCreateFile),
        vscode.workspace.onDidOpenTextDocument(handleOpenFile),
        vscode.window.onDidChangeActiveTextEditor(handleOnDidChangeActiveTextEditor),
        vscode.window.onDidChangeVisibleTextEditors(handleOnDidChangeVisibleTextEditors),
        vscode.languages.onDidChangeDiagnostics(handleOnDidChangeDiagnostics),

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

    registerCspellInlineCompletionProviders(context.subscriptions).catch(() => {});

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

    function handleOpenFile(doc: vscode.TextDocument) {
        detectPossibleCSpellConfigChange([doc.uri]);
    }

    function handleOnDidChangeActiveTextEditor(e?: vscode.TextEditor) {
        logErrors(updateDocumentRelatedContext(client, e?.document), 'handleOnDidChangeActiveTextEditor');
    }

    function handleOnDidChangeVisibleTextEditors(_e: readonly vscode.TextEditor[]) {
        logErrors(updateDocumentRelatedContext(client, vscode.window.activeTextEditor?.document), 'handleOnDidChangeVisibleTextEditors');
    }

    function handleOnDidChangeDiagnostics(e: vscode.DiagnosticChangeEvent) {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) return;

        const uris = new Set(e.uris.map((u) => u.toString()));
        if (uris.has(activeTextEditor.document.uri.toString())) {
            setTimeout(() => {
                logErrors(updateDocumentRelatedContext(client, activeTextEditor.document), 'handleOnDidChangeDiagnostics');
            }, 10);
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

    const methods = {
        enableLocale: (target: ConfigTargetLegacy | boolean, locale: string) => commands.enableDisableLocaleLegacy(target, locale, true),
        disableLocale: (target: ConfigTargetLegacy | boolean, locale: string) => commands.enableDisableLocaleLegacy(target, locale, false),
    };

    const server = {
        registerConfig,
        triggerGetSettings,
        enableLanguageId: commands.enableLanguageIdCmd,
        disableLanguageId: commands.disableLanguageIdCmd,
        enableCurrentLanguage: commands.enableCurrentLanguage,
        disableCurrentLanguage: commands.disableCurrentLanguage,
        addWordToUserDictionary: commands.addWordToUserDictionary,
        addWordToWorkspaceDictionary: commands.addWordToWorkspaceDictionary,
        enableLocale: methods.enableLocale,
        disableLocale: methods.disableLocale,
        updateSettings: () => false,
        cSpellClient: () => client,
        getConfigurationForDocument: (doc: vscode.TextDocument) => client.getConfigurationForDocument(doc),

        // Legacy
        enableLocal: methods.enableLocale,
        disableLocal: methods.disableLocale,
    };

    performance.mark('cspell_activate_end');
    performance.measure('cspell_activation', 'cspell_activate_start', 'cspell_activate_end');
    return server;
}

performance.mark('cspell_done_load');
