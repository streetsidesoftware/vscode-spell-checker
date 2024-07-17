import type { Pattern } from 'cspell-lib';
import * as cspell from 'cspell-lib';
import { getDefaultSettings } from 'cspell-lib';
import * as os from 'os';
import * as Path from 'path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ConfigurationItem, Connection, WorkspaceFolder } from 'vscode-languageserver/node.js';
import { URI as Uri } from 'vscode-uri';

import { createMockServerSideApi } from '../test/test.api.js';
import { extendExpect } from '../test/test.matchers.js';
import type { CSpellUserSettings } from './cspellConfig/index.mjs';
import type { ExcludedByMatch } from './documentSettings.mjs';
import {
    __testing__,
    correctBadSettings,
    debugExports,
    DocumentSettings,
    isUriAllowedBySettings,
    isUriBlockedBySettings,
} from './documentSettings.mjs';
import { isFileTypeEnabled } from './extractEnabledFileTypes.mjs';
import { getConfiguration, getWorkspaceFolders } from './vscode.config.mjs';

const { toEqualCaseInsensitive: expectToEqualCaseInsensitive } = extendExpect(expect);

vi.mock('vscode-languageserver/node');
vi.mock('./vscode.config');

const mockGetWorkspaceFolders = vi.mocked(getWorkspaceFolders);
const mockGetConfiguration = vi.mocked(getConfiguration);
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
    name: 'Mock VS Code Config',
    ignorePaths: ['${workspaceFolder:_server}/**/*.json'],
    import: [
        '${workspaceFolder:_server}/sampleSourceFiles/overrides/cspell.json',
        '${workspaceFolder:_server}/sampleSourceFiles/cSpell.json',
    ],
    enabledLanguageIds: ['typescript', 'javascript', 'php', 'json', 'jsonc'],
    mergeCSpellSettings: true,
    useLocallyInstalledCSpellDictionaries: true,
};

const sampleFiles = {
    sampleClientEsLint: Path.resolve(pathWorkspaceRoot, 'packages/client/.eslintrc.js'),
    sampleClientReadme: Path.resolve(pathWorkspaceRoot, 'packages/client/README.md'),
    sampleNodePackage: require.resolve('yargs'),
    sampleSamplesReadme: Path.resolve(pathWorkspaceRoot, 'samples/custom-dictionary/README.md'),
    sampleServerCSpell: Path.resolve(pathWorkspaceRoot, 'packages/_server/cspell.json'),
    sampleServerPackageLock: Path.resolve(pathWorkspaceRoot, 'packages/_server/package-lock.json'),
};

const configFiles = {
    rootConfigJson: Path.resolve(pathWorkspaceRoot, 'cspell.json'),
    rootConfigYaml: Path.resolve(pathWorkspaceRoot, 'cspell.config.yaml'),
    clientConfig: Path.resolve(pathWorkspaceClient, 'cspell.json'),
    serverConfig: Path.resolve(pathWorkspaceServer, 'cspell.json'),
    rootConfigVSCode: Path.resolve(pathWorkspaceRoot, '.vscode/cSpell.json'),
    clientConfigVSCode: Path.resolve(pathWorkspaceClient, '.vscode/cspell.json'),
    serverConfigVSCode: Path.resolve(pathWorkspaceServer, '.vscode/cspell.json'),
};

// const ac: typeof expect.arrayContaining = (...p) => expect.arrayContaining(...p);

