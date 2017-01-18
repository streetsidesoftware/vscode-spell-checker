import * as path from 'path';
import {CSpellPackageSettings} from './CSpellSettings';
import {configFileWatcherGlob, setEnableSpellChecking} from './settings';
import * as cSpellInfoPreview from './cSpellInfoPreview';
import {CSpellClient} from './cSpellClient';

import { workspace, ExtensionContext, commands } from 'vscode';

import { initStatusBar } from './statusbar';

import {userCommandAddWordToDictionary, addWordToUserDictionary, addWordToWorkspaceDictionary, applyTextEdits} from './commands';

export function activate(context: ExtensionContext) {

    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));

    // Get the cSpell Client
    const client = new CSpellClient(serverModule);

    const configWatcher = workspace.createFileSystemWatcher(configFileWatcherGlob);

    // Start the client.
    const clientDispose = client.start();

    function triggerGetSettings() {
        const workspaceConfig = workspace.getConfiguration();
        const cSpell = workspaceConfig.get('cSpell') as CSpellPackageSettings;
        const search = workspaceConfig.get('search');
        client.applySettings({ cSpell, search });
    }

    const actionAddWordToWorkspace = userCommandAddWordToDictionary('Add Word to Workspace Dictionary', addWordToWorkspaceDictionary);
    const actionAddWordToDictionary = userCommandAddWordToDictionary('Add Word to Dictionary', addWordToUserDictionary);

    initStatusBar(context, client);

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(
        clientDispose,
        commands.registerCommand('cSpell.editText', applyTextEdits),
        commands.registerCommand('cSpell.addWordToDictionarySilent', addWordToWorkspaceDictionary),
        commands.registerCommand('cSpell.addWordToUserDictionarySilent', addWordToUserDictionary),
        commands.registerCommand('cSpell.addWordToDictionary', actionAddWordToWorkspace),
        commands.registerCommand('cSpell.addWordToUserDictionary', actionAddWordToDictionary),
        commands.registerCommand('cSpell.enableForWorkspace', () => setEnableSpellChecking(true, false)),
        commands.registerCommand('cSpell.disableForWorkspace', () => setEnableSpellChecking(false, false)),
        configWatcher.onDidChange(triggerGetSettings),
        configWatcher.onDidCreate(triggerGetSettings),
        configWatcher.onDidDelete(triggerGetSettings)
    );

    cSpellInfoPreview.activate(context, client);
}
