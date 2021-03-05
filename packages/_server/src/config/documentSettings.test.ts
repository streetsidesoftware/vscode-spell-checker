import { DocumentSettings, isUriAllowed, isUriBlackListed, debugExports, correctBadSettings, ExcludedByMatch } from './documentSettings';
import { Connection, WorkspaceFolder } from 'vscode-languageserver/node';
import { getWorkspaceFolders, getConfiguration } from './vscode.config';
import * as Path from 'path';
import { URI as Uri } from 'vscode-uri';
import * as cspell from 'cspell-lib';
import { Pattern } from 'cspell-lib';
import { CSpellUserSettings } from '../config/cspellConfig';
import * as os from 'os';

jest.mock('vscode-languageserver/node');
jest.mock('./vscode.config');

const mockGetWorkspaceFolders = getWorkspaceFolders as jest.Mock;
const mockGetConfiguration = getConfiguration as jest.Mock;
const pathWorkspaceServer = Path.resolve(Path.join(__dirname, '..', '..'));
const pathWorkspaceRoot = Path.resolve(Path.join(pathWorkspaceServer, '..', '..'));
const pathWorkspaceClient = Path.resolve(Path.join(pathWorkspaceServer, '..', 'client'));
const pathSampleSourceFiles = Path.join(pathWorkspaceServer, 'sampleSourceFiles');
const workspaceFolderServer: WorkspaceFolder = {
    uri: Uri.file(pathWorkspaceServer).toString(),
    name: '_server',
};
const workspaceFolderRoot: WorkspaceFolder = {
    uri: Uri.file(pathWorkspaceRoot).toString(),
    name: 'vscode-spell-checker',
};
const workspaceFolderClient: WorkspaceFolder = {
    uri: Uri.file(pathWorkspaceClient).toString(),
    name: 'client',
};

const cspellConfigInVsCode: CSpellUserSettings = {
    ignorePaths: ['${workspaceFolder:_server}/**/*.json'],
    import: [
        '${workspaceFolder:_server}/sampleSourceFiles/overrides/cspell.json',
        '${workspaceFolder:_server}/sampleSourceFiles/cSpell.json',
    ],
    enabledLanguageIds: ['typescript', 'javascript', 'php', 'json', 'jsonc'],
};

