import * as path from 'path';
import {CSpellUserSettings} from './server';
import { workspace, ExtensionContext, window, TextEditor, ThemeColor } from 'vscode';
import * as vscode from 'vscode';
import { CSpellClient } from './client';
import * as infoViewer from './infoViewer';
import { isSupportedUri, isSupportedDoc } from './util';


export function initStatusBar(context: ExtensionContext, client: CSpellClient) {

    const sbCheck = window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    let lastUri = '';

    function updateStatusBarWithSpellCheckStatus(document?: vscode.TextDocument) {
        sbCheck.text = '$(clock)';
        sbCheck.tooltip = 'cSpell waiting...';
        sbCheck.show();
        if (!document) return;

        const { uri, languageId = '' } = document;
        lastUri = uri.toString();
        const genOnOffIcon = (on: boolean) => on ? '$(checklist)' : '$(stop)';
        client.isSpellCheckEnabled(document)
            .then((response) => {
                const { activeTextEditor } = window;
                const document = activeTextEditor && activeTextEditor.document;
                const docUri = document && document.uri;
                if (docUri === uri || !docUri || docUri.scheme !== 'file') {
                    const { languageEnabled = true, fileEnabled = true } = response;
                    const isChecked = languageEnabled && fileEnabled;
                    const isCheckedText = isChecked ? 'is' : 'is NOT';
                    const langReason = languageEnabled ? '' : `The "${languageId}" language is not enabled.`;
                    const fileReason = fileEnabled ? '' : `The file path is excluded in settings.`;
                    const fileName = path.basename(uri.fsPath);
                    const langText = `${genOnOffIcon(languageEnabled)} ${languageId}`;
                    const fileText = `${genOnOffIcon(fileEnabled)} ${fileName}`;
                    const reason = [`"${fileName}" ${isCheckedText} spell checked.`, langReason, fileReason].filter(a => !!a).join(' ');
                    sbCheck.text = `${langText} | ${fileText}`;
                    sbCheck.tooltip = reason;
                    sbCheck.command = infoViewer.commandDisplayCSpellInfo;
                    sbCheck.show();
                }
            });
    }

    function updateStatusBar(doc?: vscode.TextDocument) {
        const document = isSupportedDoc(doc) ? doc : selectDocument();
        const settings: CSpellUserSettings = workspace.getConfiguration().get('cSpell') as CSpellUserSettings;
        const { enabled, showStatus = true } = settings;

        if (!showStatus) {
            sbCheck.hide();
            return;
        }

        if (enabled) {
            updateStatusBarWithSpellCheckStatus(document);
        } else {
            sbCheck.text = '$(stop) cSpell';
            sbCheck.tooltip = 'Enable spell checking';
            sbCheck.command = 'cSpell.enableForWorkspace';
            sbCheck.show();
        }
    }

    function onDidChangeActiveTextEditor(e: TextEditor) {
        updateStatusBar(e && e.document);
    }

    function onDidChangeConfiguration() {
        updateStatusBar();
    }

    function isViableEditor(e?: TextEditor) {
        if (!e) return false;
        const document = e.document;

        return document &&
            document.uri &&
            isSupportedUri(document.uri);
    }

    function selectDocument() {
        if (isViableEditor(window.activeTextEditor)) {
            return window.activeTextEditor!.document;
        }

        const docs = workspace.textDocuments
            .filter(isSupportedDoc);

        if (lastUri) {
            const candidate = docs
                .filter(document => document.uri.toString() === lastUri)
                .shift();
            if (candidate) return candidate;
        }

        return docs.shift();
    }

    sbCheck.text = '$(clock)';
    sbCheck.show();

    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor),
        workspace.onDidChangeConfiguration(onDidChangeConfiguration),
        workspace.onDidCloseTextDocument(onDidChangeConfiguration),
        sbCheck
    );

    if (window.activeTextEditor) {
        onDidChangeActiveTextEditor(window.activeTextEditor);
    }

}

