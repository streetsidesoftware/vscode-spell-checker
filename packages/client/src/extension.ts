import { performance, toMilliseconds } from './util/perf';
performance.mark('cspell_start_extension');
import * as path from 'path';
performance.mark('import 1');
import {setEnableSpellChecking} from './settings';
performance.mark('import 2');
import * as settings from './settings';
performance.mark('import 3');
performance.mark('import 4');
import {CSpellClient} from './client';
performance.mark('import 5');

import { ExtensionContext } from 'vscode';
performance.mark('import 6');
import * as vscode from 'vscode';
performance.mark('import 7');

import { initStatusBar } from './statusbar';
performance.mark('import 8');

import {userCommandOnCurrentSelectionOrPrompt, handlerApplyTextEdits} from './commands';
performance.mark('import 9');
import * as commands from './commands';
performance.mark('import 10');

import * as settingsViewer from './infoViewer/infoView';
import { ExtensionApi } from './extensionApi';

performance.mark('cspell_done_import');

export async function activate(context: ExtensionContext): Promise<ExtensionApi> {
    performance.mark('cspell_activate_start');

    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('server', 'server.js'));

    // Get the cSpell Client
    const client = await CSpellClient.create(serverModule);
    // Start the client.
    const clientDispose = client.start();

    function triggerGetSettings() {
        client.triggerSettingsRefresh();
    }

    function splitTextFn(
        apply: (word: string, uri: string | vscode.Uri | null | undefined) => Thenable<void>
    ): (word: string, uri: string | vscode.Uri | null | undefined) => Thenable<void> {
        return (word: string, uri: string | vscode.Uri | null | undefined) => {
            const editor = vscode.window.activeTextEditor;
            const document = editor && editor.document;
            const uriToUse = uri || document && document.uri || null;
            return client.splitTextIntoDictionaryWords(word)
                .then(result => result.words)
                .then(words => apply(words.join(' '), uriToUse));
        };
    }

    function dumpPerfTimeline() {
        performance.getEntries().forEach(entry => {
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

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(
        clientDispose,
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
        vscode.commands.registerCommand('cSpell.enableForWorkspace', () => setEnableSpellChecking(settings.Target.Workspace, true)),
        vscode.commands.registerCommand('cSpell.disableForWorkspace', () => setEnableSpellChecking(settings.Target.Workspace, false)),
        vscode.commands.registerCommand('cSpell.toggleEnableSpellChecker', commands.toggleEnableSpellChecker),
        vscode.commands.registerCommand('cSpell.enableCurrentLanguage', commands.enableCurrentLanguage),
        vscode.commands.registerCommand('cSpell.disableCurrentLanguage', commands.disableCurrentLanguage),
        vscode.commands.registerCommand('cSpell.logPerfTimeline', dumpPerfTimeline),
        settings.watchSettingsFiles(triggerGetSettings),
    );

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

        // Legacy
        enableLocal: settings.enableLocale,
        disableLocal: settings.disableLocale,
    };

    performance.mark('cspell_activate_end');
    performance.measure('cspell_activation', 'cspell_activate_start', 'cspell_activate_end');
    return server;
}
performance.mark('cspell_done_load');
