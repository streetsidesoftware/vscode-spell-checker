// cSpell:words rxjs cspell diags
import * as vscode from 'vscode';
import * as path from 'path';
import { CSpellClient } from './cSpellClient';
import * as Rx from 'rxjs/Rx';
import * as preview from './pugCSpellInfo';
import * as commands from './commands';
import * as util from './util';
import {Maybe} from './util';
import { isSupportedUri } from './uriHelper';
import * as serverSettings from './serverSettings';

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

    let lastDocumentUri: Maybe<vscode.Uri> = undefined;
    const imagesUri = vscode.Uri.file(context.asAbsolutePath('images'));
    const imagesPath = imagesUri.path;

    class CSpellInfoTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        public provideTextDocumentContent(_: vscode.Uri): Thenable<string> {
            // console.log(_);
            const editor = vscode.window.activeTextEditor;
            const doc = lastDocumentUri && findMatchingDocument(lastDocumentUri.toString())
                || (editor && editor.document);
            return this.createInfoHtml(doc);
        }

        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }

        private createInfoHtml(document: Maybe<vscode.TextDocument>): Thenable<string> {
            if (!document) {
                return Promise.resolve('<body>Select an editor tab.</body>');
            }
            const uri = document.uri;
            const filename = path.basename(uri.path);
            const diagnostics = client.diagnostics;
            const diags = diagnostics && diagnostics.get(uri);
            const allSpellingErrors = (diags || [])
                .map(d => d.range)
                .map(range => document.getText(range));
            const spellingErrors = diags && util.freqCount(allSpellingErrors);
            autoRefresh(uri);  // Since the diags can change, we need to setup a refresh.
            return client.getConfigurationForDocument(document).then(response => {
                const { fileEnabled = false, languageEnabled = false, settings } = response;
                const languageId = document.languageId;
                const local = serverSettings.extractLanguage(settings);
                const availableLocals = serverSettings.extractLocals(settings);
                const html = preview.render({
                    fileEnabled,
                    languageEnabled,
                    languageId,
                    filename,
                    spellingErrors,
                    linkEnableDisableLanguage: generateEnableDisableLanguageLink(!languageEnabled, languageId, document.uri),
                    linkEnableLanguage: generateEnableDisableLanguageLink(true, languageId, document.uri),
                    linkDisableLanguage: generateEnableDisableLanguageLink(false, languageId, document.uri),
                    imagesPath,
                    local,
                    availableLocals,
                });
                return html;
            });
        }
    }

    const provider = new CSpellInfoTextDocumentContentProvider();
    const registration = vscode.workspace.registerTextDocumentContentProvider(schemeCSpellInfo, provider);

    const subOnDidChangeTextDocument = onRefresh
        .filter(uri => isSupportedUri(uri))
        // .do(uri => console.log('subOnDidChangeTextDocument: ' + uri.toString()))
        .do(uri => lastDocumentUri = uri)
        .debounceTime(250)
        .subscribe(() => provider.update(previewUri));

    const subOnDidChangeDoc = vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        if (vscode.window.activeTextEditor && e.document && e.document === vscode.window.activeTextEditor.document) {
            onRefresh.next(e.document.uri);
        }
    });

    const subOnDidChangeEditor = vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor) => {
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

    function findVisibleTextEditors(uri: string): vscode.TextEditor[] {
        const editors = vscode.window.visibleTextEditors
            .filter(e => !!e.document)
            .filter(e => e.document.uri.toString() === uri);
        return editors;
    }

    function findDocumentInVisibleTextEditors(uri: string):  Maybe<vscode.TextDocument> {
        const docs = vscode.window.visibleTextEditors
            .map(e => e.document)
            .filter(doc => !!doc)
            .filter(doc => doc.uri.toString() === uri);
        return docs[0];
    }

    function findMatchingDocument(uri: string): Maybe<vscode.TextDocument> {
        const workspace = vscode.workspace || {};
        const docs = (workspace.textDocuments || [])
            .filter(doc => doc.uri.toString() === uri);
        return docs[0] || findDocumentInVisibleTextEditors(uri);
    }

    function changeFocus(uri: string) {
        const promises = findVisibleTextEditors(uri)
            .map(editor => vscode.window.showTextDocument(editor.document, editor.viewColumn, false));
        return Promise.all(promises);
    }

    function enableLanguage(languageId: string, uri: string) {
        commands.enableLanguageId(languageId)
        .then(() => restoreFocus(uri));
    }

    function disableLanguage(languageId: string, uri: string) {
        commands.disableLanguageId(languageId)
        .then(() => restoreFocus(uri));
    }

    function restoreFocus(uri: string) {
        if (uri) {
            // triggerSettingsRefresh(vscode.Uri.parse(uri));
            changeFocus(uri);
        }
    }

    /*
    function triggerSettingsRefresh(uri: Maybe<vscode.Uri>) {
        client.triggerSettingsRefresh();
    }
    */

    function makeDisposable(sub: Rx.Subscription) {
        return {
            dispose: () => sub.unsubscribe()
        };
    }

    function testCommand(...args: any[]) {
        const _stopHere = args;
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
        subOnDidChangeEditor,
        subOnDidChangeDoc,
        vscode.commands.registerCommand(commandDisplayCSpellInfo, displayCSpellInfo),
        vscode.commands.registerCommand(commandEnableLanguage, enableLanguage),
        vscode.commands.registerCommand(commandDisableLanguage, disableLanguage),
        vscode.commands.registerCommand(commandTest, testCommand),
        registration,
        makeDisposable(subOnDidChangeTextDocument),
    );
}
