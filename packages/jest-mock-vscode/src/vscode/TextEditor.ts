import type * as vscode from 'vscode';
import * as mockedTypes from './extHostTypes';

export class MockTextEditor implements vscode.TextEditor {
    _options: vscode.TextEditorOptions = {};
    _visibleRanges: vscode.Range[] = [];
    _selections: vscode.Selection[];

    constructor(
        public _document: vscode.TextDocument,
        public _viewColumn?: vscode.ViewColumn | undefined,
        selection: vscode.Selection = new mockedTypes.Selection(new mockedTypes.Position(0, 0), new mockedTypes.Position(0, 0))
    ) {
        this._selections = [selection];
    }

    get document(): vscode.TextDocument {
        return this._document;
    }

    /**
     * The primary selection on this text editor. Shorthand for `TextEditor.selections[0]`.
     */
    get selection(): vscode.Selection {
        return this.selections[0];
    }

    get selections(): vscode.Selection[] {
        return this._selections;
    }

    get visibleRanges(): vscode.Range[] {
        return this._visibleRanges;
    }

    get options(): vscode.TextEditorOptions {
        return this._options;
    }

    set options(s: vscode.TextEditorOptions) {
        this._options = s;
    }

    get viewColumn(): vscode.ViewColumn | undefined {
        return this._viewColumn;
    }

    edit = jest.fn();
    insertSnippet = jest.fn();
    setDecorations = jest.fn();
    revealRange = jest.fn();
    show = jest.fn();
    hide = jest.fn();
}
