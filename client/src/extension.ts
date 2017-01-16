import * as path from 'path';
import * as CSpellSettings from './CSpellSettings';
import {CSpellUserSettings, CSpellPackageSettings} from './CSpellSettings';
import * as Rx from 'rx';
import * as R from 'ramda';

import { workspace, ExtensionContext, commands, window, TextEditor } from 'vscode';
import * as vscode from 'vscode';
import {
    LanguageClient, LanguageClientOptions, ServerOptions, TransportKind,
    TextEdit, Protocol2Code
} from 'vscode-languageclient';

// const extensionId        = 'streetsidesoftware.code-spell-checker'
const baseConfigName        = CSpellSettings.defaultFileName;
const configFileWatcherGlob = `**/${baseConfigName}}`;
const findConfig            = `{${baseConfigName},.vscode/${baseConfigName}}`;

interface SettingsInfo {
    path: string;
    settings: CSpellUserSettings;
}

function getDefaultWorkspaceConfigLocation() {
    const { rootPath } = workspace;
    return rootPath
        ? path.join(rootPath, baseConfigName)
        : undefined;
}

function getSettingsFromConfig(): CSpellUserSettings {
    const config = workspace.getConfiguration();
    return config.get<CSpellUserSettings>('cSpell') || {};
}

function getSettings(): Rx.Observable<SettingsInfo> {
    return Rx.Observable.fromPromise(workspace.findFiles(findConfig, '{**/node_modules,**/.git}'))
        .flatMap(matches => {
            if (!matches || !matches.length) {
                const defaultSettings = CSpellSettings.getDefaultSettings();
                const { language = defaultSettings.language } = getSettingsFromConfig();
                const settings = { ...defaultSettings, language };
                return Rx.Observable.just(getDefaultWorkspaceConfigLocation())
                    .map(path => (<SettingsInfo>{ path, settings}));
            } else {
                const path = matches[0].fsPath;
                return Rx.Observable.fromPromise(CSpellSettings.readSettings(path))
                    .map(settings => (<SettingsInfo>{ path, settings }));
            }
        });
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

function addWordToWorkspaceDictionary(word: string) {
    getSettings()
        .toArray()
        .subscribe(foundSettingsInfo => {
            // find the one with the shortest path
            const settingsInfo =  foundSettingsInfo.sort((a, b) => {
                const aLen = (a.path && a.path.length) || 4096;
                const bLen = (b.path && b.path.length) || 4096;
                return aLen - bLen;
            })[0];

            const {path, settings} = settingsInfo;
            if (path === undefined) {
                // The path is undefined if the workspace consists of a single file.  In that case, we need to add the word
                // to the global userWords.
                addWordToUserDictionary(word);
            } else {
                settings.words.push(word);
                settings.words = R.uniq(settings.words);
                CSpellSettings.updateSettings(path, settings);
            }
    });
}

function addWordToUserDictionary(word: string) {
    const config = workspace.getConfiguration();
    const userWords = config.get<string[]>('cSpell.userWords');
    userWords.push(word);
    config.update('cSpell.userWords', R.uniq(userWords), true);
}

function userCommandAddWordToDictionary(prompt: string, fnAddWord) {
    return function () {
        const { activeTextEditor = {} } = window;
        const { selection, document } = activeTextEditor as TextEditor;
        const range = selection && document ? document.getWordRangeAtPosition(selection.active) : undefined;
        const value = range ? document.getText(selection) || document.getText(range) : '';
        window.showInputBox({prompt, value}).then(word => {
            if (word) {
                fnAddWord(word);
            }
        });
    };
}

function setEnableSpellChecking(enabled: boolean) {
    workspace.getConfiguration().update('cSpell.enabled', enabled);
}

interface ServerResponseIsSpellCheckEnabled {
    languageEnabled?: boolean;
    fileEnabled?: boolean;
}

function initStatusBar(context: ExtensionContext, client: LanguageClient) {

    const sbCheck = window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    function updateStatusBarWithSpellCheckStatus(e: TextEditor) {
        if (!e) {
            return;
        }
        const { uri = { fsPath: undefined }, languageId = '' } = e.document || {uri: { fsPath: undefined }, languageId: ''};
        const genOnOffIcon = (on: boolean) => on ? '$(checklist)' : '$(stop)';
        sbCheck.color = 'white';
        sbCheck.text = '$(clock)';
        sbCheck.tooltip = 'cSpell waiting...';
        sbCheck.show();
        client.sendRequest({method: 'isSpellCheckEnabled'}, { uri: uri.toString(), languageId })
            .then((response: ServerResponseIsSpellCheckEnabled) => {
                const { activeTextEditor } = window;
                if (activeTextEditor && activeTextEditor.document) {
                    const { document } = activeTextEditor;
                    if (document.uri === uri) {
                        const { languageEnabled = true, fileEnabled = true } = response;
                        const isChecked = languageEnabled && fileEnabled;
                        const isCheckedText = isChecked ? 'is' : 'is NOT';
                        const langReason = languageEnabled ? '' : `The "${languageId}" language is not enabled.`;
                        const fileReason = fileEnabled ? '' : `The file path is excluded in settings.`;
                        const fileName = path.basename(uri.fsPath);
                        const langText = `${genOnOffIcon(languageEnabled)} ${languageId}`;
                        const fileText = `${genOnOffIcon(fileEnabled)} ${fileName}`;
                        const reason = [`"${fileName}" ${isCheckedText} spell checked.`, langReason, fileReason].filter(a => !!a).join(' ');
                        sbCheck.text = `${langText} | ${fileText}`;
                        sbCheck.tooltip = reason;
                        sbCheck.show();
                    }
                }
            });
    }

    function onDidChangeActiveTextEditor(e: TextEditor) {
        const settings: CSpellPackageSettings = workspace.getConfiguration().get('cSpell') as CSpellPackageSettings;
        const { enabled, showStatus = true } = settings;

        if (!showStatus) {
            sbCheck.hide();
            return;
        }

        if (enabled) {
            updateStatusBarWithSpellCheckStatus(e);
        } else {
            sbCheck.text = '$(stop) cSpell';
            sbCheck.tooltip = 'Enable spell checking';
            sbCheck.command = 'cSpell.enableForWorkspace';
            sbCheck.show();
        }
    }

    function onDidChangeConfiguration() {
        if (window.activeTextEditor) {
            onDidChangeActiveTextEditor(window.activeTextEditor);
        }
    }

    sbCheck.text = '$(clock)';
    sbCheck.show();

    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor),
        workspace.onDidChangeConfiguration(onDidChangeConfiguration),
        sbCheck
    );

    if (window.activeTextEditor) {
        onDidChangeActiveTextEditor(window.activeTextEditor);
    }

}

