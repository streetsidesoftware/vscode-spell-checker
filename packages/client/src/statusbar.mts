import { isSupportedDoc, isSupportedUri, uriToName } from '@internal/common-utils/uriHelper';
import * as path from 'path';
import type { ExtensionContext, TextEditor } from 'vscode';
import { window, workspace } from 'vscode';
import * as vscode from 'vscode';

import type { CSpellClient, CSpellUserSettings, ServerResponseIsSpellCheckEnabledForFile } from './client/index.mjs';
import { getCSpellDiags } from './diags.mjs';
import * as infoViewer from './infoViewer/index.js';
import { sectionCSpell } from './settings/index.mjs';

const statusBarId = 'spell checker status id';

const cspellStatusBarIcon = 'Spell'; // '$(symbol-text)'

export interface SpellCheckerStatusBar {
    refresh(): void;
}

export function initStatusBar(context: ExtensionContext, client: CSpellClient): SpellCheckerStatusBar {
    const settings: CSpellUserSettings = workspace.getConfiguration().get(sectionCSpell) as CSpellUserSettings;
    const { showStatusAlignment } = settings;
    const alignment = toStatusBarAlignment(showStatusAlignment);
    const sbCheck = window.createStatusBarItem(statusBarId, alignment);
    sbCheck.name = 'Code Spell Checker';

    let lastUri = '';

    interface DebounceStatusBar {
        document: vscode.TextDocument | undefined;
        showClock: boolean | undefined;
        value: Promise<void>;
        pending: boolean;
        stale: boolean;
    }
    let debounceStatusBar: DebounceStatusBar | undefined;

    function updateStatusBarWithSpellCheckStatus(document?: vscode.TextDocument, showClock?: boolean): void {
        if (debounceStatusBar) {
            debounceStatusBar.stale = debounceStatusBar.stale || !debounceStatusBar.pending || debounceStatusBar.document !== document;
            debounceStatusBar.document = document;
            debounceStatusBar.showClock = showClock;
            return;
        }
        if (showClock ?? true) {
            sbCheck.text = `$(clock) ${cspellStatusBarIcon}`;
            sbCheck.tooltip = 'cSpell waiting...';
            sbCheck.show();
        }
        if (!document) return;

        const entry = {
            document,
            showClock,
            value: _updateStatusBarWithSpellCheckStatus(document, showClock).catch(() => undefined),
            pending: true,
            stale: false,
        };

        entry.value
            .catch(() => undefined)
            .finally(() => {
                cleanEntry(entry, true);
            });

        function cleanEntry(entry: DebounceStatusBar, wait = false) {
            entry.pending = false;
            if (debounceStatusBar !== entry) return;
            if (entry.stale) {
                debounceStatusBar = undefined;
                updateStatusBarWithSpellCheckStatus(entry.document, entry.showClock);
                return;
            }

            if (wait) {
                setTimeout(() => cleanEntry(entry), 1000);
            } else {
                debounceStatusBar = undefined;
            }
        }

        debounceStatusBar = entry;
    }

    async function _updateStatusBarWithSpellCheckStatus(document: vscode.TextDocument | undefined, showClock?: boolean) {
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
        if (docUri?.toString() === response.uri.toString() || !docUri || docUri.scheme !== 'file') {
            const diags = getCSpellDiags(docUri);
            const { languageEnabled = true, fileEnabled = true } = response;
            const isChecked = languageEnabled && fileEnabled;
            const isCheckedText = isChecked ? 'Is' : 'Is NOT';
            const langReason = `File type: **\`${languageId}\`** ${languageEnabled ? '' : 'is NOT enabled.'}`;
            const fileReason = formatFileReason(response);
            const fileName = path.basename(uri.fsPath);
            const issuesText = `Issues: **${diags.length}**\n\n`;
            sbCheck.text = statusBarText({ languageEnabled, fileEnabled, diags });
            const toolTip = new vscode.MarkdownString();
            toolTip.appendMarkdown(`**\`\`\`\`${fileName}\`\`\`\`**\n`);
            !isChecked && toolTip.appendMarkdown(`- ${isCheckedText} spell checked.\n`);
            langReason && toolTip.appendMarkdown(`- ${langReason}\n`);
            toolTip.appendMarkdown(`- Scheme: \`${response.uri.scheme}\`.\n`);
            fileReason && toolTip.appendMarkdown(`- ${fileReason}\n`);
            isChecked && toolTip.appendMarkdown(`- ${issuesText}\n`);
            response.blockedReason && toolTip.appendMarkdown(`- ${response.blockedReason.message}\n`);
            toolTip.isTrusted = true;
            sbCheck.tooltip = toolTip;
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
        const configPathLink = configPath ? `[${configPath}](${ex.configUri})` : '';
        return `File excluded by ${JSON.stringify(glob)} in ${configPathLink || id || name || 'settings'}`;
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
            updateStatusBarWithSpellCheckStatus(document, showClock);
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
            setTimeout(() => updateStatusBar(doc, false), 250);
            setTimeout(() => updateStatusBar(doc, false), 2000);
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

    sbCheck.text = `$(loading~spin) ${cspellStatusBarIcon}`;
    sbCheck.show();

    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor),
        workspace.onDidChangeConfiguration(onDidChangeConfiguration),
        workspace.onDidCloseTextDocument(updateStatusBar),
        vscode.languages.onDidChangeDiagnostics(onDidChangeDiag),
        sbCheck,
    );

    if (window.activeTextEditor) {
        onDidChangeActiveTextEditor(window.activeTextEditor);
    }

    return {
        refresh() {
            const doc = selectDocument();
            setTimeout(() => updateStatusBar(doc, false), 250);
        },
    };
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
