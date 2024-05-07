import type { IssueType } from '@cspell/cspell-types';
import { createDisposableList } from 'utils-disposables';
import type { Diagnostic, Disposable, Event, Range, Selection, TextDocument, Uri } from 'vscode';
import vscode from 'vscode';

import { diagnosticSource } from './constants.js';
import { getDependencies } from './di.mjs';
import type { SpellingDiagnostic } from './issueTracker.mjs';
import { CSpellSettings, isWordLike } from './settings/CSpellSettings.mjs';
import { ConfigFields } from './settings/index.mjs';
import { isDefined, uniqueFilter } from './util/index.js';

/**
 * Return cspell diags for a given uri.
 * @param docUri - uri of diag to look for.
 * @param issueType - optional issue type to filter on -- by default it returns only spelling issues.
 * @returns any cspell diags found matching the uri.
 */
export function getCSpellDiags(docUri: Uri | undefined, issueType?: IssueType): SpellingDiagnostic[] {
    const issueTracker = getDependencies().issueTracker;
    const diags = (docUri && issueTracker.getIssues(docUri))?.map((issue) => issue.diag) || [];
    const cSpellDiags = filterDiags(diags).filter((d) => d.data?.issueType === issueType || (!d.data?.issueType && !issueType));
    return cSpellDiags;
}

export function filterDiags<D extends Diagnostic>(diags: readonly D[], source = diagnosticSource): D[] {
    return diags.filter((d) => d.source === source);
}

export function extractMatchingDiagText(
    doc: TextDocument | undefined,
    selection: Selection | undefined,
    diags: Diagnostic[] | undefined,
): string | undefined {
    if (!doc || !selection || !diags) return undefined;
    return extractMatchingDiagTexts(doc, selection, diags)?.filter(uniqueFilter()).join(' ');
}

export function extractMatchingDiagTexts(
    doc: TextDocument | undefined,
    selection: Selection | undefined,
    diags: Diagnostic[] | undefined,
): string[] | undefined {
    if (!doc || !diags) return undefined;
    const ranges = extractMatchingDiagRanges(doc, selection, diags);
    return ranges?.map((r) => doc.getText(r));
}

export function extractMatchingDiagRanges(
    doc: TextDocument | undefined,
    selection: Selection | undefined,
    diags: Diagnostic[] | undefined,
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

function determineWordRangeToAddToDictionaryFromSelection(
    selectedText: string | undefined,
    selection: Selection | undefined,
    diagRange: Range,
): Range | undefined {
    if (!selection || selectedText === undefined || diagRange.contains(selection)) return diagRange;

    const intersect = selection.intersection(diagRange);
    if (!intersect || intersect.isEmpty) return undefined;

    // The selection is bigger than the diagRange. Did the person intend for the entire selection to
    // be included or just the diag. If the selected text is a word, then assume the entire selection
    // was wanted, otherwise use the diag range.

    return isWordLike(selectedText) ? selection : diagRange;
}

export function registerDiagWatcher(show: boolean, onShowChange: Event<boolean>): Disposable {
    const dList = createDisposableList();
    const issueTracker = getDependencies().issueTracker;
    const collection = vscode.languages.createDiagnosticCollection('cSpell');
    let overrides: CSpellSettings[typeof ConfigFields.doNotUseCustomDecorationForScheme];
    let useDiagnosticCollection = true;

    function updateConfig() {
        const cfg = vscode.workspace.getConfiguration('cSpell');
        useDiagnosticCollection = !cfg.get(ConfigFields.useCustomDecorations);
        overrides = cfg.get(ConfigFields.doNotUseCustomDecorationForScheme);
    }

    function useDiagnosticsCollectionForScheme(uri: Uri): boolean {
        const scheme = uri.scheme;
        const diagLevel = overrides?.[scheme];
        if (!diagLevel) return useDiagnosticCollection;
        return !!diagLevel;
    }

    function updateDiags(uris?: readonly Uri[]) {
        if (!show) {
            collection.clear();
            return;
        }
        if (!uris) {
            collection.clear();
            uris = issueTracker.getUrisWithIssues();
        }

        // clean up the collection
        collection.forEach((uri) => {
            if (!useDiagnosticsCollectionForScheme(uri)) {
                collection.delete(uri);
            }
        });

        for (const uri of uris) {
            if (!useDiagnosticsCollectionForScheme(uri)) continue;
            const diags = issueTracker.getIssues(uri);
            collection.set(
                uri,
                diags?.map((issue) => issue.diag),
            );
        }
    }

    dList.push(
        collection,
        onShowChange((showIssues) => {
            show = showIssues;
            updateDiags();
        }),
        vscode.workspace.onDidChangeConfiguration(updateConfig),
        issueTracker.onDidChangeDiagnostics(({ uris }) => updateDiags(uris)),
    );

    updateConfig();
    return dList;
}

export const __testing__ = {
    determineWordRangeToAddToDictionaryFromSelection,
    extractMatchingDiagTexts,
};
