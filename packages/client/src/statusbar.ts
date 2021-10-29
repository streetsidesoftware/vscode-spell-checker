import * as path from 'path';
import { CSpellUserSettings } from './client';
import { workspace, ExtensionContext, window, TextEditor } from 'vscode';
import * as vscode from 'vscode';
import { CSpellClient, ServerResponseIsSpellCheckEnabledForFile } from './client';
import * as infoViewer from './infoViewer';
import { isSupportedUri, isSupportedDoc, uriToName } from 'common-utils/uriHelper.js';
import { sectionCSpell } from './settings';
import { getCSpellDiags } from './diags';

const statusBarId = 'spell checker status id';

const cspellStatusBarIcon = 'Spell'; // '$(symbol-text)'

export function initStatusBar(context: ExtensionContext, client: CSpellClient): void {
    const settings: CSpellUserSettings = workspace.getConfiguration().get(sectionCSpell) as CSpellUserSettings;
    const { showStatusAlignment } = settings;
    const alignment = toStatusBarAlignment(showStatusAlignment);
    const sbCheck = window.createStatusBarItem(statusBarId, alignment);
    sbCheck.name = 'Code Spell Checker';

    let lastUri = '';

    async function updateStatusBarWithSpellCheckStatus(document?: vscode.TextDocument, showClock?: boolean) {
        if (showClock ?? true) {
            sbCheck.text = `$(clock) ${cspellStatusBarIcon}`;
            sbCheck.tooltip = 'cSpell waiting...';
            sbCheck.show();
        }
        if (!document) return;

        const { uri, languageId = '' } = document;
        lastUri = uri.toString();
        const response = await client.isSpellCheckEnabled(document);
        const docUri = window.activeTextEditor?.document?.uri;
        if (docUri === response.uri || !docUri || docUri.scheme !== 'file') {
            const diags = getCSpellDiags(docUri);
            const { languageEnabled = true, fileEnabled = true } = response;
            const isChecked = languageEnabled && fileEnabled;
            const isCheckedText = isChecked ? 'is' : 'is NOT';
            const langReason = languageEnabled ? '' : `The "${languageId}" filetype is not enabled.`;
            const fileReason = formatFileReason(response);
            const fileName = path.basename(uri.fsPath);
            const issuesText = `Issues: ${diags.length}`;
            sbCheck.text = statusBarText({ languageEnabled, fileEnabled, diags });
            const reason = [issuesText, `"${fileName}" ${isCheckedText} spell checked.`, langReason, fileReason]
                .filter((a) => !!a)
                .join('\n');
            sbCheck.tooltip = reason;
            sbCheck.command = infoViewer.commandDisplayCSpellInfo;
            sbCheck.show();
        }
    }

    function formatFileReason(response: ServerResponseIsSpellCheckEnabledForFile): string {
        if (response.blockedReason) return response.blockedReason.message;
        if (response.fileEnabled) return '';
        if (response.gitignored) return 'The file is excluded by .gitignore.';
        if (!response.excludedBy?.length) {
            return 'The file path is excluded in settings.';
        }
        const ex = response.excludedBy[0];
        const { glob, name, id } = ex;
        const configPath = ex.configUri && uriToName(vscode.Uri.parse(ex.configUri));
        return `File excluded by ${JSON.stringify(glob)} in ${configPath || id || name || 'settings'}`;
    }

    function toStatusBarAlignment(showStatusAlignment: CSpellUserSettings['showStatusAlignment']): vscode.StatusBarAlignment {
        switch (showStatusAlignment) {
            case 'Left':
                return vscode.StatusBarAlignment.Left;
            case 'Right':
                return vscode.StatusBarAlignment.Right;
        }
        return vscode.StatusBarAlignment.Left;
    }

    function updateStatusBar(doc?: vscode.TextDocument, showClock?: boolean) {
        const document = isSupportedDoc(doc) ? doc : selectDocument();
        const vsConfig = workspace.getConfiguration(undefined, doc);
        const settings: CSpellUserSettings = vsConfig.get(sectionCSpell) as CSpellUserSettings;
        const { enabled, showStatus = true } = settings;

        if (!showStatus) {
            sbCheck.hide();
            return;
        }

        if (enabled) {
            updateStatusBarWithSpellCheckStatus(document, showClock).catch();
        } else {
            sbCheck.text = `$(stop) ${cspellStatusBarIcon}`;
            sbCheck.tooltip = 'Enable spell checking';
            sbCheck.command = 'cSpell.enableForGlobal';
            sbCheck.show();
        }
    }

    function onDidChangeActiveTextEditor(e: TextEditor | undefined) {
        updateStatusBar(e?.document);
    }

    function onDidChangeDiag(e: vscode.DiagnosticChangeEvent) {
        for (const uri of e.uris) {
            if (uri.toString() === lastUri) {
                setTimeout(() => updateStatusBar(undefined, false), 250);
                break;
            }
        }
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
        vscode.languages.onDidChangeDiagnostics(onDidChangeDiag),
        sbCheck
    );

    if (window.activeTextEditor) {
        onDidChangeActiveTextEditor(window.activeTextEditor);
    }
}

interface StatusBarTextParams {
    languageEnabled: boolean;
    fileEnabled: boolean;
    diags: vscode.Diagnostic[];
}

function statusBarText({ languageEnabled, fileEnabled, diags }: StatusBarTextParams) {
    if (!languageEnabled || !fileEnabled) {
        return `$(exclude) ${cspellStatusBarIcon}`;
    }
    if (diags.length) {
        return `$(warning) ${diags.length} ${cspellStatusBarIcon}`;
    }
    return `$(check) ${cspellStatusBarIcon}`;
}
