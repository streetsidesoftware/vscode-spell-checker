import * as Kefir from 'kefir';
import * as path from 'path';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import {
    EnableLanguageIdMessage,
    EnableLocaleMessage,
    MessageBus,
    OpenFileMessage,
    SelectFileMessage,
    SelectFolderMessage,
    SelectTabMessage,
} from '../../settingsViewer';
import {
    Config,
    Configs,
    ConfigSource,
    ConfigTarget,
    DictionaryEntry,
    FileConfig,
    Settings,
    TextDocument,
    Workspace,
    WorkspaceFolder,
} from '../../settingsViewer/api/settings';
import { MessageListener, WebviewApi } from '../../settingsViewer/api/WebviewApi';
import { CSpellClient } from '../client';
import { enableLanguageId } from '../commands';
import type { CSpellUserSettings, GetConfigurationForDocumentResult } from '../server';
import { disableLocale, enableLocale, getSettingFromVSConfig, Inspect, inspectConfig, InspectValues } from '../settings';
import { Maybe, uniqueFilter } from '../util';
import { commonPrefix } from '../util/commonPrefix';
import { defaultTo, map, pipe } from '../util/pipe';
import { commandDisplayCSpellInfo, findMatchingDocument } from './cSpellInfo';

const viewerPath = 'packages/client/settingsViewer/webapp';
const title = 'Spell Checker Preferences';

type RefreshEmitter = Kefir.Emitter<void, Error> | undefined;

let currentPanel: vscode.WebviewPanel | undefined = undefined;
let isDebugLogEnabled = false;

const targetToConfigurationTarget: { [key in ConfigTarget]: vscode.ConfigurationTarget } = {
    user: vscode.ConfigurationTarget.Global,
    workspace: vscode.ConfigurationTarget.Workspace,
    folder: vscode.ConfigurationTarget.WorkspaceFolder,
};

