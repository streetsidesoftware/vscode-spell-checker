import * as Kefir from 'kefir';
import { format } from 'util';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import {
    EnableLanguageIdMessage,
    EnableLocaleMessage,
    MessageBus,
    OpenLinkMessage,
    SelectFileMessage,
    SelectFolderMessage,
    SelectTabMessage,
} from '../../settingsViewer';
import { ConfigTarget, Settings } from '../../settingsViewer/api/settings';
import { MessageListener, WebviewApi } from '../../settingsViewer/api/WebviewApi';
import { CSpellClient } from '../client';
import { enableDisableLanguageId, enableDisableLocale } from '../commands';
import { getSettingFromVSConfig } from '../settings';
import { Maybe } from '../util';
import { toUri } from '../util/uriHelper';
import { findMatchingDocument } from '../vscode/findDocument';
import { commandDisplayCSpellInfo } from './commands';
import { calcSettings } from './infoHelper';

const viewerPath = 'packages/client/settingsViewer/webapp';
const title = 'Spell Checker Preferences';

type RefreshEmitter = Kefir.Emitter<void, Error> | undefined;

interface InfoView {
    panel: vscode.WebviewPanel;
    updateView(): Promise<void>;
    reveal(column: vscode.ViewColumn): void;
    dispose: () => any;
}

let currentPanel: InfoView | undefined = undefined;
let isDebugLogEnabled = false;

const targetToConfigurationTarget: { [key in ConfigTarget]: vscode.ConfigurationTarget } = {
    user: vscode.ConfigurationTarget.Global,
    workspace: vscode.ConfigurationTarget.Workspace,
    folder: vscode.ConfigurationTarget.WorkspaceFolder,
};

export function activate(context: vscode.ExtensionContext, client: CSpellClient): void {
    context.subscriptions.push(
        vscode.commands.registerCommand(commandDisplayCSpellInfo, async () => {
            const column = vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.Active;
            if (currentPanel) {
                currentPanel.reveal(column);
            } else {
                currentPanel = await createView(context, column, client);
            }
            currentPanel.updateView();
        }),
        {
            dispose: () => {
                if (currentPanel) {
                    const p = currentPanel;
                    currentPanel = undefined;
                    p.dispose();
                }
            },
        }
    );
}

interface State {
    activeTabName: string;
    settings: Settings;
    activeDocumentUri: Maybe<Uri>;
    activeFolderUri: Maybe<Uri>;
}

interface Subscription {
    unsubscribe: () => any;
}

const refreshDelay = 500;

