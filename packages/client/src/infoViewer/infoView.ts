import * as vscode from 'vscode';
import * as path from 'path';
import { Settings, DictionaryEntry, Configs, Config, Workspace, WorkspaceFolder, TextDocument, FileConfig, ConfigTarget } from '../../settingsViewer/api/settings';
import { Maybe, uniqueFilter } from '../util';
import { MessageBus, SelectTabMessage, SelectFolderMessage, SelectFileMessage, EnableLanguageIdMessage, EnableLocalMessage } from '../../settingsViewer';
import { WebviewApi, MessageListener } from '../../settingsViewer/api/WebviewApi';
import { findMatchingDocument } from './cSpellInfo';
import { CSpellClient } from '../client';
import { CSpellUserSettings, GetConfigurationForDocumentResult } from '../server';
import { inspectConfig, Inspect, enableLanguageIdForClosestTarget, enableLanguageIdForTarget, enableLocal, disableLocal, InspectValues } from '../settings';
import { pipe, map, defaultTo } from '../util/pipe';
import { commonPrefix } from '../util/commonPrefix';
import * as Kefir from 'kefir';

const viewerPath = path.join('settingsViewer', 'webapp');
const title = 'Spell Checker Preferences';

type RefreshEmitter = Kefir.Emitter<void, Error> | undefined;

let currentPanel: vscode.WebviewPanel | undefined = undefined;

const targetToConfigurationTarget: { [key in ConfigTarget]: vscode.ConfigurationTarget } = {
    user: vscode.ConfigurationTarget.Global,
    workspace: vscode.ConfigurationTarget.Workspace,
    folder: vscode.ConfigurationTarget.WorkspaceFolder
};

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

interface Subscription {
    unsubscribe: () => any;
}

async function createView(context: vscode.ExtensionContext, column: vscode.ViewColumn, client: CSpellClient) {
    const root = context.asAbsolutePath(viewerPath);
    const state: State = await calcInitialState();
    const extPath = context.extensionPath;
    let notifyViewEmitter: RefreshEmitter;
    const subscriptions: Subscription[] = [];

    const options = {
        enableScripts: true,
        localResourceRoots: [
            vscode.Uri.file(root),
            vscode.Uri.file(extPath)
        ],
    };
    const panel = vscode.window.createWebviewPanel('cspellConfigViewer', title, column, options);
    const messageBus = new MessageBus(webviewApiFromPanel(panel));

    async function calcStateSettings(
        activeDocumentUri: Maybe<vscode.Uri>,
        activeFolderUri: Maybe<vscode.Uri>,
    ) {
        const doc = activeDocumentUri && findMatchingDocument(activeDocumentUri);
        return calcSettings(
            doc,
            activeFolderUri,
            client);
    }

    async function refreshState() {
        log(`refreshState: uri "${state.activeDocumentUri}"`);
        state.settings = await calcStateSettings(state.activeDocumentUri, state.activeFolderUri);
    }

    function notifyView() {
        notifyViewEmitter && notifyViewEmitter.emit();
    }

    subscriptions.push(Kefir.stream((emitter: RefreshEmitter) => {
        notifyViewEmitter = emitter;
        return () => { notifyViewEmitter = undefined; };
    })
    .debounce(250)
    .observe(() => {
        const { activeTabName: activeTab, settings } = state;
        log(`notifyView: tab ${activeTab}`);
        messageBus.postMessage({ command: 'ConfigurationChangeMessage', value:  { activeTab, settings } });
    }));


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

    subscriptions.push(Kefir.stream(emitter => {
        vscode.workspace.onDidChangeConfiguration(() => emitter.value({}), null, context.subscriptions);
    })
    .debounce(500)
    .observe(() => refreshStateAndNotify()));

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
    messageBus.listenFor('SelectFolderMessage', (msg: SelectFolderMessage) => {
        log(`SelectFolderMessage: folder '${msg.value}'`);
        const uri = msg.value;
        const defaultFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
        state.activeFolderUri = uri && vscode.Uri.parse(uri) || defaultFolder && defaultFolder.uri;
        refreshStateAndNotify();
    });
    messageBus.listenFor('SelectFileMessage', (msg: SelectFileMessage) => {
        log(`SelectFolderMessage: folder '${msg.value}'`);
        const uri = msg.value;
        state.activeDocumentUri = uri && vscode.Uri.parse(uri) || state.activeDocumentUri;
        refreshStateAndNotify();
    });

    subscriptions.push(Kefir.stream((emitter: Kefir.Emitter<EnableLanguageIdMessage, Error>) => {
        messageBus.listenFor('EnableLanguageIdMessage', (msg: EnableLanguageIdMessage) => emitter.value(msg));
    })
    .debounce(20)
    .observe((msg: EnableLanguageIdMessage) => {
        const {target, languageId, enable} = msg.value;
        log(`EnableLanguageIdMessage: ${target}, ${languageId}, ${enable ? 'enable' : 'disable'}`);
        const uri = state.activeDocumentUri && vscode.Uri.parse(state.activeDocumentUri.toString());
        if (target) {
            const configTarget = { target: targetToConfigurationTarget[target], uri };
            enableLanguageIdForTarget(languageId, enable, configTarget, true);
        } else {
            enableLanguageIdForClosestTarget(languageId, enable, uri);
        }
    }));

    subscriptions.push(Kefir.stream((emitter: Kefir.Emitter<EnableLocalMessage, Error>) => {
        messageBus.listenFor('EnableLocalMessage', (msg: EnableLocalMessage) => emitter.value(msg));
    })
    .debounce(20)
    .observe((msg: EnableLocalMessage) => {
        const {target, local, enable} = msg.value;
        log(`EnableLocalMessage: ${target}, ${local}, ${enable ? 'enable' : 'disable'}`);
        const uri = state.activeDocumentUri && vscode.Uri.parse(state.activeDocumentUri.toString());
        const configTarget = { target: targetToConfigurationTarget[target], uri };
        if (enable) {
            enableLocal(configTarget, local);
        } else {
            disableLocal(configTarget, local);
        }
    }));

    panel.onDidDispose(() => {
        currentPanel = undefined;
        notifyViewEmitter = undefined;
        subscriptions.forEach(s => s.unsubscribe());
    }, null, context.subscriptions);

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
            settings: await calcStateSettings(
                activeDocumentUri,
                activeFolderUri
            ),
        }
    }

}

