import { performance, toMilliseconds } from './util/perf';
performance.mark('cspell_start_extension');
import * as path from 'path';
performance.mark('import 1');
import { setEnableSpellChecking, sectionCSpell } from './settings';
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

import { userCommandOnCurrentSelectionOrPrompt, handlerApplyTextEdits } from './commands';
performance.mark('import 9');
import * as commands from './commands';
performance.mark('import 10');

import * as settingsViewer from './infoViewer/infoView';
import { ExtensionApi } from './extensionApi';

import * as modules from './modules';

import * as ExtensionRegEx from './extensionRegEx';
import { registerCspellInlineCompletionProviders } from './autocomplete';
import { updateDocumentRelatedContext } from './context';

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

    function triggerGetSettings() {
        client.triggerSettingsRefresh();
    }

    function splitTextFn(
        apply: (word: string, uri: string | vscode.Uri | null | undefined) => Thenable<void>
    ): (word: string, uri: string | vscode.Uri | null | undefined) => Thenable<void> {
        return (word: string, uri: string | vscode.Uri | null | undefined) => {
            const editor = vscode.window.activeTextEditor;
            const document = editor && editor.document;
            const uriToUse = uri || (document && document.uri) || null;
            return client
                .splitTextIntoDictionaryWords(word)
                .then((result) => result.words)
                .then((words) => apply(words.join(' '), uriToUse));
        };
    }

    function dumpPerfTimeline() {
        performance.getEntries().forEach((entry) => {
            console.log(entry.name, toMilliseconds(entry.startTime), entry.duration);
        });
    }

    const actionAddWordToFolder = userCommandOnCurrentSelectionOrPrompt(
        'Add Word to Folder Dictionary',
        splitTextFn(commands.addWordToFolderDictionary)
    );
    const actionAddWordToWorkspace = userCommandOnCurrentSelectionOrPrompt(
        'Add Word to Workspace Dictionaries',
        splitTextFn(commands.addWordToWorkspaceDictionary)
    );
    const actionAddWordToDictionary = userCommandOnCurrentSelectionOrPrompt(
        'Add Word to User Dictionary',
        splitTextFn(commands.addWordToUserDictionary)
    );

    const actionAddIgnoreWord = userCommandOnCurrentSelectionOrPrompt(
        'Ignore Word',
        splitTextFn((word, uri) => commands.addIgnoreWordToTarget(word, settings.Target.WorkspaceFolder, uri))
    );
    const actionAddIgnoreWordToFolder = userCommandOnCurrentSelectionOrPrompt(
        'Ignore Word in Folder Settings',
        splitTextFn((word, uri) => commands.addIgnoreWordToTarget(word, settings.Target.WorkspaceFolder, uri))
    );
    const actionAddIgnoreWordToWorkspace = userCommandOnCurrentSelectionOrPrompt(
        'Ignore Word in Workspace Settings',
        splitTextFn((word, uri) => commands.addIgnoreWordToTarget(word, settings.Target.Workspace, uri))
    );
    const actionAddIgnoreWordToUser = userCommandOnCurrentSelectionOrPrompt(
        'Ignore Word in User Settings',
        splitTextFn((word, uri) => commands.addIgnoreWordToTarget(word, settings.Target.Global, uri))
    );

    const actionRemoveWordFromFolderDictionary = userCommandOnCurrentSelectionOrPrompt(
        'Remove Word from Folder Dictionary',
        splitTextFn(commands.removeWordFromFolderDictionary)
    );
    const actionRemoveWordFromWorkspaceDictionary = userCommandOnCurrentSelectionOrPrompt(
        'Remove Word from Workspace Dictionaries',
        splitTextFn(commands.removeWordFromWorkspaceDictionary)
    );
    const actionRemoveWordFromDictionary = userCommandOnCurrentSelectionOrPrompt(
        'Remove Word from Global Dictionary',
        splitTextFn(commands.removeWordFromUserDictionary)
    );

    initStatusBar(context, client);

    for (const [cmd, handler] of Object.entries(commands.commandsFromServer)) {
        vscode.commands.registerCommand(cmd, handler);
    }

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(
        vscode.commands.registerCommand('cSpell.editText', handlerApplyTextEdits(client.client)),

        vscode.commands.registerCommand('cSpell.addWordToDictionarySilent', commands.addWordToFolderDictionary),
        vscode.commands.registerCommand('cSpell.addWordToWorkspaceDictionarySilent', commands.addWordToWorkspaceDictionary),
        vscode.commands.registerCommand('cSpell.addWordToUserDictionarySilent', commands.addWordToUserDictionary),

        vscode.commands.registerCommand('cSpell.addWordToDictionary', actionAddWordToFolder), // Note: this command is for backwards compatibility.
        vscode.commands.registerCommand('cSpell.addWordToFolderDictionary', actionAddWordToFolder),
        vscode.commands.registerCommand('cSpell.addWordToWorkspaceDictionary', actionAddWordToWorkspace),
        vscode.commands.registerCommand('cSpell.addWordToUserDictionary', actionAddWordToDictionary),

        vscode.commands.registerCommand('cSpell.addIgnoreWord', actionAddIgnoreWord),
        vscode.commands.registerCommand('cSpell.addIgnoreWordToFolder', actionAddIgnoreWordToFolder),
        vscode.commands.registerCommand('cSpell.addIgnoreWordToWorkspace', actionAddIgnoreWordToWorkspace),
        vscode.commands.registerCommand('cSpell.addIgnoreWordToUser', actionAddIgnoreWordToUser),

        vscode.commands.registerCommand('cSpell.removeWordFromFolderDictionary', actionRemoveWordFromFolderDictionary),
        vscode.commands.registerCommand('cSpell.removeWordFromWorkspaceDictionary', actionRemoveWordFromWorkspaceDictionary),
        vscode.commands.registerCommand('cSpell.removeWordFromUserDictionary', actionRemoveWordFromDictionary),

        vscode.commands.registerCommand('cSpell.enableLanguage', commands.enableLanguageId),
        vscode.commands.registerCommand('cSpell.disableLanguage', commands.disableLanguageId),
        vscode.commands.registerCommand('cSpell.enableForGlobal', () => setEnableSpellChecking(settings.Target.Global, true)),
        vscode.commands.registerCommand('cSpell.disableForGlobal', () => setEnableSpellChecking(settings.Target.Global, false)),
        vscode.commands.registerCommand('cSpell.toggleEnableForGlobal', () =>
            commands.toggleEnableSpellChecker(settings.ConfigurationTarget.Global)
        ),
        vscode.commands.registerCommand('cSpell.enableForWorkspace', () => setEnableSpellChecking(settings.Target.Workspace, true)),
        vscode.commands.registerCommand('cSpell.disableForWorkspace', () => setEnableSpellChecking(settings.Target.Workspace, false)),
        vscode.commands.registerCommand('cSpell.toggleEnableSpellChecker', () =>
            commands.toggleEnableSpellChecker(settings.ConfigurationTarget.Workspace)
        ),
        vscode.commands.registerCommand('cSpell.enableCurrentLanguage', commands.enableCurrentLanguage),
        vscode.commands.registerCommand('cSpell.disableCurrentLanguage', commands.disableCurrentLanguage),
        vscode.commands.registerCommand('cSpell.logPerfTimeline', dumpPerfTimeline),
        settings.watchSettingsFiles(triggerGetSettings),
        vscode.workspace.onDidSaveTextDocument(handleOnDidSaveTextDocument),
        vscode.workspace.onDidRenameFiles(handleRenameFile),
        vscode.workspace.onDidDeleteFiles(handleDeleteFile),
        vscode.workspace.onDidCreateFiles(handleCreateFile),
        vscode.window.onDidChangeActiveTextEditor(handleOnDidChangeActiveTextEditor),
        vscode.window.onDidChangeVisibleTextEditors(handleOnDidChangeVisibleTextEditors),

        ...registerCspellInlineCompletionProviders(),

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
        updateDocumentRelatedContext(client, e?.document).catch();
    }

    function handleOnDidChangeVisibleTextEditors(_e: vscode.TextEditor[]) {
        updateDocumentRelatedContext(client, vscode.window.activeTextEditor?.document).catch();
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
