import * as vscode from 'vscode';

import type { SpellingCheckerIssue } from '../issueTracker.mjs';

export const icons = {
    issue: new vscode.ThemeIcon('issues', new vscode.ThemeColor('list.warningForeground')),
    info: new vscode.ThemeIcon('info'),
    warning: new vscode.ThemeIcon('warning', new vscode.ThemeColor('list.warningForeground')),
    error: new vscode.ThemeIcon('error', new vscode.ThemeColor('list.errorForeground')),
    doc: new vscode.ThemeIcon('go-to-file'),
    applySuggestion: new vscode.ThemeIcon('pencil'), // new vscode.ThemeIcon('lightbulb'),
    applySuggestionPreferred: new vscode.ThemeIcon('pencil'), // new vscode.ThemeIcon('lightbulb-autofix'),
    gear: new vscode.ThemeIcon('gear'),
} as const;

export function getIconForSpellingIssue(issue: SpellingCheckerIssue): vscode.ThemeIcon {
    return getIconForIssues({
        isFlagged: () => issue.isFlagged(),
        isKnown: () => issue.isKnown(),
        isSuggestion: () => issue.treatAsSuggestion(),
    });
}

interface IssueInfo {
    isFlagged(): boolean;
    isKnown(): boolean;
    isSuggestion(): boolean;
}

export function getIconForIssues(issue: IssueInfo) {
    if (issue.isFlagged()) return icons.error;
    if (issue.isKnown()) return icons.warning;
    if (issue.isSuggestion()) return icons.info;
    return icons.issue;
}
