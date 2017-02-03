// cSpell:words rxjs cspell diags
import * as vscode from 'vscode';
import * as path from 'path';
import { CSpellClient } from './cSpellClient';
import * as Rx from 'rxjs/Rx';
import * as preview from './pugCSpellInfo';
import * as commands from './commands';
import * as util from './util';

const schemeCSpellInfo = 'cspell-info';

export const commandDisplayCSpellInfo = 'cSpell.displayCSpellInfo';
export const commandEnableLanguage    = 'cSpell.enableLanguageFromCSpellInfo';
export const commandDisableLanguage   = 'cSpell.disableLanguageFromCSpellInfo';
export const commandTest              = 'cSpell.test';

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

    let lastDocumentUri: vscode.Uri = undefined;
    const imagesUri = vscode.Uri.file(context.asAbsolutePath('images'));
    const imagesPath = imagesUri.path;

    class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
            const editor = lastDocumentUri && findMatchingVisibleTextEditors(lastDocumentUri.toString())[0]
                || vscode.window.activeTextEditor;
            return this.createInfoHtml(editor);
        }

        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }

        private createInfoHtml(editor: vscode.TextEditor): Thenable<string> {
            const document = editor.document;
            if (!document) {
                return Promise.resolve('<body>Document has been closed.</body>');
            }
            const uri = document.uri;
            const filename = path.basename(uri.path);
            const diags = client.diagnostics.get(uri);
            const allSpellingErrors = (diags || [])
                .map(d => d.range)
                .map(range => document.getText(range));
            const spellingErrors = diags && util.freqCount(allSpellingErrors);
            autoRefresh(uri);  // Since the diags can change, we need to setup a refresh.
            return client.isSpellCheckEnabled(document).then(response => {
                const { fileEnabled = false, languageEnabled = false } = response;
                const languageId = document.languageId;
                const html = preview.render({
                    fileEnabled,
                    languageEnabled,
                    languageId,
                    filename,
                    spellingErrors,
                    linkEnableDisableLanguage: generateEnableDisableLanguageLink(!languageEnabled, languageId, document.uri),
                    imagesPath,
                });
                return html;
            });
        }
    }

    const provider = new TextDocumentContentProvider();
    const registration = vscode.workspace.registerTextDocumentContentProvider(schemeCSpellInfo, provider);

    const subOnDidChangeTextDocument = onRefresh
        .do(uri => lastDocumentUri = uri)
        .debounceTime(250)
        .subscribe(() => provider.update(previewUri));

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        if (vscode.window.activeTextEditor && e.document && e.document === vscode.window.activeTextEditor.document) {
            onRefresh.next(e.document.uri);
        }
    });

    vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor) => {
        if (editor && editor === vscode.window.activeTextEditor && editor.document) {
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

    function findMatchingVisibleTextEditors(uri: string) {
        return vscode.window.visibleTextEditors
            .filter(editor => editor.document && (editor.document.uri.toString() === uri));
    }

    function changeFocus(uri: string) {
        const promises = findMatchingVisibleTextEditors(uri)
            .map(editor => vscode.window.showTextDocument(editor.document, editor.viewColumn, false));
        return Promise.all(promises);
    }

    function triggerSettingsRefresh(uri: vscode.Uri) {
        client.triggerSettingsRefresh();
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

    function testCommand(...args: any[]) {
        const stopHere = args;
    }

    function autoRefresh(uri: vscode.Uri) {
        lastDocumentUri = uri;
        setTimeout(() => {
            if (uri === lastDocumentUri) {
                onRefresh.next(uri);
            }
        }, 1000);
    }

    context.subscriptions.push(
        vscode.commands.registerCommand(commandDisplayCSpellInfo, displayCSpellInfo),
        vscode.commands.registerCommand(commandEnableLanguage, enableLanguage),
        vscode.commands.registerCommand(commandDisableLanguage, disableLanguage),
        vscode.commands.registerCommand(commandTest, testCommand),
        registration,
        makeDisposable(subOnDidChangeTextDocument),
    );
}
