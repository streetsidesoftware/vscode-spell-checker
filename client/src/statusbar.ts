import * as path from 'path';
import {CSpellUserSettings} from './CSpellSettings';
import { workspace, ExtensionContext, window, TextEditor } from 'vscode';
import * as vscode from 'vscode';
import { CSpellClient } from './cSpellClient';
import * as cSpellInfo from './cSpellInfo';

export function initStatusBar(context: ExtensionContext, client: CSpellClient) {

    const sbCheck = window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    function updateStatusBarWithSpellCheckStatus(e: TextEditor) {
        if (!e) {
            return;
        }
        const { uri = { fsPath: undefined }, languageId = '' } = e.document || {uri: { fsPath: undefined }, languageId: ''};
        const genOnOffIcon = (on: boolean) => on ? '$(checklist)' : '$(stop)';
        sbCheck.color = 'white';
        sbCheck.text = '$(clock)';
        sbCheck.tooltip = 'cSpell waiting...';
        sbCheck.show();
        client.isSpellCheckEnabled(e.document)
            .then((response) => {
                const { activeTextEditor } = window;
                if (activeTextEditor && activeTextEditor.document) {
                    const { document } = activeTextEditor;
                    if (document.uri === uri) {
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
                }
            });
    }

    function onDidChangeActiveTextEditor(e: TextEditor) {
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

