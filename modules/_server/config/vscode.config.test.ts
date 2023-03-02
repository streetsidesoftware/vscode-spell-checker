import { describe, expect, test, vi } from 'vitest';
import { Connection, WorkspaceFolder } from 'vscode-languageserver/node';
import { URI as Uri } from 'vscode-uri';

import { getConfiguration, getWorkspaceFolders } from './vscode.config';

vi.mock('vscode-languageserver/node');

describe('Validate vscode config', () => {
    test('getConfiguration', async () => {
        const connection = sampleConnection();
        const mockedCreateConnection = vi.mocked(connection);
        const mocked_getConfiguration = vi.mocked(mockedCreateConnection.workspace.getConfiguration);
        const cfg = [{}, {}];
        mocked_getConfiguration.mockResolvedValue(cfg);
        const items = [{ scopeUri: Uri.file(__filename).toString(), section: 'cSpell' }, { section: 'search' }];
        await expect(getConfiguration(connection, items)).resolves.toBe(cfg);
        expect(mockedCreateConnection.workspace.getConfiguration).toHaveBeenLastCalledWith(items);
    });

    test('getWorkspaceFolders', () => {
        const connection = sampleConnection();
        const mocked_getWorkspaceFolders = vi.mocked(connection.workspace.getWorkspaceFolders);
        const folders: WorkspaceFolder[] = [];
        mocked_getWorkspaceFolders.mockResolvedValue(folders);
        expect(getWorkspaceFolders(connection)).resolves.toBe(folders);
    });
});

const workspace: Connection['workspace'] = partialMocks<Connection['workspace']>({
    getWorkspaceFolders: vi.fn(),
    getConfiguration: vi.fn(mockFnP),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockFnP(): Promise<any> {
    return Promise.resolve(undefined);
}

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
