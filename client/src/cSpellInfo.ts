// cSpell:words rxjs cspell diags
import * as vscode from 'vscode';
import * as path from 'path';
import { CSpellClient } from './cSpellClient';
import * as Rx from 'rxjs/Rx';
import * as preview from './pugCSpellInfo';
import * as commands from './commands';

const schemeCSpellInfo = 'cspell-info';

export const commandDisplayCSpellInfo = 'cSpell.displayCSpellInfo';
export const commandEnableLanguage    = 'cSpell.enableLanguageFromCSpellInfo';
export const commandDisableLanguage   = 'cSpell.disableLanguageFromCSpellInfo';

function generateEnableDisableLanguageLink(enable: boolean, languageId: string, uri: vscode.Uri) {
    const links = [
        `command:${commandDisableLanguage}?`,
        `command:${commandEnableLanguage}?`,
    ];
    return encodeURI(links[enable ? 1 : 0] + JSON.stringify([languageId, uri.toString()]));
}

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
                const languageId = document.languageId;
                return preview.render({
                    fileEnabled,
                    languageEnabled,
                    languageId,
                    filename,
                    spellingErrors,
                    linkEnableDisableLanguage: generateEnableDisableLanguageLink(!languageEnabled, languageId, document.uri),
                });
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


    function displayCSpellInfo() {
        return vscode.commands
            .executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'Spell Checker Info')
            .then(
                (success) => {},
                (reason) => {
                    vscode.window.showErrorMessage(reason);
                }
            );
    }

    function changeFocus(uri: string) {
        const promises = vscode.window.visibleTextEditors
            .filter(editor => editor.document && (editor.document.uri.toString() === uri))
            .map(editor => vscode.window.showTextDocument(editor.document, editor.viewColumn, false))
        return Promise.all(promises);
    }

    function triggerSettingsRefresh(uri: vscode.Uri) {
        client.triggerGetSettings();
    }

    function enableLanguage(languageId: string, uri: string) {
        const uriObj = uri && vscode.Uri.parse(uri);
        commands.enableLanguageId(languageId)
        .then(() => triggerSettingsRefresh(uriObj))
        .then(() => changeFocus(uri));
    }

    function disableLanguage(languageId: string, uri: string) {
        const uriObj = uri && vscode.Uri.parse(uri);
        commands.disableLanguageId(languageId)
        .then(() => triggerSettingsRefresh(uriObj))
        .then(() => changeFocus(uri));
    }

    function makeDisposable(sub: Rx.Subscription) {
        return {
            dispose: () => sub.unsubscribe()
        };
    }

    context.subscriptions.push(
        vscode.commands.registerCommand(commandDisplayCSpellInfo, displayCSpellInfo),
        vscode.commands.registerCommand(commandEnableLanguage, enableLanguage),
        vscode.commands.registerCommand(commandDisableLanguage, disableLanguage),
        registration,
        makeDisposable(subOnDidChangeTextDocument),
    );
}
