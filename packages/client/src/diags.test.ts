import { createTextDocument } from 'jest-mock-vscode';
import * as vscode from 'vscode';
import { Diagnostic, DiagnosticSeverity, languages, Position, Range, Uri } from 'vscode';
import { extractMatchingDiagText, getCSpellDiags, __testing__ } from './diags';
import { isDefined, mustBeDefined } from './util';

const { determineWordRangeToAddToDictionaryFromSelection, extractMatchingDiagTexts } = __testing__;

const mockGetDiagnostics = jest.mocked(languages.getDiagnostics);

describe('Validate diags', () => {
    test('getCSpellDiags empty', () => {
        const uri = Uri.file(__filename);
        mockGetDiagnostics.mockReturnValue([]);
        const r = getCSpellDiags(uri);
        expect(r).toEqual([]);
    });

    test('getCSpellDiags', () => {
        const uri = Uri.file(__filename);
        mockGetDiagnostics.mockImplementation(implGetDiagnostics);
        const r = getCSpellDiags(uri);
        expect(r).toHaveLength(2);
    });

    test('getCSpellDiags undefined', () => {
        mockGetDiagnostics.mockImplementation(implGetDiagnostics);
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

function implGetDiagnostics(): [Uri, Diagnostic[]][];
function implGetDiagnostics(uri: Uri): Diagnostic[];
function implGetDiagnostics(uri?: Uri): [Uri, Diagnostic[]][] | Diagnostic[] {
    if (!uri) return sampleDiags();
    return sampleDiags()[0][1];
}

function sampleDiags(): [Uri, Diagnostic[]][] {
    const uriDir = Uri.file(__dirname);
    return [
        [Uri.file(__filename), [fakeDiag('eslint', 'eslint'), fakeDiag('Unknown word ', 'cSpell'), fakeDiag('Unknown word 2', 'cSpell')]],
        [Uri.joinPath(uriDir, 'other.js'), [fakeDiag('eslint', 'eslint'), fakeDiag('Unknown word ', 'cSpell')]],
        [Uri.joinPath(uriDir, 'this.js'), [fakeDiag('eslint', 'eslint'), fakeDiag('Unknown word ', 'cSpell')]],
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
    return createTextDocument(vscode.Uri.file(__filename), sampleText());
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
