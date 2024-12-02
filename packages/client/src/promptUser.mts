import type { QuickPickOptions } from 'vscode';
import { Uri, window } from 'vscode';

import { extractMatchingDiagTexts, getCSpellDiags } from './diags.mjs';
import { normalizeWords } from './settings/CSpellSettings.mjs';
import { findEditor } from './vscode/findEditor.js';
import { toUri } from './util/uriHelper.mjs';

const compareStrings = new Intl.Collator().compare;

export function onCommandUseDiagsSelectionOrPrompt(
    prompt: string,
    fnAction: (text: string, uri: Uri | undefined) => Promise<void>,
): (text?: string, uri?: Uri | string) => Promise<void> {
    return async function (text?: string, uri?: Uri | string) {
        // console.log('onCommandUseDiagsSelectionOrPrompt %o', { prompt, text, uri });
        const selected = await determineTextSelection(prompt, text, uri);
        if (!selected) return;

        const editor = window.activeTextEditor;
        await fnAction(selected.text, selected.uri);
        await (editor?.document && window.showTextDocument(editor.document));
    };
}

async function determineTextSelection(
    prompt: string,
    textOrUri?: string | Uri,
    uri?: Uri | string,
): Promise<{ text: string; uri?: Uri } | undefined> {
    uri = uri ? toUri(uri) : textOrUri instanceof Uri ? textOrUri : undefined;
    if (typeof textOrUri === 'string' && textOrUri) {
        return { text: textOrUri, uri: uri || window.activeTextEditor?.document.uri };
    }

    const editor = findEditor(uri);

    const document = editor?.document;
    const selection = editor?.selection;
    const range = selection && document?.getWordRangeAtPosition(selection.active);
    const diags = document ? getCSpellDiags(document.uri) : undefined;
    const matchingDiagWords = normalizeWords(extractMatchingDiagTexts(document, selection, diags) || []);
    if (matchingDiagWords.length) {
        const picked =
            selection?.anchor.isEqual(selection.active) && matchingDiagWords.length === 1
                ? matchingDiagWords
                : await chooseWords(matchingDiagWords.sort(compareStrings), { title: prompt, placeHolder: 'Choose words' });
        if (!picked) return;
        return { text: picked.join(' '), uri: document?.uri };
    }

    if (!range || !selection || !document || !document.getText(range)) {
        const word = await window.showInputBox({ title: prompt, prompt });
        if (!word) return;
        return { text: word, uri: document?.uri };
    }

    const text = selection.contains(range) ? document.getText(selection) : document.getText(range);

    const words = normalizeWords(text);
    const picked =
        words.length > 1
            ? await chooseWords(words.sort(compareStrings), { title: prompt, placeHolder: 'Choose words' })
            : [await window.showInputBox({ title: prompt, prompt, value: words[0] })];
    if (!picked) return;
    return { text: picked.join(' '), uri: document.uri };
}

async function chooseWords(words: string[], options: QuickPickOptions): Promise<string[] | undefined> {
    if (words.length <= 1) {
        const picked = await window.showInputBox({ ...options, value: words[0] });
        if (!picked) return;
        return [picked];
    }

    const items = words.map((label) => ({ label, picked: true }));

    const picked = await window.showQuickPick(items, { ...options, canPickMany: true });
    return picked?.map((p) => p.label);
}
