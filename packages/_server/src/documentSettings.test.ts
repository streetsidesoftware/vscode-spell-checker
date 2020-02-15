import { DocumentSettings, isUriAllowed, isUriBlackListed } from './documentSettings';
import { Connection, WorkspaceFolder } from 'vscode-languageserver';
import { getWorkspaceFolders, getConfiguration } from './vscode.config';
import * as Path from 'path';
import { URI as Uri } from 'vscode-uri';

jest.mock('vscode-languageserver');
jest.mock('./vscode.config');
jest.mock('./util');

const mockGetWorkspaceFolders = getWorkspaceFolders as jest.Mock;
const mockGetConfiguration = getConfiguration as jest.Mock;
const workspaceRoot = Path.resolve(Path.join(__dirname, '..'));
const workspaceFolder: WorkspaceFolder = {
    uri: Uri.file(workspaceRoot).toString(),
    name: '_server',
};

describe('Validate DocumentSettings', () => {
    beforeEach(() => {
        // Clear all mock instances and calls to constructor and all methods:
        mockGetWorkspaceFolders.mockClear();
      });

    test('version', () => {
        const docSettings = newDocumentSettings();
        expect(docSettings.version).toEqual(0);
        docSettings.resetSettings();
        expect(docSettings.version).toEqual(1);
    });

    it('checks isUriAllowed', () => {
        expect(isUriAllowed(Uri.file(__filename).toString())).toBe(true);
    });

    it('checks isUriBlackListed', () => {
        const uriFile = Uri.file(__filename);
        expect(isUriBlackListed(uriFile.toString())).toBe(false);

        const uriGit = uriFile.with({ scheme: 'debug'});

        expect(isUriBlackListed(uriGit.toString())).toBe(true);
    });

    it('folders', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolder];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        const docSettings = newDocumentSettings();

        const folders = await docSettings.folders;
        expect(folders).toBe(mockFolders);
    });

    it('tests register config path', () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolder];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);

        const docSettings = newDocumentSettings();
        const configFile = Path.resolve(Path.join(__dirname, '..', '..', '..', 'cSpell.json'));
        expect(docSettings.version).toEqual(0);
        docSettings.registerConfigurationFile(configFile);
        expect(docSettings.version).toEqual(1);
        expect(docSettings.configsToImport).toContain(configFile);
    });

    it('test getSettings', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolder];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([{}, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.resolve(Path.join(__dirname, '..', 'sampleSourceFiles', 'cSpell.json'));
        docSettings.registerConfigurationFile(configFile);

        const settings = await docSettings.getSettings({ uri: Uri.file(__filename).toString() });
        expect(settings).toHaveProperty('name');
        expect(settings.enabled).toBeUndefined();
        expect(settings.language).toBe('en-gb');
    });

    it('test isExcluded', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolder];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([{}, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.resolve(Path.join(__dirname, '..', 'sampleSourceFiles', 'cSpell.json'));
        docSettings.registerConfigurationFile(configFile);

        const result = await docSettings.isExcluded(Uri.file(__filename).toString());
        expect(result).toBe(false);
    });

    function newDocumentSettings() {
        return new DocumentSettings({} as Connection, {});
    }
});