async function createView(context: vscode.ExtensionContext, column: vscode.ViewColumn, client: CSpellClient): Promise<InfoView> {
    const root = context.asAbsolutePath(viewerPath);
    const state: State = await calcInitialState();
    const extPath = context.extensionPath;
    let notifyViewEmitter: RefreshEmitter;
    const subscriptions: Subscription[] = [];

    const options: vscode.WebviewOptions = {
        enableScripts: true,
        enableCommandUris: true,
        localResourceRoots: [Uri.file(root), Uri.file(extPath)],
    };
    const panel = vscode.window.createWebviewPanel('cspellConfigViewer', title, column, options);
    const messageBus = new MessageBus(webviewApiFromPanel(panel), console);

    async function calcStateSettings(activeDocumentUri: Maybe<Uri>, activeFolderUri: Maybe<Uri>) {
        const doc = activeDocumentUri && findMatchingDocument(activeDocumentUri);
        return calcSettings(doc, activeFolderUri, client, log);
    }

    async function refreshState() {
        log(`refreshState: uri "${state.activeDocumentUri}"`);
        state.settings = await calcStateSettings(state.activeDocumentUri, state.activeFolderUri);
    }

    function notifyView() {
        notifyViewEmitter?.emit();
    }

    subscriptions.push(
        Kefir.stream((emitter: RefreshEmitter) => {
            notifyViewEmitter = emitter;
            return () => {
                notifyViewEmitter = undefined;
            };
        })
            .throttle(250)
            .observe(() => {
                const { activeTabName: activeTab, settings } = state;
                log(`notifyView: tab ${activeTab}`);
                messageBus.postMessage({ command: 'ConfigurationChangeMessage', value: { activeTab, settings } });
            })
    );

    async function refreshStateAndNotify() {
        const level = getSettingFromVSConfig('logLevel', undefined);
        isDebugLogEnabled = level === 'Debug';
        log('refreshStateAndNotify');
        await refreshState();
        await notifyView();
    }

    function setActiveDocumentUri(docUri: Maybe<Uri>) {
        state.activeDocumentUri = calcActiveDocumentUri(docUri) || state.activeDocumentUri;
    }

    function setActiveDocumentFromEditor(e: Maybe<vscode.TextEditor>) {
        setActiveDocumentUri(calcActiveDocumentFromEditor(e));
    }

    subscriptions.push(
        Kefir.stream((emitter) => {
            vscode.workspace.onDidChangeConfiguration(() => emitter.value({}), null, context.subscriptions);
        })
            .throttle(1000)
            .observe(() => refreshStateAndNotify())
    );

    vscode.window.onDidChangeActiveTextEditor(
        async (e: Maybe<vscode.TextEditor>) => {
            if (e) {
                setActiveDocumentFromEditor(e);
                await refreshStateAndNotify();
            }
        },
        null,
        context.subscriptions
    );

    messageBus.listenFor('RequestConfigurationMessage', () => refreshStateAndNotify);
    messageBus.listenFor('SelectTabMessage', (msg: SelectTabMessage) => {
        log(`SelectTabMessage: tab ${msg.value}`);
        state.activeTabName = msg.value;
    });
    messageBus.listenFor('SelectFolderMessage', (msg: SelectFolderMessage) => {
        log(`SelectFolderMessage: folder '${msg.value}'`);
        const uri = msg.value;
        const defaultFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
        state.activeFolderUri = (uri && Uri.parse(uri)) || (defaultFolder && defaultFolder.uri);
        return refreshStateAndNotify();
    });
    messageBus.listenFor('SelectFileMessage', (msg: SelectFileMessage) => {
        log(`SelectFolderMessage: folder '${msg.value}'`);
        const uri = msg.value;
        state.activeDocumentUri = (uri && Uri.parse(uri)) || state.activeDocumentUri;
        return refreshStateAndNotify();
    });
    messageBus.listenFor('ConfigurationChangeMessage', () => {
        /* Do nothing */
    });
    messageBus.listenFor('OpenLinkMessage', (msg: OpenLinkMessage) => {
        const uri = Uri.parse(msg.value.uri);
        switch (uri.scheme) {
            case 'file':
                return vscode.window.showTextDocument(uri);
            case 'command':
                return execCommandUri(uri);
        }
        throw new Error(`Unknown link: ${uri.toString()}`);
    });

    subscriptions.push(
        Kefir.stream((emitter: Kefir.Emitter<EnableLanguageIdMessage, Error>) => {
            messageBus.listenFor('EnableLanguageIdMessage', (msg: EnableLanguageIdMessage) => emitter.value(msg));
        })
            .debounce(20)
            .map((msg: EnableLanguageIdMessage) => {
                const { target, languageId, enable, uri } = msg.value;
                log(`EnableLanguageIdMessage: ${target}, ${languageId}, ${enable ? 'enable' : 'disable'}`);
                const uriFolder = uri ? Uri.parse(uri) : undefined;
                return enableDisableLanguageId(languageId, uriFolder, target ? targetToConfigurationTarget[target] : undefined, enable);
            })
            .flatMap(resolvePromise(refreshDelay))
            .observe(refreshStateAndNotify)
    );

    subscriptions.push(
        Kefir.stream((emitter: Kefir.Emitter<EnableLocaleMessage, Error>) => {
            messageBus.listenFor('EnableLocaleMessage', (msg: EnableLocaleMessage) => emitter.value(msg));
        })
            .debounce(20)
            .map((msg: EnableLocaleMessage) => {
                const { target, locale, enable, uri } = msg.value;
                log(`EnableLocaleMessage: ${target}, ${locale}, ${enable ? 'enable' : 'disable'}`);
                const uriFolder = uri ? Uri.parse(uri) : undefined;
                const configTarget = targetToConfigurationTarget[target];
                return enableDisableLocale(locale, toUri(uri), configTarget, uriFolder, enable);
            })
            .flatMap(resolvePromise(refreshDelay))
            .observe(refreshStateAndNotify)
    );

    panel.onDidDispose(dispose, null, context.subscriptions);

    panel.onDidChangeViewState(() => refreshStateAndNotify(), undefined, context.subscriptions);

    const view: InfoView = {
        panel,
        async updateView() {
            await updateView(panel, root);
            refreshStateAndNotify();
        },
        reveal() {
            return panel.reveal();
        },
        dispose,
    };
    return view;

    function dispose() {
        currentPanel = undefined;
        notifyViewEmitter = undefined;
        subscriptions.forEach((s) => s.unsubscribe());
        subscriptions.length = 0;
    }

    function resolvePromise<T, E = unknown>(delay?: number): (p: Promise<T>) => Kefir.Property<T, E> {
        return (p) => {
            const observable = Kefir.fromPromise<T, E>(p);
            return delay ? observable.delay(delay) : observable;
        };
    }

    function calcActiveDocumentUri(docUri: Maybe<Uri>): Maybe<Uri> {
        return docUri && client.allowedSchemas.has(docUri.scheme) ? docUri : undefined;
    }

    function calcActiveDocumentFromEditor(e: Maybe<vscode.TextEditor>) {
        return calcActiveDocumentUri(e && e.document.uri);
    }

    async function calcInitialState(): Promise<State> {
        const activeDocumentUri = calcActiveDocumentFromEditor(vscode.window.activeTextEditor);
        const folder =
            (activeDocumentUri && vscode.workspace.getWorkspaceFolder(activeDocumentUri)) ||
            (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]);
        const activeFolderUri = folder && folder.uri;
        const settings = await calcStateSettings(activeDocumentUri, activeFolderUri);
        return {
            activeTabName: activeDocumentUri ? 'File' : 'User',
            activeDocumentUri,
            activeFolderUri,
            settings,
        };
    }
}

