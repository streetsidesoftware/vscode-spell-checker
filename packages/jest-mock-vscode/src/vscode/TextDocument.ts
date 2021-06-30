import type * as vscode from 'vscode';
import * as vs from './baseTypes';
import * as vs2 from './extHostTypes';

export class TextDocument implements vscode.TextDocument {
    private readonly _lines: string[];

    isUntitled: boolean = false;
    languageId: string = '';
    isDirty: boolean = false;
    isClosed: boolean = false;
    eol: vscode.EndOfLine = vs.EndOfLine.LF;
    notebook: undefined;

    constructor(public readonly uri: vscode.Uri, private _contents: string, public version = 1) {
        this._lines = this._contents.split(/(?<=\n)/g);
    }

    get fileName(): string {
        return this.uri.fsPath;
    }

    get lineCount(): number {
        return this._lines.length;
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
            range: new vs2.Range(lineNumber, 0, lineNumber, text.length),
            firstNonWhitespaceCharacterIndex: 0,
            rangeIncludingLineBreak: new vs2.Range(lineNumber, 0, lineNumber, fullLineText.length),
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
        return new vs2.Position(line, characters);
    }

    getText(range?: vscode.Range | undefined): string {
        if (!range) return this._contents;
        const offsetStart = this.offsetAt(range.start);
        const offsetEnd = this.offsetAt(range.end);
        return this._contents.slice(offsetStart, offsetEnd);
    }

    getWordRangeAtPosition(_position: vscode.Position, _regex?: RegExp | undefined): never {
        throw new Error('Method not implemented.');
    }

    validateRange(range: vscode.Range): vscode.Range {
        const start = this.adjustPosition(range.start);
        const end = this.adjustPosition(range.end);
        return new vs2.Range(start, end);
    }

    validatePosition(position: vscode.Position): vscode.Position {
        return this.adjustPosition(position);
    }

    save(): never {
        throw new Error('Method not implemented.');
    }

    private adjustPosition(pos: vscode.Position): vscode.Position {
        if (pos.line < 0) return new vs2.Position(0, 0);
        if (pos.line >= this._lines.length) {
            const line = this._lines.length - 1;
            const char = this._lines[line].length;
            return new vs2.Position(line, char);
        }
        const txt = this._lines[pos.line];
        if (pos.character >= 0 && pos.character <= txt.length) return pos;
        return new vs2.Position(pos.line, Math.max(0, Math.min(pos.character, txt.length)));
    }

    static create(uri: vscode.Uri, contents: string, version?: number): vscode.TextDocument {
        return new TextDocument(uri, contents, version);
    }
}
