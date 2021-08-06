import type * as vscode from 'vscode';
import * as vs from './baseTypes';
import * as mocked from './extHostTypes';

export class MockTextDocument implements vscode.TextDocument {
    private _lines: string[];
    private _isDirty: boolean = false;
    isClosed: boolean = false;
    eol: vscode.EndOfLine = vs.EndOfLine.LF;
    notebook: undefined;

    constructor(public readonly uri: vscode.Uri, private _contents: string, public _languageId: string = 'plaintext', public version = 1) {
        this._lines = [];
        this.init();
    }

    get fileName(): string {
        return this.uri.fsPath;
    }

    get lineCount(): number {
        return this._lines.length;
    }

    get languageId(): string {
        return this._languageId;
    }

    get isUntitled(): boolean {
        return this.uri.scheme === 'untitled';
    }

    get isDirty(): boolean {
        return this._isDirty;
    }

    lineAt(line: number): vscode.TextLine;
    lineAt(line: vscode.Position): vscode.TextLine;
    lineAt(line: number | vscode.Position): vscode.TextLine {
        const lineNumber = typeof line === 'number' ? line : line.line;
        const fullLineText = this._lines[lineNumber];
        const text = fullLineText.replace(/\r?\n/, '');
        return {
            lineNumber,
            text,
            range: new mocked.Range(lineNumber, 0, lineNumber, text.length),
            firstNonWhitespaceCharacterIndex: 0,
            rangeIncludingLineBreak: new mocked.Range(lineNumber, 0, lineNumber, fullLineText.length),
            isEmptyOrWhitespace: !!text.replace(/\s+/, ''),
        };
    }

    offsetAt(position: vscode.Position): number {
        let offset = 0;
        for (let line = 0; line < position.line; ++line) {
            offset += this._lines[line]?.length || 0;
        }
        offset += position.character;
        return Math.min(this._contents.length, offset);
    }

    positionAt(offset: number): vscode.Position {
        const before = this._contents.slice(0, offset);
        const newLines = [...before.matchAll(/(?<=\n)/g)];
        const line = newLines.length;
        const characters = offset - (newLines[line - 1]?.index || 0);
        return new mocked.Position(line, characters);
    }

    getText(range?: vscode.Range | undefined): string {
        if (!range) return this._contents;
        const offsetStart = this.offsetAt(range.start);
        const offsetEnd = this.offsetAt(range.end);
        return this._contents.slice(offsetStart, offsetEnd);
    }

    getWordRangeAtPosition(position: vscode.Position, regex: RegExp = /\w+/): vscode.Range | undefined {
        const line = this.lineAt(position);
        const text = line.text;
        const offset = position.character - line.range.start.character;

        const r = new RegExp(regex, regex.flags + 'g');

        const matches = text.matchAll(r);
        for (const m of matches) {
            if (m.index === undefined || m.index > offset) break;
            if (m.index <= offset && m[0].length < offset - m.index) continue;
            return new mocked.Range(line.lineNumber, m.index, line.lineNumber, m.index + m[0].length);
        }
        return;
    }

    validateRange(range: vscode.Range): vscode.Range {
        const start = this.validatePosition(range.start);
        const end = this.validatePosition(range.end);
        return start === range.start && end === range.end ? range : new mocked.Range(start, end);
    }

    validatePosition(position: vscode.Position): vscode.Position {
        return this.adjustPosition(position);
    }

    save(): Promise<boolean> {
        if (!this.isDirty) return Promise.resolve(false);
        throw new Error('Method not implemented.');
    }

    private init() {
        this._lines = this._contents.split(/(?<=\n)/g);
    }

    private adjustPosition(pos: vscode.Position): vscode.Position {
        if (pos.line < 0) return new mocked.Position(0, 0);
        if (pos.line >= this._lines.length) {
            const line = this._lines.length - 1;
            const char = this._lines[line].length;
            return new mocked.Position(line, char);
        }
        const txt = this._lines[pos.line];
        if (pos.character >= 0 && pos.character <= txt.length) return pos;
        return new mocked.Position(pos.line, Math.max(0, Math.min(pos.character, txt.length)));
    }

    static create(uri: vscode.Uri, contents: string, languageId = 'plaintext', version?: number): MockTextDocument {
        return new MockTextDocument(uri, contents, languageId, version);
    }

    static setContents(doc: MockTextDocument, contents: string): void {
        doc._isDirty = true;
        doc._contents = contents;
        doc.init();
    }
}
