import type * as vscode from 'vscode';
import { TextDocument } from './TextDocument';
import { Uri } from './uri';
// import { Range } from './extHostTypes';

describe('Validate TextDocument', () => {
    test('create', () => {
        const uri = Uri.file(__filename);
        const td = TextDocument.create(uri, content());
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
});

function createDoc(): vscode.TextDocument {
    const uri = Uri.file(__filename);
    return TextDocument.create(uri, content());
}

function content() {
    return `
Line 1
Line 2

  Line 4

     Position 5
`;
}
