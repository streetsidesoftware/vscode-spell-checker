import * as vscode from 'vscode';
import { getConfiguration } from '../settings';

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
    const panel = vscode.window.createWebviewPanel('catCoding', getCat(column), column, { });
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

function updateView(panel: vscode.WebviewPanel) {
    const column = panel.viewColumn || vscode.ViewColumn.Active;
    const cat = getCat(column);
    panel.title = cat;
    panel.webview.html = getWebviewContent(cat);
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
</body>
</html>`;
}
