import * as vscode from 'vscode';
import * as path from 'path';
import { Settings, LocalSetting, DictionaryEntry, Configs, Config } from '../../settingsViewer/api/settings';
import { Maybe, uniqueFilter } from '../util';
import { MessageBus, ConfigurationChangeMessage } from '../../settingsViewer';
import { WebviewApi, MessageListener } from '../../settingsViewer/api/WebviewApi';
import { findMatchingDocument } from './cSpellInfo';
import { CSpellClient } from '../client';
import { GetConfigurationForDocumentResult, CSpellUserSettings } from '../server';
import { inspectConfig, Inspect } from '../settings';
import { pipe, extract, map, defaultTo } from '../util/pipe';

const viewerPath = path.join('settingsViewer', 'webapp');

const cats = {
    'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
    'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif',
};

const columnToCat = new Map<vscode.ViewColumn, keyof typeof cats>([
    [vscode.ViewColumn.One,     'Coding Cat'],
    [vscode.ViewColumn.Two,     'Compiling Cat'],
    [vscode.ViewColumn.Three,   'Testing Cat'],
]);

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

async function createView(context: vscode.ExtensionContext, column: vscode.ViewColumn, client: CSpellClient) {
    const root = context.asAbsolutePath(viewerPath);
    let settings: Settings = await (() => {
        const editor = vscode.window.activeTextEditor;
        return calcSettings(editor && editor.document, client);
    })();
    let lastDocumentUri: Maybe<vscode.Uri> = undefined;
    const extPath = context.extensionPath;

    const options = {
        enableScripts: true,
        localResourceRoots: [
            vscode.Uri.file(root),
            vscode.Uri.file(extPath)
        ],
    };
    const panel = vscode.window.createWebviewPanel('catCoding', getCat(column), column, options);
    const messageBus = new MessageBus(webviewApiFromPanel(panel));
    panel.onDidDispose(() => {
        currentPanel = undefined;
    }, null, context.subscriptions);

    panel.onDidChangeViewState(async (e) => {
        const panel = e.webviewPanel;
        const editor = vscode.window.activeTextEditor;
        const doc = lastDocumentUri && findMatchingDocument(lastDocumentUri)
            || (editor && editor.document);
        settings = await calcSettings(doc, client);
        updateView(panel, root);
    });

    messageBus.listenFor('RequestConfigurationMessage', async (msg) => {
        const editor = vscode.window.activeTextEditor;
        const doc = lastDocumentUri && findMatchingDocument(lastDocumentUri)
            || (editor && editor.document);
        settings = await calcSettings(doc, client);
        messageBus.postMessage({ command: 'ConfigurationChangeMessage', value:  { settings } });
    });
    messageBus.listenFor('ConfigurationChangeMessage', (msg: ConfigurationChangeMessage) => {
        settings.locals = msg.value.settings.locals;
    });

    return panel;
}

const defaultDocConfig: GetConfigurationForDocumentResult = {
    languageEnabled: undefined,
    fileEnabled: undefined,
    settings: undefined,
    docSettings: undefined,
};

async function calcSettings(document: Maybe<vscode.TextDocument>, client: CSpellClient): Promise<Settings> {
    const config = inspectConfig((document && document.uri) || null);
    const docConfig = await client.getConfigurationForDocument(document);
    const settings: Settings = {
        locals: extractLocalInfoFromConfig(config, docConfig.docSettings),
        dictionaries: extractDictionariesFromConfig(docConfig.settings),
        configs: extractViewerConfigFromConfig(config, docConfig.docSettings),
    }
    return settings;
}

function extractViewerConfigFromConfig(config: Inspect<CSpellUserSettings>, fileSetting: CSpellUserSettings | undefined): Configs {
    function extract(s: CSpellUserSettings | undefined): Config | undefined {
        if (!s) {
            return undefined;
        }
        const cfg: Config = {
            locals: normalizeLocals(s.language),
            fileTypesEnabled: s.enabledLanguageIds,
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
        .map(e => ({ name: e.name, locals: [], fileTypes: [], description: e.description }))
        .map(e => [e.name, e] as [string, DictionaryEntry]));
    const languageSettings = config.languageSettings || [];
    languageSettings.forEach(setting => {
        const locals = normalizeLocals(setting.local);
        const filetypes = normalizeId(setting.languageId);
        const dicts = setting.dictionaries || [];
        dicts.forEach(dict => {
            const dictEntry = dictionariesByName.get(dict);
            if (dictEntry) {
                dictEntry.locals = merge(dictEntry.locals, locals);
                dictEntry.fileTypes = merge(dictEntry.fileTypes, filetypes);
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

function extractLocalInfoFromConfig(config: Inspect<CSpellUserSettings>, fileSetting: CSpellUserSettings | undefined): LocalSetting {
    const extractLanguage = (s?: CSpellUserSettings) => pipe(s, extract('language'), map(s => s.split(',').map(a => a.trim())));
    const local: LocalSetting = {
        user: extractLanguage(config.globalValue),
        workspace: extractLanguage(config.workspaceValue),
        folder: extractLanguage(config.workspaceFolderValue),
        file: extractLanguage(fileSetting),
    }

    return local;
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

function getCat(column: vscode.ViewColumn): keyof typeof cats {
    return columnToCat.get(column) || 'Coding Cat';
}

async function updateView(panel: vscode.WebviewPanel, root: string) {
    const column = panel.viewColumn || vscode.ViewColumn.Active;
    const cat = getCat(column);
    const html = getHtml(root);
    panel.title = cat;
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
    <link href="${resource}/index.css?0b5b4992f9ef4a32d10c" rel="stylesheet"></head>
    <body>
    <div id="root">Root</div>
    <script type="text/javascript" src="${resource}/index.bundle.js?0b5b4992f9ef4a32d10c"></script></body>
</html>
`;
}