describe('Validate DocumentSettings', () => {
    beforeEach(() => {
        // Clear all mock instances and calls to constructor and all methods:
        mockGetWorkspaceFolders.mockClear();
    });

    test('version', async () => {
        const docSettings = newDocumentSettings();
        expect(docSettings.version).toEqual(0);
        await docSettings.resetSettings();
        expect(docSettings.version).toEqual(1);
    });

    test('checks isUriAllowed', () => {
        expect(isUriAllowedBySettings(Uri.parse(import.meta.url).toString(), {})).toBe(true);
    });

    test('checks isUriBlocked', () => {
        const uriFile = Uri.parse(import.meta.url);
        expect(isUriBlockedBySettings(uriFile.toString(), {})).toBe(false);

        const uriGit = uriFile.with({ scheme: 'debug' });

        expect(isUriBlockedBySettings(uriGit.toString(), {})).toBe(true);
    });

    test('folders', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        const docSettings = newDocumentSettings();

        const folders = await docSettings.folders;
        expect(folders).toBe(mockFolders);
    });

    test('tests register config path', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));

        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cSpell.json');
        expect(docSettings.version).toEqual(0);
        await docSettings.registerConfigurationFile(configFile);
        expect(docSettings.version).toEqual(1);
        expect(docSettings.configsToImport).toContain(configFile);
    });

    test('test getSettings', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(Promise.resolve([cspellConfigInVsCode, {}]));
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cspell-ext.json');
        await docSettings.registerConfigurationFile(configFile);

        const settings = await docSettings.getSettings({ uri: Uri.parse(import.meta.url).toString() });
        expect(settings.enabled).toBeUndefined();
        expect(settings.language).toBe('en-gb');
    });

    test('test getSettings workspaceRootPath', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(
            Promise.resolve([{ ...cspellConfigInVsCode, workspaceRootPath: '${workspaceFolder:client}' }, {}]),
        );
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cspell-ext.json');
        await docSettings.registerConfigurationFile(configFile);

        const settings = await docSettings.getSettings({ uri: Uri.parse(import.meta.url).toString() });
        expect(settings.workspaceRootPath?.toLowerCase()).toBe(pathWorkspaceClient.toLowerCase());
    });

    test('test isExcluded', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(Promise.resolve([{}, {}]));
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cSpell.json');
        await docSettings.registerConfigurationFile(configFile);

        const result = await docSettings.isExcluded(Uri.parse(import.meta.url).toString());
        expect(result).toBe(false);
    });

    test('test enableFiletypes', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(
            Promise.resolve([{ ...cspellConfigInVsCode, enableFiletypes: ['!typescript', '!javascript', 'pug'] }, {}]),
        );
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cSpell.json');
        await docSettings.registerConfigurationFile(configFile);

        const settings = await docSettings.getSettings({ uri: Uri.parse(import.meta.url).toString() });
        expect(settings.enabledLanguageIds).toBeUndefined();
        expect(settings.enabledFileTypes).toEqual({
            dart: true,
            fsharp: true,
            javascript: false,
            json: true,
            jsonc: true,
            julia: true,
            php: true,
            pug: true,
            r: true,
            sql: true,
            svelte: true,
            terraform: true,
            typescript: false,
        });
    });

    test('applyEnableFiletypes', () => {
        const settings: CSpellUserSettings = {
            enabledLanguageIds: ['typescript', 'markdown', 'plaintext', 'json'],
            enableFiletypes: ['!json', '!!!javascript'],
            enabledFileTypes: { typescript: true, plaintext: false, FreeFormFortran: true, json: true },
        };
        Object.freeze(settings);
        const r = __testing__.applyEnabledFileTypes(settings);
        expect(r.enabledLanguageIds).toBeUndefined();
        expect(r.enabledFileTypes).toEqual({
            FreeFormFortran: true,
            javascript: false,
            json: true,
            markdown: true,
            plaintext: false,
            typescript: true,
        });
    });

    test.each`
        languageId      | settings                                                                      | expected
        ${'typescript'} | ${{}}                                                                         | ${false}
        ${'typescript'} | ${{ enableFiletypes: ['typescript'] }}                                        | ${true}
        ${'typescript'} | ${{ enableFiletypes: ['!!!typescript'], enabledLanguageIds: ['typescript'] }} | ${false}
        ${'javascript'} | ${{ enableFiletypes: ['typescript'], checkOnlyEnabledFileTypes: false }}      | ${true}
        ${'javascript'} | ${{ enableFiletypes: ['typescript'], checkOnlyEnabledFileTypes: true }}       | ${false}
        ${'javascript'} | ${{ enableFiletypes: ['!javascript'], checkOnlyEnabledFileTypes: false }}     | ${false}
        ${'typescript'} | ${{ enableFiletypes: ['*'] }}                                                 | ${true}
        ${'typescript'} | ${{ enableFiletypes: ['*'], checkOnlyEnabledFileTypes: true }}                | ${true}
        ${'typescript'} | ${{ enableFiletypes: ['*'], checkOnlyEnabledFileTypes: false }}               | ${true}
        ${'typescript'} | ${{ enableFiletypes: ['!*'], checkOnlyEnabledFileTypes: true }}               | ${false}
        ${'typescript'} | ${{ enableFiletypes: ['!*'], checkOnlyEnabledFileTypes: false }}              | ${true}
        ${'java'}       | ${{ enableFiletypes: ['!*', 'java'], checkOnlyEnabledFileTypes: true }}       | ${true}
    `('isLanguageEnabled $languageId $settings', ({ languageId, settings, expected }) => {
        expect(isFileTypeEnabled(languageId, settings)).toBe(expected);
    });

    test('isExcludedBy', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(Promise.resolve([{}, {}]));
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cSpell.json');
        await docSettings.registerConfigurationFile(configFile);

        const result = await docSettings.calcExcludedBy(Uri.parse(import.meta.url).toString());
        expect(result).toHaveLength(0);
    });

    test('test extractTargetDictionaries', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(Promise.resolve([cspellConfigInVsCode, {}]));
        const docSettings = newDocumentSettings();
        const settings = await docSettings.getSettings({ uri: Uri.parse(import.meta.url).toString() });
        const d = docSettings.extractTargetDictionaries(settings);
        expect(d).toEqual([
            expect.objectContaining({
                addWords: true,
                name: 'cspell-words',
            }),
        ]);
    });

    test('test extractCSpellConfigurationFiles', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(Promise.resolve([cspellConfigInVsCode, {}]));
        const docSettings = newDocumentSettings();
        const settings = await docSettings.getSettings({ uri: Uri.parse(import.meta.url).toString() });
        const files = docSettings.extractCSpellConfigurationFiles(settings);
        expect(files.map((f) => f.toString())).toEqual(
            expect.arrayContaining([Uri.file(Path.join(pathWorkspaceServer, 'cspell.json')).toString()]),
        );
    });

    test('test extractCSpellFileConfigurations', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(Promise.resolve([cspellConfigInVsCode, {}]));
        const docSettings = newDocumentSettings();
        const settings = await docSettings.getSettings({ uri: Uri.parse(import.meta.url).toString() });
        const configs = docSettings.extractCSpellFileConfigurations(settings);
        expect(configs.map((c) => c.name)).toEqual([
            shortPathName(Path.join(pathWorkspaceServer, 'cspell.json')),
            shortPathName(Path.join(pathWorkspaceRoot, 'cspell.config.yaml')),
            'sampleSourceFiles/cSpell.json',
            'sampleSourceFiles/cspell-ext.json',
            'overrides/cspell.json',
        ]);
    });

    interface IsExcludeByTest {
        filename: string;
        expected: ExcludedByMatch[];
    }

    const pathCspellExcludeTests = Path.resolve(pathWorkspaceServer, 'sampleSourceFiles/cspell-exclude-tests.json');

    function oc<T>(t: T): T {
        return expect.objectContaining(t);
    }

    function ocGlob(glob: string, root: string = pathWorkspaceServer, source?: string) {
        return source ? oc({ glob, root, source }) : oc({ glob, root });
    }

    function matchString(s: string) {
        return expectToEqualCaseInsensitive(s);
    }

    function ex(cfgFile: string, glob: string, root?: string) {
        cfgFile = Path.resolve(pathWorkspaceRoot, cfgFile);
        root = root || Path.dirname(cfgFile);
        const filename = matchString(cfgFile);
        return {
            glob: ocGlob(glob, matchString(root), filename),
            settings: oc({ source: oc({ filename }) }),
        };
    }

    test.each`
        filename                               | expected
        ${sampleFiles.sampleClientEsLint}      | ${[ex(pathCspellExcludeTests, '.eslintrc.js', pathWorkspaceRoot)]}
        ${sampleFiles.sampleSamplesReadme}     | ${[ex(pathCspellExcludeTests, 'samples', pathWorkspaceRoot)]}
        ${sampleFiles.sampleClientEsLint}      | ${[ex(pathCspellExcludeTests, '.eslintrc.js', pathWorkspaceRoot)]}
        ${sampleFiles.sampleClientReadme}      | ${[]}
        ${sampleFiles.sampleServerPackageLock} | ${[ex(pathCspellExcludeTests, 'package-lock.json', pathWorkspaceRoot), ex('cspell.config.yaml', 'package-lock.json', pathWorkspaceRoot)]}
    `('isExcludedBy $filename', async ({ filename, expected }: IsExcludeByTest) => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(Promise.resolve([{ mergeCSpellSettings: true }, {}]));
        const docSettings = newDocumentSettings();
        const configFile = Path.join(pathSampleSourceFiles, 'cspell-exclude-tests.json');
        await docSettings.registerConfigurationFile(configFile);

        const uri = Uri.file(Path.resolve(pathWorkspaceRoot, filename)).toString();
        const result = await docSettings.calcExcludedBy(uri);
        const rSimplified = result
            .map(({ glob, settings }) => ({ glob, source: settings.source }))
            .map(({ glob, source }) => ({ glob, settings: { source: { name: source?.name, filename: source?.filename } } }));

        // console.log('%o', rSimplified);
        expect(rSimplified).toEqual(expected);
    });

    test.each`
        filename                                   | expected
        ${sampleFiles.sampleNodePackage}           | ${true}
        ${Path.join(__dirname, 'temp/my_file.js')} | ${true}
        ${sampleFiles.sampleClientEsLint}          | ${false}
        ${sampleFiles.sampleServerPackageLock}     | ${false}
    `('isGitIgnored $filename', async ({ filename, expected }: IsExcludeByTest) => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(Promise.resolve([{}, {}]));
        const docSettings = newDocumentSettings();
        await docSettings.registerConfigurationFile(Path.join(pathWorkspaceRoot, 'cSpell.json'));

        const uri = Uri.file(Path.resolve(pathWorkspaceRoot, filename));
        const result = await docSettings.isGitIgnored(uri);
        expect(result).toEqual(expected);
    });

    function uf(f: string | Uri): Uri;
    function uf(f: (string | Uri)[]): Uri[];
    function uf(f: (string | Uri)[] | (string | Uri)): Uri | Uri[] {
        if (Array.isArray(f)) {
            return f.map((u) => uf(u));
        }
        return typeof f === 'string' ? Uri.file(f) : f;
    }

    function uft(f: string | Uri): string;
    function uft(f: (string | Uri)[]): string[];
    function uft(f: (string | Uri)[] | (string | Uri)): string | string[] {
        if (Array.isArray(f)) {
            return uf(f).map((u) => u.toString());
        }
        return uf(f).toString();
    }

    type UriString = string;

    interface FilterConfigFilesToMatchInheritedPathOfFileTest {
        filename: UriString;
        configs: UriString[];
        expected: UriString[];
    }

    const samplesCustomDictionaryCspell = Path.resolve(pathWorkspaceRoot, 'samples/custom-dictionary/cspell.json');

    test.each`
        filename                                    | configs                                                              | expected
        ${uft(sampleFiles.sampleClientEsLint)}      | ${uft([configFiles.clientConfig, configFiles.rootConfigYaml])}       | ${uft([configFiles.clientConfig, configFiles.rootConfigYaml])}
        ${uft(sampleFiles.sampleNodePackage)}       | ${uft([configFiles.clientConfig, configFiles.rootConfigJson])}       | ${uft([configFiles.rootConfigJson])}
        ${uft(sampleFiles.sampleSamplesReadme)}     | ${uft([samplesCustomDictionaryCspell])}                              | ${uft([samplesCustomDictionaryCspell])}
        ${uft(sampleFiles.sampleClientReadme)}      | ${uft([configFiles.clientConfigVSCode, configFiles.rootConfigJson])} | ${uft([configFiles.clientConfigVSCode, configFiles.rootConfigJson])}
        ${uft(configFiles.clientConfigVSCode)}      | ${uft([configFiles.clientConfigVSCode, configFiles.rootConfigJson])} | ${uft([configFiles.clientConfigVSCode, configFiles.rootConfigJson])}
        ${uft(sampleFiles.sampleServerPackageLock)} | ${uft([configFiles.serverConfigVSCode, configFiles.rootConfigJson])} | ${uft([configFiles.serverConfigVSCode, configFiles.rootConfigJson])}
        ${uft(sampleFiles.sampleServerPackageLock)} | ${uft([configFiles.rootConfigVSCode, configFiles.clientConfig])}     | ${uft([configFiles.rootConfigVSCode])}
    `(
        'filterConfigFilesToMatchInheritedPathOfFile against $filename $configs',
        async ({ filename, configs, expected }: FilterConfigFilesToMatchInheritedPathOfFileTest) => {
            const mockFolders: WorkspaceFolder[] = [];
            mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
            mockGetConfiguration.mockReturnValue(Promise.resolve([{}, {}]));
            const configUris = configs.map((u) => Uri.parse(u));
            const result = debugExports.filterConfigFilesToMatchInheritedPathOfFile(configUris, Uri.parse(filename));
            expect(result.map((f) => f.toString().toLowerCase())).toEqual(expected.map((u) => u.toLowerCase()));
        },
    );

    interface FindCSpellConfigurationFilesForUriTest {
        filename: string;
        expected: (string | Uri)[];
    }

    test.each`
        filename                               | expected
        ${sampleFiles.sampleClientEsLint}      | ${[configFiles.clientConfig, configFiles.rootConfigYaml]}
        ${sampleFiles.sampleNodePackage}       | ${[configFiles.rootConfigJson, configFiles.rootConfigYaml]}
        ${sampleFiles.sampleSamplesReadme}     | ${[Path.resolve(pathWorkspaceRoot, 'samples/custom-dictionary/cspell.json')]}
        ${sampleFiles.sampleClientReadme}      | ${[configFiles.clientConfig, configFiles.rootConfigYaml]}
        ${sampleFiles.sampleServerPackageLock} | ${[configFiles.serverConfig, configFiles.rootConfigYaml]}
    `('findCSpellConfigurationFilesForUri $filename', async ({ filename, expected }: FindCSpellConfigurationFilesForUriTest) => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderRoot, workspaceFolderClient, workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(Promise.resolve([{}, {}]));
        const docSettings = newDocumentSettings(await getDefaultSettings());
        const uri = Uri.file(Path.resolve(pathWorkspaceRoot, filename)).toString();
        const result = await docSettings.findCSpellConfigurationFilesForUri(uri);
        // Note: toLowerCase is needed because on MacOS and Windows cSpell.json and cspell.json will be considered the same file.
        expect(result.map((f) => f.toString().toLowerCase())).toEqual(expected.map((u) => filePathToUri(u).toString().toLowerCase()));
    });

    function rPathWsRoot(...paths: string[]) {
        return Path.resolve(pathWorkspaceRoot, ...paths);
    }

    test.each`
        filename                               | expected
        ${sampleFiles.sampleClientEsLint}      | ${[configFiles.clientConfig, configFiles.rootConfigYaml]}
        ${sampleFiles.sampleNodePackage}       | ${[configFiles.rootConfigJson, configFiles.rootConfigYaml]}
        ${sampleFiles.sampleSamplesReadme}     | ${[rPathWsRoot('samples/custom-dictionary/cspell.json')]}
        ${sampleFiles.sampleClientReadme}      | ${[configFiles.clientConfig, configFiles.rootConfigYaml]}
        ${sampleFiles.sampleServerPackageLock} | ${[configFiles.serverConfig, configFiles.rootConfigYaml]}
    `('findCSpellConfigurationFilesForUri no folders $filename', async ({ filename, expected }: FindCSpellConfigurationFilesForUriTest) => {
        const mockFolders: WorkspaceFolder[] = [];
        mockGetWorkspaceFolders.mockReturnValue(Promise.resolve(mockFolders));
        mockGetConfiguration.mockReturnValue(Promise.resolve([{}, {}]));
        const docSettings = newDocumentSettings(await getDefaultSettings());
        const uri = Uri.file(Path.resolve(pathWorkspaceRoot, filename)).toString();
        const result = await docSettings.findCSpellConfigurationFilesForUri(uri);
        // Note: toLowerCase is needed because on MacOS and Windows cSpell.json and cspell.json will be considered the same file.
        expect(result.map((f) => f.toString().toLowerCase())).toEqual(expected.map((u) => filePathToUri(u).toString().toLowerCase()));
    });

    function newDocumentSettings(defaultSettings: CSpellUserSettings = {}) {
        const connection = createMockConnection();
        const mockWorkspaceGetConfiguration = vi.mocked(connection.workspace.getConfiguration);
        mockWorkspaceGetConfiguration.mockImplementation(implGetConfiguration);
        return new DocumentSettings(connection, createMockServerSideApi(), defaultSettings);
    }

    function implGetConfiguration(): Promise<any>;
    function implGetConfiguration(section: string): Promise<any>;
    function implGetConfiguration(section: ConfigurationItem): Promise<any>;
    function implGetConfiguration(section: ConfigurationItem[]): Promise<any[]>;
    function implGetConfiguration(section?: string | ConfigurationItem | ConfigurationItem[]): Promise<any> {
        const sec =
            typeof section == 'string' ? section : !section ? undefined : Array.isArray(section) ? section[0].section : section.section;
        if (sec === 'cSpell.trustedWorkspace') {
            return Promise.resolve(true);
        }

        return Promise.resolve(undefined);
    }
});

