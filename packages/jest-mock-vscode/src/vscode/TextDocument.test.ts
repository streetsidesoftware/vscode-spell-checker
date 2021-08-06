import type * as vscode from 'vscode';
import { MockTextDocument } from './TextDocument';
import { Uri } from './uri';
import * as vsMocks from '..';

describe('Validate TextDocument', () => {
    test('create', () => {
        const uri = Uri.file(__filename);
        const td = MockTextDocument.create(uri, content());
        expect(td.getText()).toBe(content());
    });

    test.each`
        frag        | line | col
        ${'Line 2'} | ${2} | ${0}
        ${'Line 4'} | ${4} | ${2}
    `('positionAt/offsetAt $frag $line $col', ({ frag, line, col }) => {
        const doc = createDoc();
        const text = doc.getText();
        const offset = text.indexOf(frag);
        const pos = doc.positionAt(offset);
        expect(pos).toEqual(expect.objectContaining({ line, character: col }));
        expect(doc.offsetAt(pos)).toBe(offset);
    });

    test.each`
        key             | expected
        ${'fileName'}   | ${Uri.file(__filename).fsPath}
        ${'lineCount'}  | ${10}
        ${'languageId'} | ${'plaintext'}
        ${'isUntitled'} | ${false}
    `('simple getters $method', ({ key, expected }) => {
        const doc = createDoc();
        expect((doc as any)[key]).toEqual(expected);
    });

    test.each`
        searchFor           | expected
        ${'ge At Position'} | ${'Range'}
        ${'ne 4'}           | ${'Line'}
        ${'  Line 4'}       | ${undefined}
    `('getWordRangeAtPosition', ({ searchFor, expected }) => {
        const doc = createDoc();
        const pos = doc.positionAt(doc.getText().indexOf(searchFor));
        const r = doc.getWordRangeAtPosition(pos);
        expect(r && doc.getText(r)).toEqual(expected);
    });

    test.each`
        range              | expected
        ${r(0, 0, 4, 4)}   | ${r(0, 0, 4, 4)}
        ${r(3, 10, 10, 4)} | ${r(3, 1, 9, 3)}
    `('validateRange $range', ({ range, expected }) => {
        const doc = createDoc();
        expect(doc.validateRange(range)).toEqual(expected);
    });

    test('isDirty', () => {
        const doc = createDoc();
        expect(doc.isDirty).toEqual(false);
        MockTextDocument.setContents(doc, content());
        expect(doc.isDirty).toEqual(true);
    });

    test('save', async () => {
        const doc = createDoc();
        expect(await doc.save()).toEqual(false);
        MockTextDocument.setContents(doc, content());
        expect(() => doc.save()).toThrowError('Method not implemented.');
    });
});

function r(lineA: number, rowA: number, lineB: number, rowB: number): vscode.Range {
    return new vsMocks.Range(lineA, rowA, lineB, rowB);
}

function createDoc(): MockTextDocument {
    const uri = Uri.file(__filename);
    return MockTextDocument.create(uri, content());
}

function content() {
    return `
Line 1
Line 2

  Line 4

     Position 5
     get Word Range At Position

eof`;
}
