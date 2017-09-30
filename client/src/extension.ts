import * as path from 'path';
import {setEnableSpellChecking} from './settings';
import * as settings from './settings';
import * as infoViewer from './infoViewer';
import {CSpellClient} from './client';

import { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';

import { initStatusBar } from './statusbar';

import {userCommandAddWordToDictionary, handlerApplyTextEdits} from './commands';
import * as commands from './commands';

export function activate(context: ExtensionContext) {

    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));

    // Get the cSpell Client
    const server = CSpellClient.create(serverModule).then(client => {
        // Start the client.
        const clientDispose = client.start();

        function triggerGetSettings() {
            client.triggerSettingsRefresh();
        }

        function splitTextFn(apply: (word: string) => Thenable<void>): (word: string) => Thenable<void> {
            return (word: string) => {
                return client.splitTextIntoDictionaryWords(word)
                .then(result => result.words)
                .then(words => apply(words.join(' ')))
                .then(_ => {});
            };
        }

        const actionAddWordToWorkspace = userCommandAddWordToDictionary(
            'Add Word to Workspace Dictionary',
            splitTextFn(commands.addWordToWorkspaceDictionary)
        );
        const actionAddWordToDictionary = userCommandAddWordToDictionary(
            'Add Word to Dictionary',
            splitTextFn(commands.addWordToUserDictionary)
        );

        initStatusBar(context, client);

        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        context.subscriptions.push(
            clientDispose,
            vscode.commands.registerCommand('cSpell.editText', handlerApplyTextEdits(client.client)),
            vscode.commands.registerCommand('cSpell.addWordToDictionarySilent', commands.addWordToWorkspaceDictionary),
            vscode.commands.registerCommand('cSpell.addWordToUserDictionarySilent', commands.addWordToUserDictionary),
            vscode.commands.registerCommand('cSpell.addWordToDictionary', actionAddWordToWorkspace),
            vscode.commands.registerCommand('cSpell.addWordToUserDictionary', actionAddWordToDictionary),
            vscode.commands.registerCommand('cSpell.enableLanguage', commands.enableLanguageId),
            vscode.commands.registerCommand('cSpell.disableLanguage', commands.disableLanguageId),
            vscode.commands.registerCommand('cSpell.enableForWorkspace', () => setEnableSpellChecking(true, false)),
            vscode.commands.registerCommand('cSpell.disableForWorkspace', () => setEnableSpellChecking(false, false)),
            vscode.commands.registerCommand('cSpell.toggleEnableSpellChecker', commands.toggleEnableSpellChecker),
            vscode.commands.registerCommand('cSpell.enableCurrentLanguage', commands.enableCurrentLanguage),
            vscode.commands.registerCommand('cSpell.disableCurrentLanguage', commands.disableCurrentLanguage),
            settings.watchSettingsFiles(triggerGetSettings),
        );

        infoViewer.activate(context, client);

        function registerConfig(path: string) {
            client.registerConfiguration(path);
        }

        return {
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
            updateSettings: settings.updateSettings,
        };
    });

    return server;
}
