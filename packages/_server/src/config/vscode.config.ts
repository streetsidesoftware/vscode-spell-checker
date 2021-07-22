import { ConfigurationItem, Connection } from 'vscode-languageserver/node';
import { log } from 'common-utils/log.js';

export interface TextDocumentUri {
    uri: string;
}

export interface TextDocumentUriLangId extends TextDocumentUri {
    languageId: string;
}

export type GetConfigurationParams = string | ConfigurationItem | ConfigurationItem[];
export function getConfiguration(connection: Connection): Thenable<any>;
export function getConfiguration(connection: Connection, section: string): Thenable<any>;
export function getConfiguration(connection: Connection, item: ConfigurationItem): Thenable<any>;
export function getConfiguration(connection: Connection, items: ConfigurationItem[]): Thenable<any[]>;
export function getConfiguration(connection: Connection, params?: GetConfigurationParams): Thenable<any> {
    if (typeof params === 'string') {
        log(`getConfiguration\t${params}`);
        return connection.workspace.getConfiguration(params);
    }
    if (Array.isArray(params)) {
        const uris = params
            .map((p) => {
                if (!p) {
                    return '';
                }
                if (typeof p === 'string') {
                    return p;
                }
                return p.scopeUri || '';
            })
            .filter((p) => !!p);
        log('getConfiguration', uris);
        return connection.workspace.getConfiguration(params);
    }
    if (params) {
        log('getConfiguration', params.scopeUri);
        return connection.workspace.getConfiguration(params);
    }
    return connection.workspace.getConfiguration();
}

/**
 * Just a pass through function to `connection.workspace.getWorkspaceFolders`
 * Useful for mocking.
 * @param connection
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getWorkspaceFolders(connection: Connection) {
    return connection.workspace.getWorkspaceFolders();
}
