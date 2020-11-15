import * as path from 'path';
import { CSpellUserSettings } from './server';
import { workspace, ExtensionContext, window, TextEditor } from 'vscode';
import * as vscode from 'vscode';
import { CSpellClient, ServerResponseIsSpellCheckEnabledForFile } from './client';
import * as infoViewer from './infoViewer';
import { isSupportedUri, isSupportedDoc } from './util';
import { sectionCSpell } from './settings';

export function initStatusBar(context: ExtensionContext, client: CSpellClient): void {
    const sbCheck = window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    let lastUri = '';

    async function updateStatusBarWithSpellCheckStatus(document?: vscode.TextDocument, showClock?: boolean) {
        if (showClock ?? true) {
            sbCheck.text = '$(clock)';
            sbCheck.tooltip = 'cSpell waiting...';
            sbCheck.show();
        }
        if (!document) return;

        const { uri, languageId = '' } = document;
        lastUri = uri.toString();
        const genOnOffIcon = (on: boolean) => (on ? '$(check)' : '$(exclude)');
        const response = await client.isSpellCheckEnabled(document);
        const docUri = window.activeTextEditor?.document?.uri;
        if (docUri === response.uri || !docUri || docUri.scheme !== 'file') {
            const { languageEnabled = true, fileEnabled = true } = response;
            const isChecked = languageEnabled && fileEnabled;
            const isCheckedText = isChecked ? 'is' : 'is NOT';
            const langReason = languageEnabled ? '' : `The "${languageId}" language / filetype is not enabled.`;
            const fileReason = formatFileReason(response);
            const fileName = path.basename(uri.fsPath);
            const langText = `${genOnOffIcon(languageEnabled)} ${languageId}`;
            const fileText = `${genOnOffIcon(fileEnabled)} ${fileName}`;
            const reason = [`"${fileName}" ${isCheckedText} spell checked.`, langReason, fileReason].filter((a) => !!a).join(' ');
            sbCheck.text = `${langText} | ${fileText}`;
            sbCheck.tooltip = reason;
            sbCheck.command = infoViewer.commandDisplayCSpellInfo;
            sbCheck.show();
        }
    }

    function formatFileReason(response: ServerResponseIsSpellCheckEnabledForFile): string {
        if (response.fileEnabled) return '';
        if (!response.excludedBy?.length) {
            return 'The file path is excluded in settings.';
        }
        const ex = response.excludedBy[0];
        const { glob, name, id } = ex;
        const filename = ex.filename && vscode.workspace.asRelativePath(ex.filename);
        return `File excluded by ${JSON.stringify(glob)} in ${filename || id || name || 'settings'}`;
    }

    function updateStatusBar(doc?: vscode.TextDocument, showClock?: boolean) {
        const document = isSupportedDoc(doc) ? doc : selectDocument();
        const settings: CSpellUserSettings = workspace.getConfiguration().get('cSpell') as CSpellUserSettings;
        const { enabled, showStatus = true } = settings;

        if (!showStatus) {
            sbCheck.hide();
            return;
        }

        if (enabled) {
            updateStatusBarWithSpellCheckStatus(document, showClock);
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

    function onDidChangeConfiguration(e: vscode.ConfigurationChangeEvent) {
        const doc = selectDocument();
        if (e.affectsConfiguration(sectionCSpell, doc?.uri)) {
            setTimeout(() => updateStatusBar(undefined, false), 250);
            setTimeout(() => updateStatusBar(undefined, false), 1000);
        }
    }

    function isViableEditor(e?: TextEditor) {
        if (!e) return false;
        const document = e.document;

        return document?.uri && isSupportedUri(document.uri);
    }

    function selectDocument() {
        if (window.activeTextEditor && isViableEditor(window.activeTextEditor)) {
            return window.activeTextEditor.document;
        }

        const docs = workspace.textDocuments.filter(isSupportedDoc);

        if (lastUri) {
            const candidate = docs.find((document) => document.uri.toString() === lastUri);
            if (candidate) return candidate;
        }

        return docs[0];
    }

    sbCheck.text = '$(clock)';
    sbCheck.show();

    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor),
        workspace.onDidChangeConfiguration(onDidChangeConfiguration),
        workspace.onDidCloseTextDocument(updateStatusBar),
        sbCheck
    );

    if (window.activeTextEditor) {
        onDidChangeActiveTextEditor(window.activeTextEditor);
    }
}
