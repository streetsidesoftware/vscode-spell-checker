import type * as vscode from 'vscode';
import { createMockFileSystem } from './fs';
import { createMockWorkspaceConfiguration } from './WorkspaceConfiguration';
import { createTextDocument, readTextDocument } from '../vscodeTypesHelper';
import { isUri, Uri } from './uri';

export type Workspace = typeof vscode.workspace;

const fs = createMockFileSystem();

export class MockWorkspace implements Workspace {
    private _workspaceFolders: Workspace['workspaceFolders'] = undefined;

    get workspaceFolders(): Workspace['workspaceFolders'] {
        return this._workspaceFolders;
    }

    setWorkspaceFolders(folders: vscode.WorkspaceFolder[] | undefined): void {
        this._workspaceFolders = folders;
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
    asRelativePath = jest.fn((a) => a?.toString());
    createFileSystemWatcher = jest.fn();
    findFiles = jest.fn();
    getConfiguration = jest.fn((...args: Parameters<Workspace['getConfiguration']>) => this.__mockConfig.__getConfiguration(...args));
    getWorkspaceFolder = jest.fn((uri) => getWorkspaceFolder(uri, this.workspaceFolders || []));
    onDidSaveTextDocument = jest.fn();
    openTextDocument = openTextDocument;
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

interface OpenTextDocumentOptions {
    language?: string;
    content?: string;
}
function openTextDocument(uri: vscode.Uri): Thenable<vscode.TextDocument>;
function openTextDocument(fileName: string): Thenable<vscode.TextDocument>;
function openTextDocument(options?: OpenTextDocumentOptions): Thenable<vscode.TextDocument>;
function openTextDocument(param?: string | vscode.Uri | OpenTextDocumentOptions): Promise<vscode.TextDocument> {
    const uri = typeof param === 'string' ? Uri.file(param) : isUri(param) ? param : undefined;
    const options = typeof param !== 'string' && !isUri(param) ? param : undefined;
    if (uri) {
        return readTextDocument(uri);
    }

    return Promise.resolve(createTextDocument(Uri.parse('untitled:Untitled-1'), options?.content || '', options?.language));
}

function getWorkspaceFolder(uri: vscode.Uri, folders: readonly vscode.WorkspaceFolder[]): vscode.WorkspaceFolder | undefined {
    const uriFolder = Uri.joinPath(uri, '..');

    return folders
        .filter((f) => uriFolder.path.startsWith(f.uri.path))
        .reduce((bestMatch: vscode.WorkspaceFolder | undefined, folder) => {
            if (!bestMatch) return folder;
            if (bestMatch.uri.path.length < folder.uri.path.length) return folder;
            return bestMatch;
        }, undefined);
}
