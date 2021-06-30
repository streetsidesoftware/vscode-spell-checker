import * as vscode from 'vscode';
import { createTextDocument, readTextDocument } from 'jest-mock-vscode';

export { toggleEnableSpellChecker, enableCurrentLanguage, disableCurrentLanguage } from './settings/settings';

import { __testing__, commandHandlers } from './commands';
import { isDefined } from './util';
import { mustBeDefined, readExtensionPackage } from './test/helpers';
import { extensionId } from './constants';
import { commandDisplayCSpellInfo } from './infoViewer';
const { determineWordToAddToDictionaryFromSelection, extractMatchingDiagText, extractMatchingDiagTexts } = __testing__;

describe('Validate Commands', () => {
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
        ${'important_computations-and2.vélos'} | ${'vélos'} | ${'important_computations-and2.vélos'}
        ${'__not_found__'}                     | ${'text'}  | ${'text'}
        ${undefined}                           | ${'text'}  | ${'text'}
    `('determineWordToAddToDictionaryFromSelection sel: "$selection" diag: "$diag"', ({ selection, diag, expected }) => {
        const doc = sampleDoc();
        const sel = selection && findSelection(doc, selection);
        const selText = sel && doc.getText(sel);
        const diagRange = mustBeDefined(findRange(doc, diag));
        const word = determineWordToAddToDictionaryFromSelection(doc, selText, sel, diagRange);
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

    test('thisDoc', async () => {
        const doc = await thisDoc();
        expect(doc.getText()).toEqual(expect.stringContaining('thisDoc'));
    });

    test('ensure commandHandlers cover commands', async () => {
        const pkg = await readExtensionPackage();
        const cmdPrefix = extensionId + '.';
        const commands = mustBeDefined(pkg.contributes?.commands)
            .map((cmd) => cmd.command)
            .filter((cmd) => cmd.startsWith(cmdPrefix));
        const implemented = new Set(Object.keys(commandHandlers));
        implemented.add(commandDisplayCSpellInfo); // Handled by infoView
        const found = commands.filter((cmd) => implemented.has(cmd));
        expect(found).toEqual(commands);
    });
});

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

function thisDoc() {
    return readTextDocument(vscode.Uri.file(__filename));
}
