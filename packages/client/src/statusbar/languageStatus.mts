import { autoResolve } from '@internal/common-utils';
import { createDisposableList } from 'utils-disposables';
import type { Disposable } from 'vscode';
import vscode from 'vscode';

import type { ServerResponseIsSpellCheckEnabledForFile } from '../client/client.mjs';
import { knownCommands } from '../commands.mjs';
import { extensionId } from '../constants.js';
import { getClient, getIssueTracker } from '../di.mjs';
import type { IssuesStats } from '../issueTracker.mjs';
import { handleErrors } from '../util/errors.js';

const showLanguageStatus = true;

interface LanguageStatusOptions {
    areIssuesVisible: () => boolean;
    onDidChangeVisibility: (fn: () => void) => Disposable;
}

const issuesItemCommand = { command: knownCommands['cspell.showActionsMenu'], title: 'menu' };

export function createLanguageStatus(options: LanguageStatusOptions): Disposable {
    const dList = createDisposableList();
    if (!showLanguageStatus) return dList;

    const statusItems: Map<string, vscode.LanguageStatusItem> = new Map();
    let pendingTimeout: NodeJS.Timeout | undefined = undefined;
    let isEnabledResponse: ServerResponseIsSpellCheckEnabledForFile | undefined = undefined;
    let currDocument: vscode.TextDocument | undefined = undefined;

    dList.push(vscode.window.onDidChangeActiveTextEditor(queueUpdate));
    dList.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(extensionId)) queueUpdate();
        }),
    );
    dList.push(getIssueTracker().onDidChangeDiagnostics(() => updateNow()));
    dList.push(options.onDidChangeVisibility(() => updateNow(false)));

    updateNow();

    return dList;

    function getItem(id: string) {
        const item = autoResolve(statusItems, id, (id) => vscode.languages.createLanguageStatusItem(id, { language: '*' }));
        dList.add(item);
        return item;
    }

    function updateIssues(response: ServerResponseIsSpellCheckEnabledForFile | undefined) {
        const { enabled: checkEnabled, fileEnabled, languageIdEnabled, languageId = '' } = response || {};
        const enabled = checkEnabled && fileEnabled && languageIdEnabled;
        const document = vscode.window.activeTextEditor?.document;
        const issues = document ? getIssueTracker().getSpellingIssues(document.uri) : undefined;
        const stats: Partial<IssuesStats> = issues?.getStats() || {};
        const icons = [];
        const issuesCount = stats.spelling || 0;
        const flaggedCount = stats.flagged || 0;
        const warnCount = issuesCount - flaggedCount;
        if (enabled === undefined) icons.push('$(repo-sync)');
        if (enabled === false) icons.push('$(exclude)');
        if (enabled && !options.areIssuesVisible()) icons.push('$(eye-closed)');
        if (enabled && !issuesCount) icons.push('$(check)');
        if (enabled && flaggedCount) icons.push(`$(error) ${flaggedCount}`);
        if (enabled && warnCount) icons.push(`$(warning) ${warnCount}`);
        const icon = icons.join(' ');
        const issuesItemText = `${icon} Spell`;
        const detailParts: string[] = [];
        if (enabled === false) {
            detailParts.push('- Spell checking is NOT enabled for this file.');
        }
        if (languageIdEnabled === false) {
            detailParts.push(`- File Type: \`${languageId}\` is NOT enabled.`);
        }
        if (response?.fileIsExcluded) {
            const parts: string[] = [];
            response.excludedBy?.forEach((excludedBy) => parts.push(`- Excluded by ${excludedBy.name}`));
            detailParts.push(...parts);
        }
        const issuesItemDetail = detailParts.length ? detailParts.join('\n') : undefined;
        updateLanguageStatusItem(issuesItemText, issuesItemDetail);
    }

    function updateNow(requestSettings = true) {
        if (requestSettings) {
            const document = vscode.window.activeTextEditor?.document;
            if (document !== currDocument) {
                currDocument = document;
                isEnabledResponse = undefined;
            }
            handleErrors(document ? getClient().isSpellCheckEnabled(document) : Promise.resolve(undefined), 'Language Status').then(
                (response) => updateIssues((isEnabledResponse = response)),
            );
        }
        updateIssues(isEnabledResponse);
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

    function updateLanguageStatusItem(text: string, detail: string | undefined) {
        const id = 'cspell-issues';
        const item = getItem(id);
        conditionalUpdateLanguageStatusItem(item, 'name', 'Issues');
        conditionalUpdateLanguageStatusItem(item, 'severity', vscode.LanguageStatusSeverity.Information);
        conditionalUpdateLanguageStatusItem(item, 'text', text);
        conditionalUpdateLanguageStatusItem(item, 'detail', detail);
        conditionalUpdateLanguageStatusItem(item, 'command', issuesItemCommand);
    }
}

function conditionalUpdateLanguageStatusItem<K extends keyof vscode.LanguageStatusItem>(
    item: vscode.LanguageStatusItem,
    key: K,
    value: vscode.LanguageStatusItem[K],
) {
    if (item[key] !== value) {
        item[key] = value;
    }
}
