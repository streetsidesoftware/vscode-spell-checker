import * as path from 'path';
import {CSpellUserSettings} from './CSpellSettings';
import { workspace, ExtensionContext, window, TextEditor, ThemeColor } from 'vscode';
import * as vscode from 'vscode';
import { CSpellClient } from './cSpellClient';
import * as cSpellInfo from './cSpellInfo';
import { Maybe } from './util';
import { isSupportedUri } from './uriHelper';


export function initStatusBar(context: ExtensionContext, client: CSpellClient) {

    const sbCheck = window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    function updateStatusBarWithSpellCheckStatus(e: Maybe<TextEditor>) {
        if (!e || !e.document) return;
        const document = e.document;
        if (! isSupportedUri(document.uri)) return;
        const { uri, languageId = '' } = document;
        const genOnOffIcon = (on: boolean) => on ? '$(checklist)' : '$(stop)';
        sbCheck.color = new ThemeColor('statusBar.foreground');
        sbCheck.text = '$(clock)';
        sbCheck.tooltip = 'cSpell waiting...';
        sbCheck.show();
        client.isSpellCheckEnabled(e.document)
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
                    sbCheck.command = cSpellInfo.commandDisplayCSpellInfo;
                    sbCheck.show();
                }
            });
    }

    function onDidChangeActiveTextEditor(e: TextEditor) {
        if (!e || !e.document) return;
        const document = e.document;
        if (! isSupportedUri(document.uri)) return;
        const settings: CSpellUserSettings = workspace.getConfiguration().get('cSpell') as CSpellUserSettings;
        const { enabled, showStatus = true } = settings;

        if (!showStatus) {
            sbCheck.hide();
            return;
        }

        if (enabled) {
            updateStatusBarWithSpellCheckStatus(e);
        } else {
            sbCheck.text = '$(stop) cSpell';
            sbCheck.tooltip = 'Enable spell checking';
            sbCheck.command = 'cSpell.enableForWorkspace';
            sbCheck.show();
        }
    }

    function onDidChangeConfiguration() {
        if (window.activeTextEditor) {
            onDidChangeActiveTextEditor(window.activeTextEditor);
        }
    }

    sbCheck.text = '$(clock)';
    sbCheck.show();

    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor),
        workspace.onDidChangeConfiguration(onDidChangeConfiguration),
        sbCheck
    );

    if (window.activeTextEditor) {
        onDidChangeActiveTextEditor(window.activeTextEditor);
    }

}

