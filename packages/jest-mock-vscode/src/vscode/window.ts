import type { TextEditor, TextDocumentShowOptions, Uri, TextDocument, ViewColumn } from 'vscode';
import type * as vscode from 'vscode';
import { workspace } from './workspace';
import { Selection } from './extHostTypes';
import { MockTextEditor } from './TextEditor';
import { isUri } from './uri';

enum StatusBarAlignment {
    Left = 1,
    Right = 2,
}

enum ColorThemeKind {
    Light = 1,
    Dark = 2,
    HighContrast = 3,
}

export type Window = typeof vscode.window;

export const window: Window = {
    // Attributes
    activeColorTheme: { kind: ColorThemeKind.Dark },
    activeTerminal: undefined,
    activeTextEditor: undefined,
    state: { focused: true },
    terminals: [],
    visibleTextEditors: [],

    // Fully mocked methods
    createStatusBarItem: jest.fn(createStatusBarItem),
    showTextDocument: showTextDocument,

    // Partial mocked methods
    createInputBox: jest.fn(),
    createOutputChannel: jest.fn(),
    createQuickPick: jest.fn(),
    createTerminal: jest.fn(),
    createTextEditorDecorationType: jest.fn(),
    createTreeView: jest.fn(),
    createWebviewPanel: jest.fn(),
    onDidChangeActiveColorTheme: jest.fn(),
    onDidChangeActiveTerminal: jest.fn(),
    onDidChangeActiveTextEditor: jest.fn(),
    onDidChangeTerminalState: jest.fn(),
    onDidChangeTextEditorOptions: jest.fn(),
    onDidChangeTextEditorSelection: jest.fn(),
    onDidChangeTextEditorViewColumn: jest.fn(),
    onDidChangeTextEditorVisibleRanges: jest.fn(),
    onDidChangeVisibleTextEditors: jest.fn(),
    onDidChangeWindowState: jest.fn(),
    onDidCloseTerminal: jest.fn(),
    onDidOpenTerminal: jest.fn(),
    registerCustomEditorProvider: jest.fn(),
    registerFileDecorationProvider: jest.fn(),
    registerTerminalLinkProvider: jest.fn(),
    registerTerminalProfileProvider: jest.fn(),
    registerTreeDataProvider: jest.fn(),
    registerUriHandler: jest.fn(),
    registerWebviewPanelSerializer: jest.fn(),
    registerWebviewViewProvider: jest.fn(),
    setStatusBarMessage: jest.fn(),
    showErrorMessage: jest.fn(() => Promise.resolve(undefined)),
    showInformationMessage: jest.fn(() => Promise.resolve(undefined)),
    showInputBox: jest.fn(() => Promise.resolve(undefined)),
    showOpenDialog: jest.fn(() => Promise.resolve(undefined)),
    showQuickPick: jest.fn(() => Promise.resolve(undefined)),
    showSaveDialog: jest.fn(() => Promise.resolve(undefined)),
    showWarningMessage: jest.fn(() => Promise.resolve(undefined)),
    showWorkspaceFolderPick: jest.fn(() => Promise.resolve(undefined)),
    withProgress: jest.fn(),
    withScmProgress: jest.fn(),
};

function createStatusBarItem(id: string, alignment?: StatusBarAlignment, priority?: number): vscode.StatusBarItem;
function createStatusBarItem(alignment?: StatusBarAlignment, priority?: number): vscode.StatusBarItem;
function createStatusBarItem(
    id: string | StatusBarAlignment | undefined,
    alignment: StatusBarAlignment | number | undefined,
    priority?: number
): vscode.StatusBarItem;
function createStatusBarItem(
    id: string | StatusBarAlignment | undefined,
    alignment: StatusBarAlignment | number | undefined,
    priority?: number
): vscode.StatusBarItem {
    if (typeof id === 'string') {
        return _createStatusBarItem(id, alignment, priority);
    }
    return _createStatusBarItem('mock-id', id, alignment);
}
function _createStatusBarItem(id: string, alignment?: StatusBarAlignment, priority?: number): vscode.StatusBarItem {
    alignment = alignment || StatusBarAlignment.Left;

    const sb: vscode.StatusBarItem = {
        id,
        alignment,
        priority,
        name: id,
        text: '',
        tooltip: undefined,
        color: undefined,
        backgroundColor: undefined,
        command: undefined,
        accessibilityInformation: undefined,
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn(),
    };

    return sb;
}

function showTextDocument(document: TextDocument, column?: ViewColumn, preserveFocus?: boolean): Thenable<TextEditor>;
function showTextDocument(document: TextDocument, options?: TextDocumentShowOptions): Thenable<TextEditor>;
function showTextDocument(uri: Uri, options?: TextDocumentShowOptions): Thenable<TextEditor>;
async function showTextDocument(
    a: TextDocument | Uri,
    b?: ViewColumn | TextDocumentShowOptions,
    _preserveFocus?: boolean
): Promise<TextEditor> {
    const document = isUri(a) ? await workspace.openTextDocument(a) : a;
    const viewColumn = typeof b === 'number' ? b : undefined;
    const options = typeof b === 'number' ? undefined : b;
    const selectionRange = options?.selection;
    const selection = selectionRange && new Selection(selectionRange.start, selectionRange.start);

    return new MockTextEditor(document, viewColumn, selection);
}
