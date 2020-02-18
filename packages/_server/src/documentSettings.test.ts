import { DocumentSettings, isUriAllowed, isUriBlackListed, debugExports, correctBadSettings } from './documentSettings';
import { Connection, WorkspaceFolder } from 'vscode-languageserver';
import { getWorkspaceFolders, getConfiguration } from './vscode.config';
import * as Path from 'path';
import { URI as Uri } from 'vscode-uri';
import * as cspell from 'cspell-lib';
import { Pattern, CSpellUserSettings } from 'cspell-lib';
import * as os from 'os';

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

    test('resolvePath', () => {
        expect(debugExports.resolvePath(__dirname)).toBe(__dirname);
        expect(debugExports.resolvePath('~')).toBe(os.homedir());
    });

    function newDocumentSettings() {
        return new DocumentSettings({} as Connection, {});
    }
});

describe('Validate RegExp corrections', () => {
    test('fixRegEx', () => {
        const defaultSettings = cspell.getDefaultSettings();
        // Make sure it doesn't change the defaults.
        expect(defaultSettings.patterns?.map(p => p.pattern).map(debugExports.fixRegEx))
            .toEqual(defaultSettings.patterns?.map(p => p.pattern));
        const sampleRegEx: Pattern[] = [
            '/#.*/',
            '/"""(.*?\\n?)+?"""/g',
            '/\'\'\'(.*?\\n?)+?\'\'\'/g',
            'strings',
        ];
        const expectedRegEx: Pattern[] = [
            '/#.*/',
            '/(""")[^\\1]*?\\1/g',
            "/(''')[^\\1]*?\\1/g",
            'strings',
        ];
        expect(sampleRegEx.map(debugExports.fixRegEx)).toEqual(expectedRegEx);
    });

    test('fixPattern', () => {
        const defaultSettings = cspell.getDefaultSettings();
        // Make sure it doesn't change the defaults.
        expect(defaultSettings.patterns?.map(debugExports.fixPattern))
            .toEqual(defaultSettings.patterns);

    });

    test('fixPattern', () => {
        const defaultSettings = cspell.getDefaultSettings();
        // Make sure it doesn't change the defaults.
        expect(correctBadSettings(defaultSettings))
            .toEqual(defaultSettings);

        const settings: CSpellUserSettings = {
            patterns: [
                {
                    name: 'strings',
                    pattern: '/"""(.*?\\n?)+?"""/g',
                }
            ]
        };
        const expectedSettings: CSpellUserSettings = {
            patterns: [
                {
                    name: 'strings',
                    pattern: '/(""")[^\\1]*?\\1/g',
                }
            ]
        };
        expect(correctBadSettings(settings)).toEqual(expectedSettings);
        expect(correctBadSettings(settings)).not.toEqual(settings);
    });
});