function execCommandUri(_uri: Uri): never {
    throw new Error('not implemented.');
}

function webviewApiFromPanel(panel: vscode.WebviewPanel): WebviewApi {
    let _listener: MessageListener | undefined;

    const disposable = panel.webview.onDidReceiveMessage((msg) => {
        if (_listener) {
            _listener({ data: msg });
        }
    });

    const webviewApi: WebviewApi = {
        set onmessage(listener: MessageListener) {
            _listener = listener;
        },
        postMessage(msg) {
            panel.webview.postMessage(msg);
            return webviewApi;
        },
        disposable,
    };

    return webviewApi;
}

async function updateView(panel: vscode.WebviewPanel, root: string) {
    log('updateView');
    const html = getHtml(panel.webview, root);
    panel.title = title;
    panel.webview.html = html;
}

function getHtml(webview: vscode.Webview, root: string) {
    const resource = Uri.file(root);
    const bundleJs = webview.asWebviewUri(Uri.joinPath(resource, 'index.bundle.js'));
    return `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CSpell Settings Viewer</title>
    </head>
    <body><div id="root">Root</div><script type="text/javascript" src="${bundleJs}"></script></body>
</html>
`;
}

function log(...params: Parameters<typeof console.log>) {
    if (!isDebugLogEnabled) {
        return;
    }
    const msg = format(...params);
    const now = new Date();
    console.log(`${now.toISOString()} InfoView -- ${msg}`);
}

export const __testing__ = {
    execCommandUri,
};
