/**
 * To use.
 * In your repository add the file:
 * __mocks__/vscode.js
 * ```
 * module.exports = require('jest-mock-vscode');
 * ```
 */

import type * as vscode from 'vscode';

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
export type CreateStatusBarItemFn = typeof window.createStatusBarItem;
export type Languages = typeof vscode.languages;

export const languages: Languages = {
    createDiagnosticCollection: jest.fn(),
    getDiagnostics: jest.fn(),
    getLanguages: jest.fn(),
    match: jest.fn(),
    onDidChangeDiagnostics: jest.fn(),
    registerCallHierarchyProvider: jest.fn(),
    registerCodeActionsProvider: jest.fn(),
    registerCodeLensProvider: jest.fn(),
    registerColorProvider: jest.fn(),
    registerCompletionItemProvider: jest.fn(),
    registerDeclarationProvider: jest.fn(),
    registerDefinitionProvider: jest.fn(),
    registerDocumentFormattingEditProvider: jest.fn(),
    registerDocumentHighlightProvider: jest.fn(),
    registerDocumentLinkProvider: jest.fn(),
    registerDocumentRangeFormattingEditProvider: jest.fn(),
    registerDocumentRangeSemanticTokensProvider: jest.fn(),
    registerDocumentSemanticTokensProvider: jest.fn(),
    registerDocumentSymbolProvider: jest.fn(),
    registerEvaluatableExpressionProvider: jest.fn(),
    registerFoldingRangeProvider: jest.fn(),
    registerHoverProvider: jest.fn(),
    registerImplementationProvider: jest.fn(),
    registerInlineValuesProvider: jest.fn(),
    registerLinkedEditingRangeProvider: jest.fn(),
    registerOnTypeFormattingEditProvider: jest.fn(),
    registerReferenceProvider: jest.fn(),
    registerRenameProvider: jest.fn(),
    registerSelectionRangeProvider: jest.fn(),
    registerSignatureHelpProvider: jest.fn(),
    registerTypeDefinitionProvider: jest.fn(),
    registerWorkspaceSymbolProvider: jest.fn(),
    setLanguageConfiguration: jest.fn(),
    setTextDocumentLanguage: jest.fn(),
};

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
    showTextDocument: jest.fn(),
    showWarningMessage: jest.fn(() => Promise.resolve(undefined)),
    showWorkspaceFolderPick: jest.fn(() => Promise.resolve(undefined)),
    withProgress: jest.fn(),
    withScmProgress: jest.fn(),
};

export const workspace = {
    getConfiguration: jest.fn(),
    workspaceFolders: [],
    onDidSaveTextDocument: jest.fn(),
    getWorkspaceFolder: jest.fn(),
};

export const OverviewRulerLane = {
    Left: null,
};

export const debug = {
    onDidTerminateDebugSession: jest.fn(),
    startDebugging: jest.fn(),
};

export const commands = {
    executeCommand: jest.fn(),
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
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn(),
    };

    return sb;
}

// cspell:word Evaluatable
