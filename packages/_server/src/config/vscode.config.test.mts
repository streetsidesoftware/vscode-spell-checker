import { describe, expect, test, vi } from 'vitest';
import type { Connection, WorkspaceFolder } from 'vscode-languageserver/node.js';
import { URI as Uri } from 'vscode-uri';

import { getConfiguration, getWorkspaceFolders } from './vscode.config.mjs';

vi.mock('vscode-languageserver/node');

describe('Validate vscode config', () => {
    test('getConfiguration', async () => {
        const connection = sampleConnection();
        const mockedWorkspace = vi.mocked(connection.workspace);
        const cfg = [{}, {}];
        mockedWorkspace.getConfiguration.mockResolvedValue(cfg);
        const items = [{ scopeUri: Uri.file(__filename).toString(), section: 'cSpell' }, { section: 'search' }];
        await expect(getConfiguration(connection, items)).resolves.toBe(cfg);
        expect(mockedWorkspace.getConfiguration).toHaveBeenLastCalledWith(items);
    });

    test('getWorkspaceFolders', () => {
        const connection = sampleConnection();
        const mockedWorkspace = vi.mocked(connection.workspace);
        const folders: WorkspaceFolder[] = [];
        mockedWorkspace.getWorkspaceFolders.mockResolvedValue(folders);
        expect(getWorkspaceFolders(connection)).resolves.toBe(folders);
    });
});

const workspace: Connection['workspace'] = partialMocks<Connection['workspace']>({
    getWorkspaceFolders: vi.fn(),
    getConfiguration: vi.fn() as any,
});

const connection: Partial<Connection> = {
    workspace,
};

function sampleConnection(): Connection {
    return partialConnection(connection);
}

function partialConnection(...parts: Partial<Connection>[]): Connection {
    return partialMocks<Connection>(...parts);
}

function partialMocks<T>(...parts: Partial<T>[]): T {
    return Object.assign({}, ...parts) as T;
}