describe('Validate RegExp corrections', () => {
    test('fixRegEx', async () => {
        const defaultSettings = await cspell.getDefaultSettings();
        const patterns = defaultSettings.patterns;

        // Make sure it doesn't change the defaults.
        expect(patterns?.map((p) => p.pattern).map(debugExports.fixRegEx)).toEqual(patterns?.map((p) => p.pattern));
        const sampleRegEx: Pattern[] = ['/#.*/', '/"""(.*?\\n?)+?"""/g', "/'''(.*?\\n?)+?'''/g", 'strings'];
        const expectedRegEx: Pattern[] = ['/#.*/', '/(""")[^\\1]*?\\1/g', "/(''')[^\\1]*?\\1/g", 'strings'];
        expect(sampleRegEx.map(debugExports.fixRegEx)).toEqual(expectedRegEx);
    });

    test('fixPattern', async () => {
        const defaultSettings = await cspell.getDefaultSettings();
        // Make sure it doesn't change the defaults.
        expect(defaultSettings.patterns?.map(debugExports.fixPattern)).toEqual(defaultSettings.patterns);
    });

    test('fixPattern', async () => {
        const defaultSettings = await cspell.getDefaultSettings();
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

function filePathToUri(file: string | Uri): Uri {
    return typeof file == 'string' ? Uri.file(file) : file;
}

function shortPathName(file: string | Uri): string {
    const uri = filePathToUri(file);
    const parts = uri.toString().split('/');
    return parts.slice(-2).join('/');
}

function createMockConnection(): Connection {
    const jest = vi;

    return {
        listen: jest.fn(),
        onInitialize: jest.fn(),
        onInitialized: jest.fn(),
        onDidChangeConfiguration: jest.fn(),
        onDidChangeWatchedFiles: jest.fn(),
        onShutdown: jest.fn(),
        sendNotification: jest.fn() as unknown as Connection['sendNotification'],
        sendRequest: jest.fn() as unknown as Connection['sendRequest'],
        onRequest: jest.fn() as unknown as Connection['onRequest'],
        onNotification: jest.fn() as unknown as Connection['onNotification'],
        dispose: jest.fn(),
        window: {
            connection: {} as Connection,
            initialize: jest.fn(),
            fillServerCapabilities: jest.fn(),
            showErrorMessage: jest.fn(),
            showInformationMessage: jest.fn(),
            showWarningMessage: jest.fn(),
            attachWorkDoneProgress: jest.fn(),
            createWorkDoneProgress: jest.fn(),
            showDocument: jest.fn(),
        },
        workspace: {
            getConfiguration: jest.fn(),
        } as unknown as Connection['workspace'],
    } as unknown as Connection;
}
