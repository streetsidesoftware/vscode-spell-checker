import { uriToName } from '@internal/common-utils';
import { logger } from '@internal/common-utils/log';
import type { ConfigFieldSelector, ConfigurationFields, OnBlockFile } from 'code-spell-checker-server/api';
import { createDisposableList } from 'utils-disposables';
import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { Utils as UriUtils } from 'vscode-uri';

import { registerActionsMenu } from './actionMenu.mjs';
import * as addWords from './addWords.mjs';
import { checkDocument } from './api.mjs';
import { registerCspellInlineCompletionProviders } from './autocomplete.mjs';
import { CSpellClient } from './client/index.mjs';
import { registerSpellCheckerCodeActionProvider } from './codeAction.mjs';
import type { InjectableCommandHandlers } from './commands.mjs';
import * as commands from './commands.mjs';
import { createConfigWatcher } from './configWatcher.mjs';
import { SpellingExclusionsDecorator, SpellingIssueDecorator } from './decorate.mjs';
import * as di from './di.mjs';
import { registerDiagWatcher } from './diags.mjs';
import type { ExtensionApi } from './extensionApi.mjs';
import * as ExtensionRegEx from './extensionRegEx/index.mjs';
import { IssueTracker } from './issueTracker.mjs';
import { activateFileIssuesViewer, activateIssueViewer } from './issueViewer/index.mjs';
import * as modules from './modules.mjs';
import { createTerminal, registerTerminalProfileProvider } from './repl/index.mjs';
import type { ConfigTargetLegacy, CSpellSettings } from './settings/index.mjs';
import * as settings from './settings/index.mjs';
import { sectionCSpell } from './settings/index.mjs';
import { getSectionName } from './settings/vsConfig.mjs';
import { createLanguageStatus } from './statusbar/languageStatus.mjs';
import { createEventLogger, updateDocumentRelatedContext } from './storage/index.mjs';
import { logErrors, silenceErrors } from './util/errors.js';
import { performance } from './util/perf.js';
import { isUriInAnyTab } from './vscode/tabs.mjs';
import { activate as activateWebview } from './webview/index.mjs';

performance.mark('cspell_done_import');

const debugMode = false;
let currLogLevel: CSpellSettings['logLevel'] = undefined;

modules.init();

export function activate(context: ExtensionContext): Promise<ExtensionApi> {
    try {
        performance.mark('cspell_activate_start');
        di.set('extensionContext', context);
        const eventLogger = createEventLogger(context.globalStorageUri);
        di.set('eventLogger', eventLogger);
        eventLogger.logActivate();

        setOutputChannelLogLevel();

        const eIssueTracker = new vscode.EventEmitter<IssueTracker>();
        const pIssueTracker = new Promise<IssueTracker>((resolve) => eIssueTracker.event(resolve));

        performance.mark('activateIssueViewer');
        activateIssueViewer(context, pIssueTracker);
        performance.mark('activateFileIssuesViewer');
        activateFileIssuesViewer(context, pIssueTracker);

        performance.mark('start_async_activate');
        return _activate(context, eIssueTracker).catch((e) => {
            throw activationError(e);
        });
    } catch (e) {
        throw activationError(e);
    }
}

function activationError(e: unknown) {
    return new Error(`Failed to activate: (${performance.getLastEventName()}) ${e}`, { cause: e });
}

