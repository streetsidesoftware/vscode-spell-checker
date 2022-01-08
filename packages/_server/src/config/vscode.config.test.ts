import { Connection, WorkspaceFolder } from 'vscode-languageserver/node';
import { getConfiguration, getWorkspaceFolders } from './vscode.config';
import { URI as Uri } from 'vscode-uri';

jest.mock('vscode-languageserver/node');

describe('Validate vscode config', () => {
    test('getConfiguration', async () => {
        const connection = sampleConnection();
        const mockedCreateConnection = jest.mocked(connection, true);
        const cfg = [{}, {}];
        mockedCreateConnection.workspace.getConfiguration.mockResolvedValue(cfg);
        const items = [{ scopeUri: Uri.file(__filename).toString(), section: 'cSpell' }, { section: 'search' }];
        await expect(getConfiguration(connection, items)).resolves.toBe(cfg);
        expect(mockedCreateConnection.workspace.getConfiguration).toHaveBeenLastCalledWith(items);
    });

    test('getWorkspaceFolders', () => {
        const connection = sampleConnection();
        const mockedCreateConnection = jest.mocked(connection, true);
        const folders: WorkspaceFolder[] = [];
        mockedCreateConnection.workspace.getWorkspaceFolders.mockResolvedValue(folders);
        expect(getWorkspaceFolders(connection)).resolves.toBe(folders);
    });
});

const workspace: Connection['workspace'] = partialMocks<Connection['workspace']>({
    getWorkspaceFolders: jest.fn(),
    getConfiguration: jest.fn(),
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
