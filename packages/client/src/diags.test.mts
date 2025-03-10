import { createTextDocument } from 'jest-mock-vscode';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import * as vscode from 'vscode';
import { Diagnostic, DiagnosticSeverity, Position, Range, Uri } from 'vscode';

import { getDependencies } from './di.mjs';
import { __testing__, extractMatchingDiagText, getCSpellDiags } from './diags.mjs';
import { SpellingCheckerIssue } from './issueTracker.mjs';
import { isDefined, mustBeDefined } from './util/index.mjs';

const { determineWordRangeToAddToDictionaryFromSelection, extractMatchingDiagTexts } = __testing__;

vi.mock('vscode');
vi.mock('vscode-languageclient/node');
vi.mock('./di.mjs');

const mockGetDependencies = vi.mocked(getDependencies);

describe('Validate diags', () => {
    beforeEach(() => {
        mockGetDependencies.mockImplementation(
            () =>
                ({
                    issueTracker: { rawIssues: vi.fn(implGetIssues) },
                }) as any,
        );
    });
    afterEach(() => {
        vi.resetAllMocks();
    });

    test('getCSpellDiags empty', () => {
        const mockGetDependencies = vi.mocked(getDependencies);
        mockGetDependencies.mockImplementation(
            () =>
                ({
                    issueTracker: { rawIssues: vi.fn(() => []) },
                }) as any,
        );
        const uri = Uri.parse(import.meta.url);
        const r = getCSpellDiags(uri);
        expect(r).toEqual([]);
        expect(vi.mocked(getDependencies)).toHaveBeenCalledTimes(1);
    });

    test('getCSpellDiags', () => {
        const uri = Uri.parse(import.meta.url);
        const r = getCSpellDiags(uri);
        expect(vi.mocked(getDependencies)).toHaveBeenCalledTimes(1);
        expect(r).toHaveLength(2);
    });

    test('getCSpellDiags undefined', () => {
        const r = getCSpellDiags(undefined);
        expect(r).toHaveLength(0);
    });
});

describe('Validate text extractors', () => {
    test.each`
        selection                              | diag       | expected
        ${'some text to test'}                 | ${'text'}  | ${'text'}
        ${'returnCode'}                        | ${'Code'}  | ${'returnCode'}
        ${' returnCode'}                       | ${'Code'}  | ${'Code'}
        ${sampleText()}                        | ${'Code'}  | ${'Code'}
        ${'return'}                            | ${'Code'}  | ${undefined}
        ${/(?<=Co)(?=de)/}                     | ${'Code'}  | ${'Code'}
        ${/(?=Code)/}                          | ${'Code'}  | ${'Code'}
        ${/(?<=Code)/}                         | ${'Code'}  | ${'Code'}
        ${'important_computations-and2.vélos'} | ${'vélos'} | ${'vélos'}
        ${'__not_found__'}                     | ${'text'}  | ${'text'}
        ${undefined}                           | ${'text'}  | ${'text'}
    `('determineWordToAddToDictionaryFromSelection sel: "$selection" diag: "$diag"', ({ selection, diag, expected }) => {
        const doc = sampleDoc();
        const sel = selection && findSelection(doc, selection);
        const selText = sel && doc.getText(sel);
        const diagRange = mustBeDefined(findRange(doc, diag));
        const range = determineWordRangeToAddToDictionaryFromSelection(selText, sel, diagRange);
        const word = range && doc.getText(range);
        expect(word).toBe(expected);
    });

    test.each`
        selection              | diags         | expected
        ${'some text to test'} | ${'test'}     | ${'test'}
        ${'some text to test'} | ${/\w+/g}     | ${'some text to test'}
        ${'some text to test'} | ${/\bt\w+/gi} | ${'text to test'}
        ${'__not_found__'}     | ${'text'}     | ${undefined}
        ${undefined}           | ${'text'}     | ${undefined}
    `('extractMatchingDiagText sel: "$selection" diags: "$diags"', ({ selection, diags, expected }) => {
        const doc = sampleDoc();
        const sel = selection ? findSelection(doc, selection) : undefined;
        const diagRanges = findRanges(doc, diags);
        const dd = diagRanges.map((r) => new vscode.Diagnostic(r, 'unknown word'));
        const word = extractMatchingDiagText(doc, sel, dd);
        expect(word).toBe(expected);
    });

    test.each`
        selection              | diags         | expected
        ${'some text to test'} | ${'test'}     | ${['test']}
        ${'some text to test'} | ${/\w+/g}     | ${['some', 'text', 'to', 'test']}
        ${'some text to test'} | ${/\bt\w+/gi} | ${['text', 'to', 'test']}
        ${'__not_found__'}     | ${'text'}     | ${['text']}
        ${undefined}           | ${'text'}     | ${['text']}
        ${undefined}           | ${/\bt\w+/gi} | ${['This', 'text', 'to', 'test']}
    `('extractMatchingDiagTexts sel: "$selection" diags: "$diags"', ({ selection, diags, expected }) => {
        const doc = sampleDoc();
        const sel = selection ? findSelection(doc, selection) : undefined;
        const diagRanges = findRanges(doc, diags);
        const dd = diagRanges.map((r) => new vscode.Diagnostic(r, 'unknown word'));
        const word = extractMatchingDiagTexts(doc, sel, dd);
        expect(word).toEqual(expected);
    });
});

