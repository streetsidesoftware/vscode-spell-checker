import type { Suggestion } from 'code-spell-checker-server/api';
import type { CodeActionContext, CodeActionProvider, Command, Range, Selection, TextDocument } from 'vscode';
import { CodeAction, CodeActionKind, languages } from 'vscode';

import { requestSpellingSuggestions } from './codeActions/actionSuggestSpellingCorrections';
import { createTextEditCommand } from './commands';
import { filterDiags } from './diags';
import type { IssueTracker, SpellingDiagnostic } from './issueTracker';

export class SpellCheckerCodeActionProvider implements CodeActionProvider {
    public static readonly providedCodeActionKinds = [CodeActionKind.QuickFix];

    constructor(readonly issueTracker: IssueTracker) {}

    async provideCodeActions(
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        // token: CancellationToken,
    ): Promise<(CodeAction | Command)[]> {
        const contextDiags = filterDiags(context.diagnostics);
        if (contextDiags.length) {
            // Already handled by the language server.
            return [];
        }

        const diags = this.issueTracker.getDiagnostics(document.uri).filter((diag) => diag.range.contains(range));
        if (diags.length !== 1) return [];
        const pendingDiags = diags.map((diag) => this.diagToAction(document, diag));
        return (await Promise.all(pendingDiags)).flatMap((action) => action);
    }

    private async diagToAction(doc: TextDocument, diag: SpellingDiagnostic): Promise<(CodeAction | Command)[]> {
        const suggestions = diag.data?.suggestions;
        if (!suggestions?.length) {
            // fetch the result from the server.
            const actionsFromServer = await requestSpellingSuggestions(doc, diag.range, [diag]);
            return actionsFromServer;
        }
        return suggestions.map((sug) => suggestionToAction(doc, diag.range, sug));
    }
}

function suggestionToAction(doc: TextDocument, range: Range, sug: Suggestion): CodeAction {
    const title = `Replace with: ${sug.word}`;
    const action = new CodeAction(title, CodeActionKind.QuickFix);
    action.isPreferred = sug.isPreferred;
    action.command = createTextEditCommand(title, doc.uri, doc.version, [{ range, newText: sug.word }]);
    return action;
}

export function registerSpellCheckerCodeActionProvider(issueTracker: IssueTracker) {
    return languages.registerCodeActionsProvider('*', new SpellCheckerCodeActionProvider(issueTracker), {
        providedCodeActionKinds: SpellCheckerCodeActionProvider.providedCodeActionKinds,
    });
}
