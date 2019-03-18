import * as vscode from 'vscode';
import * as path from 'path';
import { Settings, DictionaryEntry, Configs, Config, Workspace, WorkspaceFolder, TextDocument } from '../../settingsViewer/api/settings';
import { Maybe, uniqueFilter } from '../util';
import { MessageBus, SelectTabMessage } from '../../settingsViewer';
import { WebviewApi, MessageListener } from '../../settingsViewer/api/WebviewApi';
import { findMatchingDocument } from './cSpellInfo';
import { CSpellClient } from '../client';
import { CSpellUserSettings } from '../server';
import { inspectConfig, Inspect } from '../settings';
import { pipe, map, defaultTo } from '../util/pipe';

const viewerPath = path.join('settingsViewer', 'webapp');
const title = 'Spell Checker Preferences';

let currentPanel: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext, client: CSpellClient) {
    const root = context.asAbsolutePath(viewerPath);

    context.subscriptions.push(vscode.commands.registerCommand('cSpell.cat', async () => {
        const column = vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn || vscode.ViewColumn.Active;
        if (currentPanel) {
            currentPanel.reveal(column);
        } else {
            currentPanel = await createView(context, column, client);
        }
        updateView(currentPanel, root);
    }));
}

interface State {
    activeTabName: string;
    settings: Settings;
    activeDocumentUri: Maybe<vscode.Uri>;
    activeFolderUri: Maybe<vscode.Uri>;
}

async function createView(context: vscode.ExtensionContext, column: vscode.ViewColumn, client: CSpellClient) {
    const root = context.asAbsolutePath(viewerPath);
    const state: State = await calcInitialState();
    const extPath = context.extensionPath;

    const options = {
        enableScripts: true,
        localResourceRoots: [
            vscode.Uri.file(root),
            vscode.Uri.file(extPath)
        ],
    };
    const panel = vscode.window.createWebviewPanel('cspellConfigViewer', title, column, options);
    const messageBus = new MessageBus(webviewApiFromPanel(panel));

    async function calcStateSettings(activeDocumentUri: Maybe<vscode.Uri>) {
        const doc = activeDocumentUri && findMatchingDocument(activeDocumentUri);
        return calcSettings(doc, client);
    }

    async function refreshState() {
        log(`refreshState: uri "${state.activeDocumentUri}"`);
        state.settings = await calcStateSettings(state.activeDocumentUri);
    }

    async function notifyView() {
        const { activeTabName: activeTab, settings } = state;
        log(`notifyView: tab ${activeTab}`);
        messageBus.postMessage({ command: 'ConfigurationChangeMessage', value:  { activeTab, settings } });
    }

    async function refreshStateAndNotify() {
        log('refreshStateAndNotify');
        await refreshState();
        await notifyView();
    }

    function setActiveDocumentUri(docUri: Maybe<vscode.Uri>) {
        state.activeDocumentUri = calcActiveDocumentUri(docUri) || state.activeDocumentUri;
    }

    function setActiveDocumentFromEditor(e: Maybe<vscode.TextEditor>) {
        setActiveDocumentUri(calcActiveDocumentFromEditor(e));
    }

    panel.onDidDispose(() => {
        currentPanel = undefined;
    }, null, context.subscriptions);

    // panel.onDidChangeViewState(() => refreshStateAndNotify(), null, context.subscriptions);

    vscode.workspace.onDidChangeConfiguration(() => refreshStateAndNotify(), null, context.subscriptions);
    vscode.window.onDidChangeActiveTextEditor(async (e: Maybe<vscode.TextEditor>) => {
        if (e) {
            setActiveDocumentFromEditor(e);
            await refreshStateAndNotify();
        }
    }, null, context.subscriptions);

    messageBus.listenFor('RequestConfigurationMessage', refreshStateAndNotify);
    messageBus.listenFor('SelectTabMessage', (msg: SelectTabMessage) => {
        log(`SelectTabMessage: tab ${msg.value}`);
        state.activeTabName = msg.value;
    });

    return panel;

    function calcActiveDocumentUri(docUri: Maybe<vscode.Uri>): Maybe<vscode.Uri> {
        return docUri && client.allowedSchemas.has(docUri.scheme) ? docUri : undefined;
    }

    function calcActiveDocumentFromEditor(e: Maybe<vscode.TextEditor>) {
        return calcActiveDocumentUri(e && e.document.uri);
    }

    async function calcInitialState(): Promise<State> {
        const activeDocumentUri = calcActiveDocumentFromEditor(vscode.window.activeTextEditor);
        const folder = (activeDocumentUri && vscode.workspace.getWorkspaceFolder(activeDocumentUri))
            || (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]);
        const activeFolderUri = folder && folder.uri;
        return {
            activeTabName: 'About',
            activeDocumentUri,
            activeFolderUri,
            settings: await calcStateSettings(calcActiveDocumentFromEditor(vscode.window.activeTextEditor)),
        }
    }

}

