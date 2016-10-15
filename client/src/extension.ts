import * as path from 'path';
import * as CSpellSettings from './CSpellSettings';
import * as Rx from 'rx';
import * as _ from 'lodash';
import * as os from 'os';

import { workspace, ExtensionContext, commands, window } from 'vscode';
import {
    LanguageClient, LanguageClientOptions, ServerOptions, TransportKind,
    TextEdit, Protocol2Code
} from 'vscode-languageclient';

// const extensionId = 'streetsidesoftware.code-spell-checker'
const baseConfigName = CSpellSettings.defaultFileName;
const findConfig = `.vscode/${baseConfigName}`;

const settingsStream = new Rx.ReplaySubject<CSpellUserSettings>(1);

interface SettingsInfo {
    path: string;
    settings: CSpellUserSettings;
}

function getDefaultWorkspaceConfigLocation() {
    const { rootPath } = workspace;
    return rootPath
        ? path.join(rootPath, '.vscode', baseConfigName)
        : undefined;
}

function getSettings(): Rx.Observable<SettingsInfo> {
    return Rx.Observable.fromPromise(workspace.findFiles(findConfig, '{**/node_modules,**/.git}'))
        .flatMap(matches => {
            if (!matches || !matches.length) {
                const settings = CSpellSettings.getDefaultSettings();
                return Rx.Observable.just(getDefaultWorkspaceConfigLocation())
                    .map(path => (<SettingsInfo>{ path, settings}));
            } else {
                const path = matches[0].fsPath;
                return Rx.Observable.fromPromise(CSpellSettings.readSettings(path))
                    .map(settings => (<SettingsInfo>{ path, settings }));
            }
        });
}

function triggerGetSettings() {
    // Send the current settings to the server.
    return getSettings()
        .map(({settings}) => settings)
        .subscribe(settings => settingsStream.onNext(settings));
}


function applyTextEdits(uri: string, documentVersion: number, edits: TextEdit[]) {
    const textEditor = window.activeTextEditor;
    if (textEditor && textEditor.document.uri.toString() === uri) {
        if (textEditor.document.version !== documentVersion) {
            window.showInformationMessage(`Spelling changes are outdated and cannot be applied to the document.`);
        }
        textEditor.edit(mutator => {
            for (const edit of edits) {
                mutator.replace(Protocol2Code.asRange(edit.range), edit.newText);
            }
        }).then((success) => {
            if (!success) {
                window.showErrorMessage('Failed to apply spelling changes to the document.');
            }
        });
    }
}

function addWordToDictionary(word: string) {
    getSettings().subscribe(settingsInfo => {
        const {path, settings} = settingsInfo;
        if (path === undefined) {
            // The path is undefined if the workspace consists of a single file.  In that case, we need to add the word
            // to the global userWords.
            addWordToUserDictionary(word);
        } else {
            settings.words.push(word);
            settings.words = _.uniq(settings.words);
            CSpellSettings.updateSettings(path, settings);
        }
    });
}

function addWordToUserDictionary(word: string) {
    const config = workspace.getConfiguration();
    const userWords = config.get<string[]>('cSpell.userWords');
    userWords.push(word);
    config.update('cSpell.userWords', _.uniq(userWords), true);
}

function userCommandAddWordToDictionary(fnAddWord) {
    return function () {
        window.showInputBox({prompt: 'Word:', value: ''}).then(word => {
            if (word) {
                fnAddWord(word);
            }
        });
    };
}


export function activate(context: ExtensionContext) {

    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));
    // The debug options for the server
    const debugOptions = { execArgv: ['--nolazy', '--debug=60047'] };

    // If the extension is launched in debug mode the debug server options are use
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run : { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };


    const configWatcher = workspace.createFileSystemWatcher(findConfig);
    const workspaceConfig = workspace.getConfiguration();
    const settings: CSpellPackageSettings = workspaceConfig.get('cSpell') as CSpellPackageSettings;


    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: settings.enabledLanguageIds,
        synchronize: {
            // Synchronize the setting section 'spellChecker' to the server
            configurationSection: ['cSpell', 'search', 'file']
        }
    };

    // Create the language client and start the client.
    const client = new LanguageClient('Code Spell Checker', serverOptions, clientOptions);
    const clientDispose = client.start();

    const disposableSettingsSubscription = settingsStream.subscribe(settings => {
        client.sendNotification({method: 'applySettings'}, settings);
    });

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(
        clientDispose,
        commands.registerCommand('cSpell.editText', applyTextEdits),
        commands.registerCommand('cSpell.addWordToDictionarySilent', addWordToDictionary),
        commands.registerCommand('cSpell.addWordToUserDictionarySilent', addWordToUserDictionary),
        commands.registerCommand('cSpell.addWordToDictionary', userCommandAddWordToDictionary(addWordToDictionary)),
        commands.registerCommand('cSpell.addWordToUserDictionary', userCommandAddWordToDictionary(addWordToUserDictionary)),
        disposableSettingsSubscription,
        configWatcher.onDidChange(triggerGetSettings),
        configWatcher.onDidCreate(triggerGetSettings),
        configWatcher.onDidDelete(triggerGetSettings)
    );

    // For now, triggering the settings isn't necessary.  This will become more important later.
    // triggerGetSettings();
}