const sampleFiles = {
    sampleNodePackage: require.resolve('cspell-lib'),
    sampleSamplesReadme: Path.resolve(pathWorkspaceRoot, 'samples/custom-dictionary/README.md'),
    sampleEsLint: Path.resolve(pathWorkspaceRoot, 'packages/client/.eslintrc.js'),
    sampleClientReadme: Path.resolve(pathWorkspaceRoot, 'packages/client/README.md'),
    samplePackageLock: Path.resolve(pathWorkspaceRoot, 'packages/_server/package-lock.json'),
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

    test('checks isUriAllowed', () => {
        expect(isUriAllowed(Uri.file(__filename).toString())).toBe(true);
    });

    test('checks isUriBlackListed', () => {
        const uriFile = Uri.file(__filename);
        expect(isUriBlackListed(uriFile.toString())).toBe(false);

        const uriGit = uriFile.with({ scheme: 'debug' });

        expect(isUriBlackListed(uriGit.toString())).toBe(true);
    });

    test('folders', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        const docSettings = newDocumentSettings();

        const folders = await docSettings.folders;
        expect(folders).toBe(mockFolders);
    });

    test('tests register config path', () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);

        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cSpell.json');
        expect(docSettings.version).toEqual(0);
        docSettings.registerConfigurationFile(configFile);
        expect(docSettings.version).toEqual(1);
        expect(docSettings.configsToImport).toContain(configFile);
    });

    test('test getSettings', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([cspellConfigInVsCode, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cspell-ext.json');
        docSettings.registerConfigurationFile(configFile);

        const settings = await docSettings.getSettings({ uri: Uri.file(__filename).toString() });
        expect(settings).toHaveProperty('name');
        expect(settings.enabled).toBeUndefined();
        expect(settings.language).toBe('en-gb');
    });

    test('test getSettings workspaceRootPath', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([{ ...cspellConfigInVsCode, workspaceRootPath: '${workspaceFolder:client}' }, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cspell-ext.json');
        docSettings.registerConfigurationFile(configFile);

        const settings = await docSettings.getSettings({ uri: Uri.file(__filename).toString() });
        expect(settings.workspaceRootPath?.toLowerCase()).toBe(pathWorkspaceClient.toLowerCase());
    });

    test('test isExcluded', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([{}, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cSpell.json');
        docSettings.registerConfigurationFile(configFile);

        const result = await docSettings.isExcluded(Uri.file(__filename).toString());
        expect(result).toBe(false);
    });

    test('test enableFiletypes', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([{ ...cspellConfigInVsCode, enableFiletypes: ['!typescript', '!javascript', 'pug'] }, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cSpell.json');
        docSettings.registerConfigurationFile(configFile);

        const settings = await docSettings.getSettings({ uri: Uri.file(__filename).toString() });
        expect(settings.enabledLanguageIds).not.toContain('typescript');
        expect(settings.enabledLanguageIds).toEqual(expect.arrayContaining(['php', 'json', 'pug']));
    });

    test('isExcludedBy', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([{}, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cSpell.json');
        docSettings.registerConfigurationFile(configFile);

        const result = await docSettings.calcExcludedBy(Uri.file(__filename).toString());
        expect(result).toHaveLength(0);
    });

    interface IsExcludeByTest {
        filename: string;
        expected: ExcludedByMatch[];
    }

    const pathCspellExcludeTests = Path.resolve('sampleSourceFiles/cspell-exclude-tests.json');

    function oc<T>(t: T): T {
        return expect.objectContaining(t);
    }

    function ocGlob(glob: string, root: string = pathWorkspaceServer, source?: string) {
        return source ? oc({ glob, root, source }) : oc({ glob, root });
    }

    function ex(cfgFile: string, glob: string, root?: string) {
        cfgFile = Path.resolve(pathWorkspaceRoot, cfgFile);
        root = root || Path.dirname(cfgFile);
        return {
            glob: ocGlob(glob, root, cfgFile),
            settings: oc({ source: oc({ filename: cfgFile }) }),
        };
    }

    test.each`
        filename                           | expected
        ${sampleFiles.sampleEsLint}        | ${[ex(pathCspellExcludeTests, '.eslintrc.js', pathWorkspaceRoot)]}
        ${sampleFiles.sampleNodePackage}   | ${[ex('cSpell.json', 'node_modules', pathWorkspaceServer)]}
        ${sampleFiles.sampleSamplesReadme} | ${[ex(pathCspellExcludeTests, 'samples', pathWorkspaceRoot)]}
        ${sampleFiles.sampleEsLint}        | ${[ex(pathCspellExcludeTests, '.eslintrc.js', pathWorkspaceRoot)]}
        ${sampleFiles.sampleClientReadme}  | ${[]}
        ${sampleFiles.samplePackageLock}   | ${[ex(pathCspellExcludeTests, 'package-lock.json', pathWorkspaceRoot)]}
    `('isExcludedBy $filename', async ({ filename, expected }: IsExcludeByTest) => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([{}, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cspell-exclude-tests.json');
        docSettings.registerConfigurationFile(configFile);

        const uri = Uri.file(Path.resolve(pathWorkspaceRoot, filename)).toString();
        const result = await docSettings.calcExcludedBy(uri);
        expect(result).toEqual(expected);
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
        expect(defaultSettings.patterns?.map((p) => p.pattern).map(debugExports.fixRegEx)).toEqual(
            defaultSettings.patterns?.map((p) => p.pattern)
        );
        const sampleRegEx: Pattern[] = ['/#.*/', '/"""(.*?\\n?)+?"""/g', "/'''(.*?\\n?)+?'''/g", 'strings'];
        const expectedRegEx: Pattern[] = ['/#.*/', '/(""")[^\\1]*?\\1/g', "/(''')[^\\1]*?\\1/g", 'strings'];
        expect(sampleRegEx.map(debugExports.fixRegEx)).toEqual(expectedRegEx);
    });

    test('fixPattern', () => {
        const defaultSettings = cspell.getDefaultSettings();
        // Make sure it doesn't change the defaults.
        expect(defaultSettings.patterns?.map(debugExports.fixPattern)).toEqual(defaultSettings.patterns);
    });

    test('fixPattern', () => {
        const defaultSettings = cspell.getDefaultSettings();
        // Make sure it doesn't change the defaults.
        expect(correctBadSettings(defaultSettings)).toEqual(defaultSettings);

        const settings: CSpellUserSettings = {
            patterns: [
                {
                    name: 'strings',
                    pattern: '/"""(.*?\\n?)+?"""/g',
                },
            ],
        };
        const expectedSettings: CSpellUserSettings = {
            patterns: [
                {
                    name: 'strings',
                    pattern: '/(""")[^\\1]*?\\1/g',
                },
            ],
        };
        expect(correctBadSettings(settings)).toEqual(expectedSettings);
        expect(correctBadSettings(settings)).not.toEqual(settings);
    });
});