export function activate(context: vscode.ExtensionContext, client: CSpellClient): void {
    const root = context.asAbsolutePath(viewerPath);

    context.subscriptions.push(
        vscode.commands.registerCommand(commandDisplayCSpellInfo, async () => {
            const column = (vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.Active;
            if (currentPanel) {
                currentPanel.reveal(column);
            } else {
                currentPanel = await createView(context, column, client);
            }
            updateView(currentPanel, root);
        })
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

async function createView(context: vscode.ExtensionContext, column: vscode.ViewColumn, client: CSpellClient) {
    const root = context.asAbsolutePath(viewerPath);
    const state: State = await calcInitialState();
    const extPath = context.extensionPath;
    let notifyViewEmitter: RefreshEmitter;
    const subscriptions: Subscription[] = [];

    const options = {
        enableScripts: true,
        localResourceRoots: [Uri.file(root), Uri.file(extPath)],
    };
    const panel = vscode.window.createWebviewPanel('cspellConfigViewer', title, column, options);
    const messageBus = new MessageBus(webviewApiFromPanel(panel), console);

    async function calcStateSettings(activeDocumentUri: Maybe<Uri>, activeFolderUri: Maybe<Uri>) {
        const doc = activeDocumentUri && findMatchingDocument(activeDocumentUri);
        return calcSettings(doc, activeFolderUri, client);
    }

    async function refreshState() {
        log(`refreshState: uri "${state.activeDocumentUri}"`);
        state.settings = await calcStateSettings(state.activeDocumentUri, state.activeFolderUri);
    }

    function notifyView() {
        notifyViewEmitter && notifyViewEmitter.emit();
    }

    subscriptions.push(
        Kefir.stream((emitter: RefreshEmitter) => {
            notifyViewEmitter = emitter;
            return () => {
                notifyViewEmitter = undefined;
            };
        })
            .debounce(250)
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
            .debounce(500)
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

    messageBus.listenFor('RequestConfigurationMessage', refreshStateAndNotify);
    messageBus.listenFor('SelectTabMessage', (msg: SelectTabMessage) => {
        log(`SelectTabMessage: tab ${msg.value}`);
        state.activeTabName = msg.value;
    });
    messageBus.listenFor('SelectFolderMessage', (msg: SelectFolderMessage) => {
        log(`SelectFolderMessage: folder '${msg.value}'`);
        const uri = msg.value;
        const defaultFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
        state.activeFolderUri = (uri && Uri.parse(uri)) || (defaultFolder && defaultFolder.uri);
        refreshStateAndNotify();
    });
    messageBus.listenFor('SelectFileMessage', (msg: SelectFileMessage) => {
        log(`SelectFolderMessage: folder '${msg.value}'`);
        const uri = msg.value;
        state.activeDocumentUri = (uri && Uri.parse(uri)) || state.activeDocumentUri;
        refreshStateAndNotify();
    });
    messageBus.listenFor('ConfigurationChangeMessage', () => {
        /* Do nothing */
    });
    messageBus.listenFor('OpenFileMessage', (msg: OpenFileMessage) => {
        const uri = Uri.parse(msg.value.uri);
        vscode.window.showTextDocument(uri);
    });

    subscriptions.push(
        Kefir.stream((emitter: Kefir.Emitter<EnableLanguageIdMessage, Error>) => {
            messageBus.listenFor('EnableLanguageIdMessage', (msg: EnableLanguageIdMessage) => emitter.value(msg));
        })
            .debounce(20)
            .observe((msg: EnableLanguageIdMessage) => {
                const { target, languageId, enable, uri } = msg.value;
                log(`EnableLanguageIdMessage: ${target}, ${languageId}, ${enable ? 'enable' : 'disable'}`);
                const uriFolder = uri ? Uri.parse(uri) : undefined;
                return enableLanguageId(languageId, uriFolder, target ? targetToConfigurationTarget[target] : undefined);
            })
    );

    subscriptions.push(
        Kefir.stream((emitter: Kefir.Emitter<EnableLocaleMessage, Error>) => {
            messageBus.listenFor('EnableLocaleMessage', (msg: EnableLocaleMessage) => emitter.value(msg));
        })
            .debounce(20)
            .observe((msg: EnableLocaleMessage) => {
                const { target, locale, enable, uri } = msg.value;
                log(`EnableLocaleMessage: ${target}, ${locale}, ${enable ? 'enable' : 'disable'}`);
                const uriFolder = uri ? Uri.parse(uri) : undefined;
                const configTarget = { target: targetToConfigurationTarget[target], uri: uriFolder };
                return enable ? enableLocale(configTarget, locale) : disableLocale(configTarget, locale);
            })
    );

    panel.onDidDispose(
        () => {
            currentPanel = undefined;
            notifyViewEmitter = undefined;
            subscriptions.forEach((s) => s.unsubscribe());
        },
        null,
        context.subscriptions
    );

    return panel;

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
        return {
            activeTabName: activeDocumentUri ? 'File' : 'User',
            activeDocumentUri,
            activeFolderUri,
            settings: await calcStateSettings(activeDocumentUri, activeFolderUri),
        };
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
    const uri = Uri.file(filename);
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    if (folder) {
        const folderPath = folder.uri.fsPath;
        return folder.name + filename.slice(folderPath.length);
    }
    if (!vscode.workspace.workspaceFolders || !vscode.workspace.workspaceFolders.length) {
        return path.basename(filename);
    }
    const folders = vscode.workspace.workspaceFolders;
    const prefix = commonPrefix(folders.map((f) => f.uri.fsPath).concat([filename]));
    return filename.slice(prefix.length);
}

async function calcSettings(document: Maybe<vscode.TextDocument>, folderUri: Maybe<Uri>, client: CSpellClient): Promise<Settings> {
    const activeFolderUri = folderUri || getDefaultWorkspaceFolderUri();
    const config = inspectConfig(activeFolderUri);
    const docConfig = await client.getConfigurationForDocument(document);
    const settings: Settings = {
        knownLanguageIds: [...client.languageIds].sort(),
        dictionaries: extractDictionariesFromConfig(docConfig.settings),
        configs: extractViewerConfigFromConfig(config, docConfig, document),
        workspace: mapWorkspace(client.allowedSchemas),
        activeFileUri: document && document.uri.toString(),
        activeFolderUri: activeFolderUri?.toString(),
    };
    return settings;
}

type InspectKeys = keyof InspectValues<CSpellUserSettings>;
const keyMap: { [k in InspectKeys]: ConfigSource } = {
    defaultValue: 'default',
    globalValue: 'user',
    workspaceValue: 'workspace',
    workspaceFolderValue: 'folder',
};
interface ConfigOrder {
    0: 'defaultValue';
    1: 'globalValue';
    2: 'workspaceValue';
    3: 'workspaceFolderValue';
}
interface ConfigOrderArray extends ConfigOrder {
    map<U>(callbackfn: (v: InspectKeys, i: number) => U): U[];
}
const configOrder: ConfigOrderArray = ['defaultValue', 'globalValue', 'workspaceValue', 'workspaceFolderValue'];
const configOrderRev = new Map(configOrder.map((v, i) => [v, i]));

function extractViewerConfigFromConfig(
    config: Inspect<CSpellUserSettings>,
    docConfig: GetConfigurationForDocumentResult,
    doc: vscode.TextDocument | undefined
): Configs {
    function findNearestConfigField<K extends keyof CSpellUserSettings>(orderPos: keyof ConfigOrder, key: K): InspectKeys {
        for (let i = orderPos; i > 0; --i) {
            const inspectKey = configOrder[i];
            const setting = config[inspectKey];
            if (setting && setting[key]) {
                return inspectKey;
            }
        }
        return 'defaultValue';
    }

    function applyEnableFiletypesToEnabledLanguageIds(
        languageIds: string[] | undefined = [],
        enableFiletypes: string[] | undefined = []
    ): string[] {
        const ids = new Set(languageIds);
        normalizeEnableFiletypes(enableFiletypes)
            .map((lang) => ({ enable: lang[0] !== '!', lang: lang.replace('!', '') }))
            .forEach(({ enable, lang }) => {
                if (enable) {
                    ids.add(lang);
                } else {
                    ids.delete(lang);
                }
            });
        return [...ids];
    }

    function normalizeEnableFiletypes(enableFiletypes: string[]): string[] {
        const ids = enableFiletypes
            .map((id) => id.replace(/!/g, '~')) // Use ~ for better sorting
            .sort()
            .map((id) => id.replace(/~/g, '!')) // Restore the !
            .map((id) => id.replace(/^(!!)+/, '')); // Remove extra !! pairs

        return ids;
    }

    function inspectKeyToOrder(a: InspectKeys): number {
        return configOrderRev.get(a) || 0;
    }

    function mergeSource(a: InspectKeys, b: InspectKeys): InspectKeys {
        return inspectKeyToOrder(a) > inspectKeyToOrder(b) ? a : b;
    }

    function extractNearestConfig(orderPos: keyof ConfigOrder): Config {
        const localeSource = findNearestConfigField(orderPos, 'language');
        const languageIdsEnabledSource = findNearestConfigField(orderPos, 'enabledLanguageIds');
        const enableFiletypesSource = findNearestConfigField(orderPos, 'enableFiletypes');
        const languageIdsEnabled = applyEnableFiletypesToEnabledLanguageIds(
            config[languageIdsEnabledSource]!.enabledLanguageIds,
            config[enableFiletypesSource]!.enableFiletypes
        );
        const langSource = mergeSource(languageIdsEnabledSource, enableFiletypesSource);

        const cfg: Config = {
            inherited: { locales: keyMap[localeSource], languageIdsEnabled: keyMap[langSource] },
            locales: normalizeLocales(config[localeSource]!.language),
            languageIdsEnabled,
        };
        return cfg;
    }

    function extractFileConfig(): FileConfig | undefined {
        const { languageEnabled, docSettings, fileEnabled } = docConfig;
        if (!doc) return undefined;
        const { uri, fileName, languageId, isUntitled } = doc;
        const enabledDicts = new Set<string>((docSettings && docSettings.dictionaries) || []);
        const dictionaries = extractDictionariesFromConfig(docSettings).filter((dic) => enabledDicts.has(dic.name));
        log(`extractFileConfig languageEnabled: ${languageEnabled ? 'true' : 'false'}`);
        const cfg: FileConfig = {
            uri: uri.toString(),
            fileName,
            isUntitled,
            languageId,
            dictionaries,
            languageEnabled,
            fileEnabled,
            configFiles: docConfig.configFiles,
        };
        return cfg;
    }

    return {
        user: extractNearestConfig(1),
        workspace: extractNearestConfig(2),
        folder: extractNearestConfig(3),
        file: extractFileConfig(),
    };
}

function extractDictionariesFromConfig(config: CSpellUserSettings | undefined): DictionaryEntry[] {
    if (!config) {
        return [];
    }

    const dictionaries = config.dictionaryDefinitions || [];
    const dictionariesByName = new Map(
        dictionaries
            .map((e) => ({ name: e.name, locales: [], languageIds: [], description: e.description }))
            .map((e) => [e.name, e] as [string, DictionaryEntry])
    );
    const languageSettings = config.languageSettings || [];
    languageSettings.forEach((setting) => {
        const locales = normalizeLocales(setting.locale || setting.local);
        const languageIds = normalizeId(setting.languageId);
        const dicts = setting.dictionaries || [];
        dicts.forEach((dict) => {
            const dictEntry = dictionariesByName.get(dict);
            if (dictEntry) {
                dictEntry.locales = merge(dictEntry.locales, locales);
                dictEntry.languageIds = merge(dictEntry.languageIds, languageIds);
            }
        });
    });
    return [...dictionariesByName.values()];
}

function normalizeLocales(locale: string | string[] | undefined) {
    return normalizeId(locale);
}

function normalizeId(locale: string | string[] | undefined): string[] {
    return pipe(
        locale,
        map((locale) => (typeof locale === 'string' ? locale : locale.join(','))),
        map((locale) =>
            locale
                .replace(/\*/g, '')
                .split(/[,;]/)
                .map((a) => a.trim())
                .filter((a) => !!a)
        ),
        defaultTo([] as string[])
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
        disposable,
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
        };
    }

    function mapTextDocuments(td: vscode.TextDocument): TextDocument {
        const { fileName, languageId, isUntitled } = td;
        return {
            uri: td.uri.toString(),
            fileName: normalizeFileName(fileName),
            languageId,
            isUntitled,
        };
    }

    const { name, workspaceFolders, textDocuments } = vscode.workspace;
    const workspace: Workspace = {
        name,
        workspaceFolders: workspaceFolders ? workspaceFolders.map(mapWorkspaceFolder) : undefined,
        textDocuments: textDocuments.filter((td) => allowedSchemas.has(td.uri.scheme)).map(mapTextDocuments),
    };

    return workspace;
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

function log(msg: any) {
    if (!isDebugLogEnabled) {
        return;
    }
    const now = new Date();
    console.log(`${now.toISOString()} InfoView -- ${msg}`);
}
