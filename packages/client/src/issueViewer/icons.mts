import * as vscode from 'vscode';

import type { SpellingCheckerIssue } from '../issueTracker.mjs';

interface Icons {
    readonly issue: vscode.ThemeIcon;
    readonly info: vscode.ThemeIcon;
    readonly warning: vscode.ThemeIcon;
    readonly error: vscode.ThemeIcon;
    readonly doc: vscode.ThemeIcon;
    readonly applySuggestion: vscode.ThemeIcon;
    readonly applySuggestionPreferred: vscode.ThemeIcon;
    readonly gear: vscode.ThemeIcon;
}

export const icons: Icons = {
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

export function getIconForIssues(issue: IssueInfo): vscode.ThemeIcon {
    if (issue.isFlagged()) return icons.error;
    if (issue.isKnown()) return icons.warning;
    if (issue.isSuggestion()) return icons.info;
    return icons.issue;
}
