import { performance, toMilliseconds } from './util/perf';
performance.mark('cspell_start_extension');
import * as path from 'path';
performance.mark('import 1');
import {setEnableSpellChecking, ConfigTarget} from './settings';
performance.mark('import 2');
import * as settings from './settings';
performance.mark('import 3');
import * as infoViewer from './infoViewer';
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

performance.mark('cspell_done_import');

export interface ExtensionApi {
    registerConfig(path: string): void;
    triggerGetSettings(): void;
    enableLanguageId(languageId: string, uri?: string): Thenable<void>;
    disableLanguageId(languageId: string, uri?: string): Thenable<void>;
    enableCurrentLanguage(): Thenable<void>;
    disableCurrentLanguage(): Thenable<void>;
    addWordToUserDictionary(word: string): Thenable<void>;
    addWordToWorkspaceDictionary(word: string, uri?: string | null | vscode.Uri): Thenable<void>;
    enableLocal(target: ConfigTarget, local: string): Thenable<void>;
    disableLocal(target: ConfigTarget, local: string): Thenable<void>;
    updateSettings(): boolean;
    cSpellClient(): CSpellClient;
}

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
        apply: (word: string, uri: string | vscode.Uri | null) => Thenable<void>
    ): (word: string) => Thenable<void> {
        return (word: string) => {
            const editor = vscode.window.activeTextEditor;
            const document = editor && editor.document;
            const uri = document && document.uri || null;
            return client.splitTextIntoDictionaryWords(word)
                .then(result => result.words)
                .then(words => apply(words.join(' '), uri));
        };
    }

    function dumpPerfTimeline() {
        performance.getEntries().forEach(entry => {
            console.log(entry.name, toMilliseconds(entry.startTime), entry.duration);
        });
    }

    const actionAddWordToFolder = userCommandOnCurrentSelectionOrPrompt(
        'Add Word to Workspace Dictionary',
        splitTextFn(commands.addWordToFolderDictionary)
    );
    const actionAddWordToWorkspace = userCommandOnCurrentSelectionOrPrompt(
        'Add Word to Workspace Dictionary',
        splitTextFn(commands.addWordToWorkspaceDictionary)
    );
    const actionAddWordToDictionary = userCommandOnCurrentSelectionOrPrompt(
        'Add Word to Dictionary',
        splitTextFn(commands.addWordToUserDictionary)
    );

    const actionRemoveWordFromFolderDictionary = userCommandOnCurrentSelectionOrPrompt(
        'Remove Word from Dictionary',
        splitTextFn(commands.removeWordFromFolderDictionary)
    );
    const actionRemoveWordFromWorkspaceDictionary = userCommandOnCurrentSelectionOrPrompt(
        'Remove Word from Dictionary',
        splitTextFn(commands.removeWordFromWorkspaceDictionary)
    );
    const actionRemoveWordFromDictionary = userCommandOnCurrentSelectionOrPrompt(
        'Remove Word from Dictionary',
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
        vscode.commands.registerCommand('cSpell.addWordToDictionary', actionAddWordToFolder),
        vscode.commands.registerCommand('cSpell.addWordToWorkspaceDictionary', actionAddWordToWorkspace),
        vscode.commands.registerCommand('cSpell.addWordToUserDictionary', actionAddWordToDictionary),
        vscode.commands.registerCommand('cSpell.removeWordFromFolderDictionary', actionRemoveWordFromFolderDictionary),
        vscode.commands.registerCommand('cSpell.removeWordFromWorkspaceDictionary', actionRemoveWordFromWorkspaceDictionary),
        vscode.commands.registerCommand('cSpell.removeWordFromUserDictionary', actionRemoveWordFromDictionary),
        vscode.commands.registerCommand('cSpell.enableLanguage', commands.enableLanguageId),
        vscode.commands.registerCommand('cSpell.disableLanguage', commands.disableLanguageId),
        vscode.commands.registerCommand('cSpell.enableForWorkspace', () => setEnableSpellChecking(settings.Target.Workspace, false)),
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
        enableLocal: settings.enableLocal,
        disableLocal: settings.disableLocal,
        updateSettings: () => false,
        cSpellClient: () => client,
    };

    performance.mark('cspell_activate_end');
    performance.measure('cspell_activation', 'cspell_activate_start', 'cspell_activate_end');
    return server;
}
performance.mark('cspell_done_load');