function getDefaultWorkspaceFolder() {
    return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
}

function getDefaultWorkspaceFolderUri() {
    const folder = getDefaultWorkspaceFolder();
    return folder && folder.uri;
}

function normalizeFileName(filename: string): string {
    const uri = vscode.Uri.file(filename);
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    if (folder) {
        const folderPath = folder.uri.fsPath;
        return folder.name + filename.slice(folderPath.length);
    }
    if (!vscode.workspace.workspaceFolders || !vscode.workspace.workspaceFolders.length) {
        return path.basename(filename);
    }
    const folders = vscode.workspace.workspaceFolders;
    const prefix = commonPrefix(folders.map(f => f.uri.fsPath).concat([filename]));
    return filename.slice(prefix.length);
}

async function calcSettings(
    document: Maybe<vscode.TextDocument>,
    folderUri: Maybe<vscode.Uri>,
    client: CSpellClient,
): Promise<Settings> {
    const activeFolderUri = folderUri
        || document && document.uri
        || getDefaultWorkspaceFolderUri()
        || null;
    const config = inspectConfig(activeFolderUri);
    const docConfig = await client.getConfigurationForDocument(document);
    const settings: Settings = {
        knownLanguageIds: [...client.languageIds].sort(),
        dictionaries: extractDictionariesFromConfig(docConfig.settings),
        configs: extractViewerConfigFromConfig(config, docConfig, document),
        workspace: mapWorkspace(client.allowedSchemas),
        activeFileUri: document && document.uri.toString(),
        activeFolderUri: activeFolderUri && activeFolderUri.toString() || undefined,
    }
    return settings;
}

type InspectKeys = keyof InspectValues<CSpellUserSettings>;
const keyMap: { [k in InspectKeys]: ConfigTarget } = {
    'defaultValue': 'user',
    'globalValue' : 'user',
    'workspaceValue': 'workspace',
    'workspaceFolderValue': 'folder',
};
interface ConfigOrder {
    0: 'globalValue';
    1: 'workspaceValue';
    2: 'workspaceFolderValue';
}
const configOrder: ConfigOrder = ['globalValue', 'workspaceValue', 'workspaceFolderValue'];

function extractViewerConfigFromConfig(
    config: Inspect<CSpellUserSettings>,
    docConfig: GetConfigurationForDocumentResult,
    doc: vscode.TextDocument | undefined,
): Configs {
    function findNearestConfigField<K extends keyof CSpellUserSettings>(orderPos: keyof ConfigOrder, key: K): InspectKeys {
        for (let i = orderPos; i >= 0; --i) {
            const inspectKey = configOrder[i];
            const setting = config[inspectKey];
            if (setting && setting[key]) {
                return inspectKey;
            }
        }
        return 'defaultValue';
    }

    function extractNearestConfig(orderPos: keyof ConfigOrder): Config {
        const localSource = findNearestConfigField(orderPos, 'language');
        const languageIdsEnabledSource = findNearestConfigField(orderPos, 'enabledLanguageIds');
        const cfg: Config = {
            inherited: { locals: keyMap[localSource], languageIdsEnabled: keyMap[languageIdsEnabledSource] },
            locals: normalizeLocals(config[localSource]!.language),
            languageIdsEnabled: config[languageIdsEnabledSource]!.enabledLanguageIds!,
        }
        return cfg;
    }

    function extractFileConfig(): FileConfig | undefined {
        const { languageEnabled, docSettings, fileEnabled } = docConfig;
        if (!doc) return undefined;
        const {uri, fileName, languageId, isUntitled} = doc;
        const enabledDicts = new Set<string>(docSettings && docSettings.dictionaries || []);
        const dictionaries = extractDictionariesFromConfig(docSettings).filter(dic => enabledDicts.has(dic.name));
        console.log(`extractFileConfig languageEnabled: ${languageEnabled ? 'true' : 'false'}`);
        const cfg: FileConfig = {
            uri: uri.toString(),
            fileName,
            isUntitled,
            languageId,
            dictionaries,
            languageEnabled,
            fileEnabled,
        }
        return cfg;
    }

    return {
        user: extractNearestConfig(0),
        workspace: extractNearestConfig(1),
        folder: extractNearestConfig(2),
        file: extractFileConfig(),
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
            uri: wsf.uri.toString(),
            name,
            index,
        }
    }

    function mapTextDocuments(td: vscode.TextDocument): TextDocument {
        const { fileName, languageId, isUntitled } = td;
        return {
            uri: td.uri.toString(),
            fileName: normalizeFileName(fileName),
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