export function activate(context: ExtensionContext) {

    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));
    // The debug options for the server
    const debugOptions = { execArgv: ['--nolazy', '--debug=60048'] };

    // If the extension is launched in debug mode the debug server options are use
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run : { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };


    const configWatcher = workspace.createFileSystemWatcher(configFileWatcherGlob);
    const workspaceConfig = workspace.getConfiguration();
    const settings: CSpellPackageSettings = workspaceConfig.get('cSpell') as CSpellPackageSettings;


    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: settings.enabledLanguageIds,
        diagnosticCollectionName: 'cSpell Checker',
        synchronize: {
            // Synchronize the setting section 'spellChecker' to the server
            configurationSection: ['cSpell', 'search']
        }
    };

    // Create the language client and start the client.
    const client = new LanguageClient('Code Spell Checker', serverOptions, clientOptions);
    const clientDispose = client.start();

    function triggerGetSettings() {
        const cSpell = workspaceConfig.get('cSpell') as CSpellPackageSettings;
        const search = workspaceConfig.get('search') as CSpellPackageSettings;
        client.sendNotification({method: 'applySettings'}, { settings: { cSpell, search }});
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
        commands.registerCommand('cSpell.enableForWorkspace', () => setEnableSpellChecking(true)),
        commands.registerCommand('cSpell.disableForWorkspace', () => setEnableSpellChecking(false)),
        configWatcher.onDidChange(triggerGetSettings),
        configWatcher.onDidCreate(triggerGetSettings),
        configWatcher.onDidDelete(triggerGetSettings)
    );
}
