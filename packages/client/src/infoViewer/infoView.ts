import * as vscode from 'vscode';
import * as fs from 'fs-extra';
// import * as x from 'cspell-settings-webview';
import * as path from 'path';

const root = path.join(path.dirname(require.resolve('cspell-settings-webview')), 'webapp');
const viewerWebAppHtml = fs.readFile(path.join(root, 'index.html'), 'utf-8');

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

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('cSpell.cat', () => {
        const column = vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn || vscode.ViewColumn.Active;
        if (currentPanel) {
            currentPanel.reveal(column);
        } else {
            currentPanel = createView(context, column);
        }
        updateView(currentPanel);
    }));
}

function createView(context: vscode.ExtensionContext, column: vscode.ViewColumn) {
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
        updateView(panel);
    });

    return panel;
}

function getCat(column: vscode.ViewColumn): keyof typeof cats {
    return columnToCat.get(column) || 'Coding Cat';
}

async function updateView(panel: vscode.WebviewPanel) {
    const column = panel.viewColumn || vscode.ViewColumn.Active;
    const cat = getCat(column);
    const html = getHtml2(root);
    panel.title = cat;
    panel.webview.html = html;
}

function getWebviewContent(cat: keyof typeof cats) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
    <img src="${cats[cat]}" width="300" />
    <h1 id="window-keys">Window Keys</h1>
    <h2 id="window-props">Window Properties</h2>
    <h2 id="acquire">acquire</h2>
    <code id="vscode">vscode</code>

    <script>
        (function() {
            const windowKeysElm = document.getElementById('window-keys');
            const windowPropsElm = document.getElementById('window-props');
            windowKeysElm.textContent = JSON.stringify(Object.keys(window).filter(k => k.match(/^a/)));
            windowPropsElm.textContent = JSON.stringify(Object.getOwnPropertyNames(window).filter(k => k.match(/^a/)));
            document.getElementById('acquire').textContent = (acquireVsCodeApi ? 'yes' : 'no') + ' | ' + (global ? 'global' : 'no global');
            const vscode = acquireVsCodeApi();
            document.getElementById('vscode').textContent = navigator.userAgent;
        }())
    </script>

</body>
</html>`;
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
    <body>
    <iframe
        id="viewer-frame"
        src="${resource}/index.html"
        frameborder="0"
        style="display: block; margin: 0px; overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: visible;"
    >
    </iframe>
    </body>
</html>
`;
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