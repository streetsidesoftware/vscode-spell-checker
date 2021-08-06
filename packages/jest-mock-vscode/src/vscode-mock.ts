/**
 * To use.
 * In your repository add the file:
 * __mocks__/vscode.js
 * ```
 * module.exports = require('jest-mock-vscode');
 * ```
 */

import type * as vscode from 'vscode';

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

// cspell:word Evaluatable
