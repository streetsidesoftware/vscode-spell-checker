import { Uri, languages, Diagnostic, TextDocument, Selection, Range } from 'vscode';
import { diagnosticSource } from './constants';
import { isDefined } from './util';

/**
 * Return cspell diags for a given uri.
 * @param docUri - uri of diag to look for.
 * @returns any cspell diags found matching the uri.
 */
export function getCSpellDiags(docUri: Uri | undefined): Diagnostic[] {
    const diags = (docUri && languages.getDiagnostics(docUri)) || [];
    const cSpellDiags = diags.filter((d) => d.source === diagnosticSource);
    return cSpellDiags;
}

export function extractMatchingDiagText(
    doc: TextDocument | undefined,
    selection: Selection | undefined,
    diags: Diagnostic[] | undefined
): string | undefined {
    if (!doc || !selection || !diags) return undefined;
    return extractMatchingDiagTexts(doc, selection, diags)?.join(' ');
}

function extractMatchingDiagTexts(
    doc: TextDocument | undefined,
    selection: Selection | undefined,
    diags: Diagnostic[] | undefined
): string[] | undefined {
    if (!doc || !diags) return undefined;
    const ranges = extractMatchingDiagRanges(doc, selection, diags);
    return ranges?.map((r) => doc.getText(r));
}

export function extractMatchingDiagRanges(
    doc: TextDocument | undefined,
    selection: Selection | undefined,
    diags: Diagnostic[] | undefined
): Range[] | undefined {
    if (!doc || !diags) return undefined;
    const selText = selection && doc.getText(selection);
    const matching = diags
        .map((d) => d.range)
        .map((r) => determineWordRangeToAddToDictionaryFromSelection(selText, selection, r))
        .filter(isDefined);
    return matching;
}

/**
 * An expression that matches most word like constructions. It just needs to be close.
 * If it doesn't match, the idea is to fall back to the diagnostic selection.
 */
const regExpIsWordLike = /^[\p{L}\w.-]+$/u;

function determineWordRangeToAddToDictionaryFromSelection(
    selectedText: string | undefined,
    selection: Selection | undefined,
    diagRange: Range
): Range | undefined {
    if (!selection || selectedText === undefined || diagRange.contains(selection)) return diagRange;

    const intersect = selection.intersection(diagRange);
    if (!intersect || intersect.isEmpty) return undefined;

    // The selection is bigger than the diagRange. Did the person intend for the entire selection to
    // be included or just the diag. If the selected text is a word, then assume the entire selection
    // was wanted, otherwise use the diag range.

    return regExpIsWordLike.test(selectedText) ? selection : diagRange;
}

export const __testing__ = {
    determineWordRangeToAddToDictionaryFromSelection,
    extractMatchingDiagTexts,
};