async function _activate(context: ExtensionContext, eIssueTracker: vscode.EventEmitter<IssueTracker>): Promise<ExtensionApi> {
    const logOutput = vscode.window.createOutputChannel('Code Spell Checker', { log: true });
    const dLogger = bindLoggerToOutput(logOutput);

    // Get the cSpell Client
    performance.mark('create client');
    const client = await CSpellClient.create(context);
    context.subscriptions.push(client, logOutput, dLogger);

    di.set('client', client);

    if (debugMode) {
        // const cki = (await vscode.commands.executeCommand('getContextKeyInfo')) as { key: string }[];
        // const commands = await vscode.commands.getCommands();
        const dataFileUri = vscode.Uri.joinPath(context.globalStorageUri, 'data.json');
        console.log('Extension "Code Spell Checker" is now active! %o', {
            extensionUri: context.extensionUri.toJSON(),
            globalStorageUri: context.globalStorageUri.toJSON(),
            dataFileUri: dataFileUri.toJSON(),
            dataFileDirUri: vscode.Uri.joinPath(dataFileUri, '..').toJSON(),
            workspaceState: context.workspaceState.keys(),
            globalState: context.globalState.keys(),
        });
    }

    performance.mark('ExtensionRegEx.activate');
    ExtensionRegEx.activate(context, client);

    // Start the client.
    performance.mark('start client');
    await client.start();
    performance.mark('start IssueTracker');
    const issueTracker = new IssueTracker(client);
    di.set('issueTracker', issueTracker);
    eIssueTracker.fire(issueTracker);
    eIssueTracker.dispose();

    function triggerGetSettings(delayInMs = 0) {
        setTimeout(triggerGetSettingsNow, delayInMs);
    }

    function triggerGetSettingsNow() {
        silenceErrors(client.triggerSettingsRefresh(), 'triggerGetSettings')
            .then(() => {
                // settingsViewer.update();
                return;
            })
            .catch(() => undefined);
    }

    function triggerConfigChange(uri: vscode.Uri) {
        logger.log(`Configuration Change: ${uri.toString()}`);
        currLogLevel = undefined;
        triggerGetSettings();
    }

    performance.mark('createConfigWatcher');
    const configWatcher = createConfigWatcher();
    // console.log('config files: %o', await configWatcher.scanWorkspaceForConfigFiles());
    const decorator = new SpellingIssueDecorator(context, issueTracker);
    const decoratorExclusions = new SpellingExclusionsDecorator(context, client);

    const extensionCommand: InjectableCommandHandlers = {
        'cSpell.toggleTraceMode': () => decoratorExclusions.toggleVisible(),
        'cSpell.toggleVisible': () => decorator.toggleVisible(),
        'cSpell.show': () => (decorator.visible = true),
        'cSpell.hide': () => (decorator.visible = false),
        'cSpell.createCSpellTerminal': createTerminal,
    };

    performance.mark('register');

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(
        issueTracker,
        configWatcher,
        configWatcher.onDidChangeConfig(triggerConfigChange),
        vscode.workspace.onDidSaveTextDocument(handleOnDidSaveTextDocument),
        vscode.workspace.onDidRenameFiles(handleRenameFile),
        vscode.workspace.onDidDeleteFiles(handleDeleteFile),
        vscode.workspace.onDidCreateFiles(handleCreateFile),
        vscode.workspace.onDidOpenTextDocument(handleOpenFile),
        vscode.workspace.onDidChangeConfiguration(handleConfigChange),
        vscode.window.onDidChangeActiveTextEditor(handleOnDidChangeActiveTextEditor),
        vscode.window.onDidChangeVisibleTextEditors(handleOnDidChangeVisibleTextEditors),
        issueTracker.onDidChangeDiagnostics(handleOnDidChangeDiagnostics),
        decorator,
        decoratorExclusions,
        registerSpellCheckerCodeActionProvider(issueTracker),
        registerDiagWatcher(decorator.visible, decorator.onDidChangeVisibility),
        registerTerminalProfileProvider(),

        ...commands.registerCommands(extensionCommand),

        /*
         * We need to listen for all change events and see of `cSpell` section changed.
         * When it does, we have to trigger the server to fetch the settings again.
         * This is to handle a bug in the language-server synchronize configuration. It will not synchronize
         * if the section didn't already exist. This leads to a poor user experience in situations like
         * adding a word to be ignored for the first time.
         */
        vscode.workspace.onDidChangeConfiguration(handleOnDidChangeConfiguration),
        createLanguageStatus({ areIssuesVisible: () => decorator.visible, onDidChangeVisibility: decorator.onDidChangeVisibility }),
        registerActionsMenu({ areIssuesVisible: () => decorator.visible }),
        client.onBlockFile(notifyUserOfBlockedFile),
    );

    performance.mark('registerCspellInlineCompletionProviders');
    await registerCspellInlineCompletionProviders(context.subscriptions).catch(() => undefined);

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

    function handleOpenFile(_doc: vscode.TextDocument) {
        // detectPossibleCSpellConfigChange([doc.uri]);
    }

    function handleConfigChange(event: vscode.ConfigurationChangeEvent) {
        if (event.affectsConfiguration(getSectionName('logLevel'))) {
            setOutputChannelLogLevel();
        }
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

    function detectPossibleCSpellConfigChange(files: readonly vscode.Uri[]) {
        for (const uri of files) {
            if (settings.configFilesToWatch.has(UriUtils.basename(uri))) {
                triggerGetSettings();
                break;
            }
        }
    }

    // infoViewer.activate(context, client);

    function registerConfig(path: string) {
        client.registerConfiguration(path);
    }

    const methods = {
        enableLocale: (target: ConfigTargetLegacy | boolean, locale: string) => commands.enableDisableLocaleLegacy(target, locale, true),
        disableLocale: (target: ConfigTargetLegacy | boolean, locale: string) => commands.enableDisableLocaleLegacy(target, locale, false),
    };

    const getConfigurationForDocument = <F extends ConfigurationFields>(doc: vscode.TextDocument, fields: ConfigFieldSelector<F>) =>
        client.getConfigurationForDocument(doc, fields);

    performance.mark('setup Extension API');

    const server = {
        registerConfig,
        triggerGetSettings,
        enableLanguageId: commands.enableLanguageIdCmd,
        disableLanguageId: commands.disableLanguageIdCmd,
        enableCurrentFileType: commands.enableCurrentFileType,
        disableCurrentFileType: commands.disableCurrentFileType,
        addWordToUserDictionary: addWords.addWordToUserDictionary,
        addWordToWorkspaceDictionary: addWords.addWordToWorkspaceDictionary,
        enableLocale: methods.enableLocale,
        disableLocale: methods.disableLocale,
        updateSettings: () => false,
        cSpellClient: () => client,
        getConfigurationForDocument,
        checkDocument,

        // Legacy
        enableLocal: methods.enableLocale,
        disableLocal: methods.disableLocale,
        enableCurrentLanguage: commands.enableCurrentFileType,
        disableCurrentLanguage: commands.disableCurrentFileType,
    } as const satisfies ExtensionApi & { getConfigurationForDocument: typeof getConfigurationForDocument };

    performance.mark('activateWebview');
    activateWebview(context);

    performance.mark('cspell_activate_end');
    performance.measure('cspell_activation', 'cspell_activate_start', 'cspell_activate_end');
    return server;
}

function bindLoggerToOutput(logOutput: vscode.LogOutputChannel): vscode.Disposable {
    const disposableList = createDisposableList();
    const logLevel = getLogLevel();
    const console = {
        log: (...args: Parameters<typeof logOutput.info>) =>
            debugMode || logLevel === 'Debug' ? logOutput.info(...args) : logOutput.debug(...args),
        error: logOutput.error.bind(logOutput),
        info: logOutput.info.bind(logOutput),
        warn: logOutput.warn.bind(logOutput),
    };
    logger.setConnection({ console, onExit: (fn) => disposableList.push(fn) });
    logger.logTime = false;
    logger.logSequence = false;
    return disposableList;
}

performance.mark('cspell_done_load');

function getLogLevel() {
    if (currLogLevel) return currLogLevel;
    currLogLevel = settings.getSettingFromVSConfig('logLevel', undefined) || 'Error';
    return currLogLevel;
}

function setOutputChannelLogLevel(level?: CSpellSettings['logLevel']) {
    const logLevel = level ?? getLogLevel();
    logger.level = logLevel;
}

async function notifyUserOfBlockedFile(onBlockFile: OnBlockFile) {
    try {
        const { uri, reason } = onBlockFile;
        if (!isUriInAnyTab(uri)) return;

        const actions: vscode.MessageItem[] = [{ title: 'Ok' }, { title: 'Open Settings' }];
        const result = await vscode.window.showInformationMessage(
            `File "${uriToName(vscode.Uri.parse(uri))}" not spell checked:\n${reason.notificationMessage}\n`,
            ...actions,
        );
        if (result?.title === 'Open Settings') {
            await vscode.commands.executeCommand('workbench.action.openSettings', reason.settingsID);
        }
    } catch {
        // ignore
    }
}
