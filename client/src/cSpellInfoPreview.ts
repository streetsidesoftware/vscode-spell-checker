import * as vscode from 'vscode';
import * as escapeHtml from 'escape-html';
import * as path from 'path';
import { CSpellClient } from './cSpellClient';
import * as Rx from 'rxjs/Rx';

const schemeCSpellInfo = 'cspell-info';

export function activate(context: vscode.ExtensionContext, client: CSpellClient) {

    const previewUri = vscode.Uri.parse(`${schemeCSpellInfo}://authority/cspell-info-preview`);
    const onRefresh = new Rx.Subject<vscode.Uri>();

    class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
            return this.createInfoHtml(vscode.window.activeTextEditor);
        }

        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }

        private createInfoHtml(editor: vscode.TextEditor): Thenable<string> {
            const document = editor.document;
            const uri = document.uri;
            const filename = path.basename(uri.path);
            const diags = client.diagnostics;
            const allSpellingErrors = diags.get(uri)
                .map(d => d.range)
                .map(range => document.getText(range));
            const spellingErrors = [...(new Set(allSpellingErrors))].sort();
            return client.isSpellCheckEnabled(document).then(response => {
                const { fileEnabled = false, languageEnabled = false } = response;
                return `
                    <body>
                        <h1>Spell Checker Configuration Information</h1>
                        <div>
                            <table>
                                <tr>
                                    <td>File Name:</td>
                                    <td><b>${escapeHtml(filename)}</b></td>
                                </tr>
                                <tr>
                                    <td>Spell Checker enabled for Path:</td>
                                    <td>${fileEnabled ? 'Yes' : 'No'}</td>
                                </tr>
                                <tr>
                                    <td>Spell Checker enabled for file type (${document.languageId}):</td>
                                    <td>${languageEnabled ? 'Yes' : 'No'}</td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <h2>Issues:</h2>
                            <div>${spellingErrors.length ? escapeHtml(spellingErrors.join(', ')) : '<b>None</b>'}</div>
                        </div>
                    </body>
                `;
            });
        }
    }

    const provider = new TextDocumentContentProvider();
    const registration = vscode.workspace.registerTextDocumentContentProvider(schemeCSpellInfo, provider);

    const subOnDidChangeTextDocument = onRefresh
        .debounceTime(250)
        .subscribe(() => provider.update(previewUri));

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        if (e.document === vscode.window.activeTextEditor.document && e.document) {
            onRefresh.next(e.document.uri);
        }
    });

    vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor) => {
        if (editor === vscode.window.activeTextEditor && editor.document) {
            onRefresh.next(editor.document.uri);
        }
    });

    const disposable = vscode.commands.registerCommand('cSpell.displayCSpellInfo', () => {
        return vscode.commands
            .executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'Spell Checker Info')
            .then(
                (success) => {},
                (reason) => {
                    vscode.window.showErrorMessage(reason);
                }
            );
    });

    function makeDisposable(sub: Rx.Subscription) {
        return {
            dispose: () => sub.unsubscribe()
        };
    }

    context.subscriptions.push(
        disposable,
        registration,
        makeDisposable(subOnDidChangeTextDocument),
    );
}
