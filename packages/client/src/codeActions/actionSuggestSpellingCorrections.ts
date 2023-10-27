import type { CodeAction, Diagnostic, QuickPickItem, Range, TextDocument, Uri } from 'vscode';
import { commands, Selection, window } from 'vscode';

import * as di from '../di';
import { extractMatchingDiagRanges, getCSpellDiags } from '../diags';
import { toRange } from '../languageServer/clientHelpers';
import type { RangeLike } from '../languageServer/models';
import { ConfigFields, getSettingFromVSConfig } from '../settings';
import { findEditor } from '../util/findEditor';
import { pVoid } from '../util/pVoid';

interface SuggestionQuickPickItem extends QuickPickItem {
    _action: CodeAction;
}

export async function actionSuggestSpellingCorrections(docUri?: Uri, rangeLike?: RangeLike, _text?: string): Promise<void> {
    // console.log('Args: %o', { docUri, range: rangeLike, _text });
    const editor = findEditor(docUri);
    const document = editor?.document;
    const selection = editor?.selection;
    const rangeParam = rangeLike && toRange(rangeLike);
    const range = rangeParam || (selection && document?.getWordRangeAtPosition(selection.active));
    const diags = document ? getCSpellDiags(document.uri) : undefined;
    const matchingRanges = extractMatchingDiagRanges(document, selection, diags);
    const r = rangeParam || matchingRanges?.[0] || range;
    const matchingDiags = r && diags?.filter((d) => !!d.range.intersection(r));

    if (!document || !selection || !r || !matchingDiags) {
        return pVoid(window.showInformationMessage('Nothing to suggest.'), 'actionSuggestSpellingCorrections');
    }

    const menu = getSettingFromVSConfig(ConfigFields.suggestionMenuType, document);
    if (menu === 'quickFix' && editor) {
        if (rangeParam) {
            editor.selection = new Selection(rangeParam.start, rangeParam.end);
        }
        return await commands.executeCommand('editor.action.quickFix');
    }

    const actions = await requestSpellingSuggestions(document, r, matchingDiags);
    if (!actions || !actions.length) {
        return pVoid(window.showInformationMessage(`No Suggestions Found for ${document.getText(r)}`), 'actionSuggestSpellingCorrections');
    }

    const items: SuggestionQuickPickItem[] = actions.map((a) => ({ label: a.title, _action: a }));
    const picked = await window.showQuickPick(items);
    if (picked && picked._action.command) {
        const { command: cmd, arguments: args = [] } = picked._action.command;
        commands.executeCommand(cmd, ...args);
    }
}

export function requestSpellingSuggestions(document: TextDocument, range: Range, diags: Diagnostic[]) {
    return di.get('client').requestSpellingSuggestionsCodeActions(document, range, diags);
}
