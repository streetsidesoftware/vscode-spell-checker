import type * as vscode from 'vscode';
import { createMockFileSystem } from './fs';
import { createMockWorkspaceConfiguration } from './WorkspaceConfiguration';

export type Workspace = typeof vscode.workspace;

const fs = createMockFileSystem();

export class MockWorkspace implements Workspace {
    get workspaceFolders(): Workspace['workspaceFolders'] {
        return undefined;
    }

    get fs(): Workspace['fs'] {
        return fs;
    }

    get name(): Workspace['name'] {
        return 'mock-workspace';
    }

    get workspaceFile(): Workspace['workspaceFile'] {
        return undefined;
    }

    rootPath = undefined;
    isTrusted = true;
    textDocuments = [];
    notebookDocuments = [];

    __mockConfig = createMockWorkspaceConfiguration();

    applyEdit = jest.fn();
    asRelativePath = jest.fn((a) => a);
    createFileSystemWatcher = jest.fn();
    findFiles = jest.fn();
    getConfiguration = jest.fn((...args: Parameters<Workspace['getConfiguration']>) => this.__mockConfig.__getConfiguration(...args));
    getWorkspaceFolder = jest.fn(() => this.workspaceFolders?.[0]);
    onDidSaveTextDocument = jest.fn();
    openTextDocument = jest.fn();
    openNotebookDocument = jest.fn();
    onDidChangeConfiguration = jest.fn();
    onDidChangeTextDocument = jest.fn();
    onDidChangeWorkspaceFolders = jest.fn();
    onDidCloseNotebookDocument = jest.fn();
    onDidCloseTextDocument = jest.fn();
    onDidCreateFiles = jest.fn();
    onDidDeleteFiles = jest.fn();
    onDidGrantWorkspaceTrust = jest.fn();
    onDidOpenNotebookDocument = jest.fn();
    onDidOpenTextDocument = jest.fn();
    onDidRenameFiles = jest.fn();
    onWillCreateFiles = jest.fn();
    onWillDeleteFiles = jest.fn();
    onWillRenameFiles = jest.fn();
    onWillSaveTextDocument = jest.fn();
    registerFileSystemProvider = jest.fn();
    registerNotebookSerializer = jest.fn();
    registerTaskProvider = jest.fn();
    registerTextDocumentContentProvider = jest.fn();
    saveAll = jest.fn();
    updateWorkspaceFolders = jest.fn();
}

export const workspace = new MockWorkspace();
