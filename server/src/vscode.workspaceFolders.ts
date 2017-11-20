export * from 'vscode-languageserver';
import * as vscode from 'vscode-languageserver';
import { _ } from 'vscode-languageserver';
import { log } from './core';

export interface WorkspaceFolder {
    /**
     * The associated URI for this workspace folder.
     */
    uri: string;

    /**
     * The name of the workspace folder. Defaults to the
     * uri's basename.
     */
    name: string;
}

export interface DidChangeWorkspaceFoldersParams {
    /**
     * The actual workspace folder change event.
     */
    event: WorkspaceFoldersChangeEvent;
}

/**
 * The workspace folder change event.
 */
export interface WorkspaceFoldersChangeEvent {
    /**
     * The array of added workspace folders
     */
    added: WorkspaceFolder[];

    /**
     * The array of the removed workspace folders
     */
    removed: WorkspaceFolder[];
}

export interface ExtendedInitializeParams extends vscode.InitializeParams {
    workspaceFolders: WorkspaceFolder[];
}

export function registerOnDidChangeWorkspaceFolders (connection: vscode.Connection, callback: (params: DidChangeWorkspaceFoldersParams) => void) {
    const notificationType = new vscode.NotificationType<DidChangeWorkspaceFoldersParams, void>('workspace/didChangeWorkspaceFolders');
    connection.onNotification(notificationType, callback);
}

export type Connection = vscode.Connection<_, _, _, _, _, vscode.ProposedFeatures.WorkspaceFolders & vscode.ProposedFeatures.Configuration>;

export interface TextDocumentUri {
    uri: string;
}

export interface TextDocumentUriLangId extends TextDocumentUri {
    languageId: string;
}

export type GetConfigurationParams = string | vscode.Proposed.ConfigurationItem | vscode.Proposed.ConfigurationItem[];
export function getConfiguration(connection: Connection): Thenable<any>;
export function getConfiguration(connection: Connection, section: string): Thenable<any>;
export function getConfiguration(connection: Connection, item: vscode.Proposed.ConfigurationItem): Thenable<any>;
export function getConfiguration(connection: Connection, items: vscode.Proposed.ConfigurationItem[]): Thenable<any[]>;
export function getConfiguration(connection: Connection, params?: GetConfigurationParams ): Thenable<any> {
    log('getConfiguration');
    if (typeof params === 'string') {
        return connection.workspace.getConfiguration(params);
    }
    if (Array.isArray(params)) {
        return connection.workspace.getConfiguration(params);
    }
    if (params) {
        return connection.workspace.getConfiguration(params);
    }
    return connection.workspace.getConfiguration();
}

export function getWorkspaceFolders(connection: Connection): Thenable<WorkspaceFolder[] | null> {
    return connection.workspace.getWorkspaceFolders();
}