async function calcSettings(document: Maybe<vscode.TextDocument>, client: CSpellClient): Promise<Settings> {
    const config = inspectConfig((document && document.uri) || null);
    const docConfig = await client.getConfigurationForDocument(document);
    const settings: Settings = {
        dictionaries: extractDictionariesFromConfig(docConfig.settings),
        configs: extractViewerConfigFromConfig(config, docConfig.docSettings),
        workspace: mapWorkspace(client.allowedSchemas),
    }
    return settings;
}

function extractViewerConfigFromConfig(config: Inspect<CSpellUserSettings>, fileSetting: CSpellUserSettings | undefined): Configs {
    function extract(s: CSpellUserSettings | undefined): Config | undefined {
        if (!s || !Object.keys(s)) {
            return undefined;
        }
        const cfg: Config = {
            locals: normalizeLocals(s.language),
            languageIdsEnabled: s.enabledLanguageIds,
        }

        return cfg;
    }

    return {
        user: extract(config.globalValue),
        workspace: extract(config.workspaceValue),
        folder: extract(config.workspaceFolderValue),
        file: extract(fileSetting),
    }
}

function extractDictionariesFromConfig(config: CSpellUserSettings | undefined): DictionaryEntry[] {
    if (!config) {
        return [];
    }

    const dictionaries = config.dictionaryDefinitions || [];
    const dictionariesByName = new Map(dictionaries
        .map(e => ({ name: e.name, locals: [], languageIds: [], description: e.description }))
        .map(e => [e.name, e] as [string, DictionaryEntry]));
    const languageSettings = config.languageSettings || [];
    languageSettings.forEach(setting => {
        const locals = normalizeLocals(setting.local);
        const languageIds = normalizeId(setting.languageId);
        const dicts = setting.dictionaries || [];
        dicts.forEach(dict => {
            const dictEntry = dictionariesByName.get(dict);
            if (dictEntry) {
                dictEntry.locals = merge(dictEntry.locals, locals);
                dictEntry.languageIds = merge(dictEntry.languageIds, languageIds);
            }
        });
    });
    return [...dictionariesByName.values()];
}

function normalizeLocals(local: string | string[] | undefined) {
    return normalizeId(local);
}

function normalizeId(local: string | string[] | undefined): string[] {
    return pipe(local,
        map(local => typeof local === 'string' ? local : local.join(',')),
        map(local => local.replace(/\*/g, '').split(/[,;]/).map(a => a.trim()).filter(a => !!a)),
        defaultTo([])
    );
}

function merge(left: string[], right: string[]): string[] {
    return left.concat(right).filter(uniqueFilter());
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
        // disposable,
    };

    return webviewApi;
}

function mapWorkspace(allowedSchemas: Set<string>): Workspace {
    function mapWorkspaceFolder(wsf: vscode.WorkspaceFolder): WorkspaceFolder {
        const { name, index } = wsf;
        return {
            uri: wsf.uri.toString(true),
            name,
            index,
        }
    }

    function mapTextDocuments(td: vscode.TextDocument): TextDocument {
        const { fileName, languageId, isUntitled } = td;
        return {
            uri: td.uri.toString(true),
            fileName,
            languageId,
            isUntitled
        }
    }

    const { name, workspaceFolders, textDocuments } = vscode.workspace;
    const workspace: Workspace = {
        name,
        workspaceFolders: workspaceFolders
            ? workspaceFolders.map(mapWorkspaceFolder)
            : undefined,
        textDocuments: textDocuments.filter(td => allowedSchemas.has(td.uri.scheme)).map(mapTextDocuments),
    }

    return workspace;
}

async function updateView(panel: vscode.WebviewPanel, root: string) {
    log('updateView');
    const html = getHtml(root);
    panel.title = title;
    panel.webview.html = html;
}

function getHtml(root: string) {
    const resource = vscode.Uri.file(root).with({ scheme: 'vscode-resource' });
return `
<!DOCTYPE html>
<html>
    <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSpell Settings Viewer</title>
    <link href="${resource}/index.css" rel="stylesheet"></head>
    <body>
    <div id="root">Root</div>
    <script type="text/javascript" src="${resource}/index.bundle.js"></script></body>
</html>
`;
}

function log(msg: any) {
    const now = new Date();
    console.log(`${now.toISOString()} InfoView -- ${msg}`);
}