function implGetIssues(uri?: Uri): SpellingCheckerIssue[] {
    const diags = sampleDiags()
        .flatMap(([, diags]) => diags)
        .filter((d) => d.diag.source === 'cSpell');
    // console.error('implGetDiagnostics %s', uri);
    if (!uri) return diags;
    return diags.filter((d) => d.uri.toString() === uri.toString());
}

function sampleDiags(): [Uri, SpellingCheckerIssue[]][] {
    const uriDir = Uri.parse(new URL('.', import.meta.url).toString());
    return [
        fakeFileIssues(Uri.parse(import.meta.url), [
            fakeDiag('eslint', 'eslint'),
            fakeDiag('Unknown word ', 'cSpell'),
            fakeDiag('Unknown word 2', 'cSpell'),
        ]),
        fakeFileIssues(Uri.joinPath(uriDir, 'other.js'), [fakeDiag('eslint', 'eslint'), fakeDiag('Unknown word ', 'cSpell')]),
        fakeFileIssues(Uri.joinPath(uriDir, 'this.js'), [fakeDiag('eslint', 'eslint'), fakeDiag('Unknown word ', 'cSpell')]),
    ];
}

function fakeDiag(message: string, source: string): Diagnostic {
    const posA = new Position(1, 0);
    const posB = new Position(1, 5);
    const range = new Range(posA, posB);

    const diag = new Diagnostic(range, message, DiagnosticSeverity.Information);
    diag.source = source;
    return diag;
}

function fakeFileIssues(uri: Uri, diags: Diagnostic[]): [Uri, SpellingCheckerIssue[]] {
    const document = createTextDocument(uri, sampleText());
    return [uri, diags.map((d) => SpellingCheckerIssue.fromDiagnostic(document, d, 1))];
}

function findSelection(doc: vscode.TextDocument, search: string | RegExp): vscode.Selection | undefined {
    const range = findRange(doc, search);
    return range && new vscode.Selection(range.start, range.end);
}

function findRange(doc: vscode.TextDocument, search: string | RegExp): vscode.Range | undefined {
    const text = doc.getText();
    const f = findInText(text, search);
    if (!f) return undefined;
    const { start, end } = f;
    return new vscode.Range(doc.positionAt(start), doc.positionAt(end));
}

function findInText(text: string, search: string | RegExp): { start: number; end: number } | undefined {
    if (typeof search === 'string') {
        const start = text.indexOf(search);
        const end = start + search.length;
        return start >= 0 ? { start, end } : undefined;
    }
    const r = search.exec(text);
    if (!r) return undefined;

    const start = r.index;
    const end = start + r[0].length;
    return { start, end };
}

function findRanges(doc: vscode.TextDocument, search: string | RegExp): vscode.Range[] {
    const text = doc.getText();
    const offsets = findAllInText(text, search);
    return offsets.map(({ start, end }) => new vscode.Range(doc.positionAt(start), doc.positionAt(end)));
}

function findAllInText(text: string, search: string | RegExp): { start: number; end: number }[] {
    if (typeof search === 'string') {
        const results: { start: number; end: number }[] = [];
        for (let start = text.indexOf(search, 0); start >= 0; start = text.indexOf(search, start + 1)) {
            results.push({ start, end: start + search.length });
        }
        return results;
    }
    const m = [...text.matchAll(search)];
    const r = m.map((v) => (v.index !== undefined ? { start: v.index, end: v.index + v[0].length } : undefined)).filter(isDefined);
    return r;
}

function sampleDoc() {
    return createTextDocument(vscode.Uri.parse(import.meta.url), sampleText());
}

// cspell:ignore vélos
function sampleText() {
    return `
// This is some text to test.
// with some very-important_computations-and2.vélos
function calc() {
    returnCode = lotsOfVeryImportantComputations();
}
`;
}
