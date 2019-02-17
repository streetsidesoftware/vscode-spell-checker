import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Settings } from '../../settingsViewer/api/settings';
import * as settingsViewer from '../../settingsViewer';
import { MessageBus, ConfigurationChangeMessage } from '../../settingsViewer';
import { WebviewApi, MessageListener } from '../../settingsViewer/api/WebviewApi';

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

const settings: Settings = {
    locals: {
        user: ['en', 'fr'],
        workspace: undefined,
        folder: ['de'],
        file: ['en'],
    },
    dictionaries: [
        {
            name: 'en_US',
            locals: ['en', 'en-us'],
            description: 'US English Dictionary'
        },
        {
            name: 'es_ES',
            locals: ['es', 'es-es'],
            description: 'Spanish Dictionary'
        },
        {
            name: 'fr_fr',
            locals: ['fr', 'fr-fr'],
            description: 'French Dictionary'
        },
        {
            name: 'de_DE',
            locals: ['de', 'de_DE'],
            description: 'German Dictionary'
        },
    ],
};

export function activate(context: vscode.ExtensionContext) {
    const root = context.asAbsolutePath(viewerPath);

    context.subscriptions.push(vscode.commands.registerCommand('cSpell.cat', () => {
        const column = vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn || vscode.ViewColumn.Active;
        if (currentPanel) {
            currentPanel.reveal(column);
        } else {
            currentPanel = createView(context, column);
        }
        updateView(currentPanel, root);
    }));
}

function createView(context: vscode.ExtensionContext, column: vscode.ViewColumn) {
    const root = context.asAbsolutePath(viewerPath);

    const extPath = context.extensionPath;
    const options = {
        enableScripts: true,
        localResourceRoots: [
            vscode.Uri.file(root),
            vscode.Uri.file(extPath)
        ],
    };
    const panel = vscode.window.createWebviewPanel('catCoding', getCat(column), column, options);
    panel.onDidDispose(() => {
        currentPanel = undefined;
    }, null, context.subscriptions);

    panel.onDidChangeViewState((e) => {
        const panel = e.webviewPanel;
        updateView(panel, root);
    });

    const messageBus = new MessageBus(webviewApiFromPanel(panel));
    messageBus.listenFor('RequestConfigurationMessage', (msg) => {
        vscode.window.showErrorMessage(msg.command);
        messageBus.postMessage({ command: 'ConfigurationChangeMessage', value:  { settings } });
    });
    messageBus.listenFor('ConfigurationChangeMessage', (msg: ConfigurationChangeMessage) => {
        vscode.window.showErrorMessage(msg.command);
        settings.locals = msg.value.settings.locals;
    });

    return panel;
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
    const html = getHtml2(root);
    panel.title = cat;
    panel.webview.html = html;
}

function getHtml2(root: string) {
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