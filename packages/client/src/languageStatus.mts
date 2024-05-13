import { autoResolve } from '@internal/common-utils';
import { createDisposableList } from 'utils-disposables';
import type { Disposable } from 'vscode';
import vscode from 'vscode';

import type { ServerResponseIsSpellCheckEnabledForFile } from './client/client.mjs';
import { getClient, getIssueTracker } from './di.mjs';
import type { CSpellSettings } from './settings/CSpellSettings.mjs';
import { ConfigFields } from './settings/index.mjs';
import { handleErrors } from './util/errors.js';

const showLanguageStatus = true;
const alwaysShowFiletype = true;

export function createLanguageStatus(): Disposable {
    const dList = createDisposableList();
    if (!showLanguageStatus) return dList;

    const statusIds = new Set<string>();
    const statusItems = new Map<string, vscode.LanguageStatusItem>();
    let pendingTimeout: NodeJS.Timeout | undefined = undefined;
    let showLanguageStatusFields = getShowLanguageStatusFields();

    dList.push(vscode.window.onDidChangeActiveTextEditor(queueUpdate));
    dList.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            e.affectsConfiguration('cSpell') && queueUpdate();
            showLanguageStatusFields = getShowLanguageStatusFields();
        }),
    );
    dList.push(getIssueTracker().onDidChangeDiagnostics(() => updateNow(false)));

    updateNow();

    return dList;

    function getItem(id: string) {
        const item = autoResolve(statusItems, id, (id) => vscode.languages.createLanguageStatusItem(id, { language: '*' }));
        dList.add(item);
        return item;
    }

    function deleteItem(...ids: string[]) {
        for (const id of ids) {
            const item = statusItems.get(id);
            item?.dispose();
            statusItems.delete(id);
            dList.delete(item);
        }
    }

    function getUpdateCheckedStatusItem(id: string) {
        statusIds.add(id);
        return getItem(id);
    }

    function updateChecked(response: ServerResponseIsSpellCheckEnabledForFile | undefined) {
        const document = vscode.window.activeTextEditor?.document;
        if (!document || !response) {
            deleteItem(...statusIds);
            return;
        }

        // file type
        if ((!response.languageIdEnabled || alwaysShowFiletype) && showLanguageStatusFields.fileType) {
            const fileTypeItem = getUpdateCheckedStatusItem('cspell-file-type');
            fileTypeItem.name = 'Spell';
            fileTypeItem.severity = response.languageIdEnabled
                ? vscode.LanguageStatusSeverity.Information
                : vscode.LanguageStatusSeverity.Warning;
            fileTypeItem.text = `Spell Checker is ${response.languageIdEnabled ? 'enabled' : 'disabled'} for ${document.languageId}`;
            fileTypeItem.command = commandEnableFileType(document.uri, document.languageId, !response.languageIdEnabled);
        } else {
            deleteItem('cspell-file-type');
        }

        if (!response.schemeIsAllowed && showLanguageStatusFields.scheme) {
            const fileTypeItem = getUpdateCheckedStatusItem('cspell-scheme');
            fileTypeItem.name = 'Scheme';
            fileTypeItem.severity = vscode.LanguageStatusSeverity.Information;
            fileTypeItem.text = 'Scheme is not allowed';
        } else {
            deleteItem('cspell-scheme');
        }
    }

    function updateIssues() {
        const id = 'cspell-issues';
        const document = vscode.window.activeTextEditor?.document;
        const issues = document ? getIssueTracker().getIssues(document.uri) : undefined;
        if (!issues?.length || !showLanguageStatusFields.issues) {
            deleteItem(id);
            return;
        }
        const stats = issues.getStats();
        const issuesItem = getItem(id);
        issuesItem.name = 'Issues';
        issuesItem.severity = vscode.LanguageStatusSeverity.Information; // issues.length ? vscode.LanguageStatusSeverity.Warning : vscode.LanguageStatusSeverity.Information;
        issuesItem.text = `${stats.spelling ? '$(warning)' : '$(check)'} ${stats.spelling} Spelling Issues`;
        const parts = [];
        stats.flagged && parts.push(`Flagged: ${stats.flagged}`);
        issuesItem.detail = parts.join('\n');
        issuesItem.command = { command: 'cSpell.openIssuesPanel', title: 'open' };
    }

    function updateNow(requestSettings = true) {
        if (requestSettings) {
            const document = vscode.window.activeTextEditor?.document;
            handleErrors(document ? getClient().isSpellCheckEnabled(document) : Promise.resolve(undefined), 'Language Status').then(
                updateChecked,
            );
        }
        updateIssues();
    }

    function queueUpdate() {
        if (pendingTimeout) {
            clearTimeout(pendingTimeout);
        }
        pendingTimeout = setTimeout(() => {
            pendingTimeout = undefined;
            updateNow();
        }, 100);
    }
}

function commandEnableFileType(uri: vscode.Uri, languageId: string, enable: boolean) {
    const cmd = enable
        ? command('cSpell.enableCurrentFileType', `enable`, `Enable Spell Checking for ${languageId} files.`)
        : command('cSpell.disableCurrentFileType', `disable`, `Disable Spell Checking for ${languageId} files.`);
    cmd.arguments = [languageId, uri];
    return cmd;
}

function command(command: string, title: string, tooltip?: string): vscode.Command {
    return {
        command,
        title,
        tooltip,
    };
}

function getShowLanguageStatusFields() {
    const showLanguageStatusFields: Partial<Exclude<CSpellSettings[typeof ConfigFields.languageStatusFields], undefined>> = vscode.workspace
        .getConfiguration('cSpell')
        .get(ConfigFields.languageStatusFields) || {
        fileType: true,
        scheme: true,
        issues: true,
    };
    return showLanguageStatusFields;
}
