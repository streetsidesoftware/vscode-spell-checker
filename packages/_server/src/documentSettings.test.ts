import { DocumentSettings, isUriAllowed, isUriBlackListed, debugExports, correctBadSettings } from './documentSettings';
import { Connection, WorkspaceFolder } from 'vscode-languageserver';
import { getWorkspaceFolders, getConfiguration } from './vscode.config';
import * as Path from 'path';
import { URI as Uri } from 'vscode-uri';
import * as cspell from 'cspell-lib';
import { Pattern } from 'cspell-lib';
import { CSpellUserSettings } from './cspellConfig';
import * as os from 'os';
import { logError } from './log';

jest.mock('vscode-languageserver');
jest.mock('./vscode.config');
jest.mock('./log');

const mockLogError = logError as jest.Mock;
const mockGetWorkspaceFolders = getWorkspaceFolders as jest.Mock;
const mockGetConfiguration = getConfiguration as jest.Mock;
const workspaceRoot = Path.resolve(Path.join(__dirname, '..', '..', '..'));
const workspaceServer = Path.resolve(Path.join(__dirname, '..'));
const workspaceClient = Path.resolve(Path.join(__dirname, '..', '..', 'client'));
const workspaceFolderServer: WorkspaceFolder = {
    uri: Uri.file(workspaceServer).toString(),
    name: '_server',
};
const workspaceFolderRoot: WorkspaceFolder = {
    uri: Uri.file(workspaceRoot).toString(),
    name: 'vscode-spell-checker',
};
const workspaceFolderClient: WorkspaceFolder = {
    uri: Uri.file(workspaceClient).toString(),
    name: 'client',
};

const cspellConfigInVsCode: CSpellUserSettings = {
    ignorePaths: [
        '${workspaceFolder:_server}/**/*.json'
    ],
    import: [
        '${workspaceFolder:_server}/sampleSourceFiles/overrides/cspell.json',
        '${workspaceFolder:_server}/sampleSourceFiles/cSpell.json',
    ],
    enabledLanguageIds: [
        'typescript',
        'javascript',
        'php',
        'json',
        'jsonc'
    ]
};

const cspellConfigCustomUserDictionary: CSpellUserSettings = {
    customUserDictionaries: [
        {
            name: 'Global Dictionary',
            path: '~/words.txt',
            addWords: true,
        }
    ]
};

const cspellConfigCustomWorkspaceDictionary: CSpellUserSettings = {
    customWorkspaceDictionaries: [
        {
            name: 'Workspace Dictionary',
            path: '${workspaceFolder:Server}/sampleSourceFiles/words.txt',
            addWords: true,
        },
        {
            name: 'Project Dictionary',
            addWords: true,
        },
    ]
};

const cspellConfigCustomFolderDictionary: CSpellUserSettings = {
    customFolderDictionaries: [
        {
            name: 'Folder Dictionary',
            path: './packages/_server/words.txt',
            addWords: true,
        },
        {
            name: 'Folder Dictionary 2',
            path: '${workspaceFolder}/words2.txt',
        },
    ]
};

describe('Validate DocumentSettings', () => {
    beforeEach(() => {
        // Clear all mock instances and calls to constructor and all methods:
        mockGetWorkspaceFolders.mockClear();
    });

    test('shallowCleanObject', () => {
        const clean = debugExports.shallowCleanObject;
        expect(clean('hello')).toBe('hello');
        expect(clean(42)).toBe(42);
        expect([1,2,3,4]).toEqual([1,2,3,4]);
        expect({}).toEqual({});
        expect({ name: 'name' }).toEqual({ name: 'name' });
        expect({ name: 'name', age: undefined }).toEqual({ name: 'name' });
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

        const uriGit = uriFile.with({ scheme: 'debug'});

        expect(isUriBlackListed(uriGit.toString())).toBe(true);
    });

    test('folders', async () => {
        const mockFolders: WorkspaceFolder[] = [
            workspaceFolderRoot,
            workspaceFolderClient,
            workspaceFolderServer,
        ];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        const docSettings = newDocumentSettings();

        const folders = await docSettings.folders;
        expect(folders).toBe(mockFolders);
    });

    test('tests register config path', () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);

        const docSettings = newDocumentSettings();
        const configFile = Path.resolve(Path.join(__dirname, '..', '..', '..', 'cSpell.json'));
        expect(docSettings.version).toEqual(0);
        docSettings.registerConfigurationFile(configFile);
        expect(docSettings.version).toEqual(1);
        expect(docSettings.configsToImport).toContain(configFile);
    });

    test('test getSettings', async () => {
        const mockFolders: WorkspaceFolder[] = [
            workspaceFolderRoot,
            workspaceFolderClient,
            workspaceFolderServer,
        ];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([cspellConfigInVsCode, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.resolve(Path.join(__dirname, '..', 'sampleSourceFiles', 'cspell-ext.json'));
        docSettings.registerConfigurationFile(configFile);

        const settings = await docSettings.getSettings({ uri: Uri.file(__filename).toString() });
        expect(settings).toHaveProperty('name');
        expect(settings.enabled).toBeUndefined();
        expect(settings.language).toBe('en-gb');
    });

    test('test getSettings workspaceRootPath', async () => {
        const mockFolders: WorkspaceFolder[] = [
            workspaceFolderRoot,
            workspaceFolderClient,
            workspaceFolderServer,
        ];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([{...cspellConfigInVsCode, workspaceRootPath: '${workspaceFolder:client}'}, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.resolve(Path.join(__dirname, '..', 'sampleSourceFiles', 'cspell-ext.json'));
        docSettings.registerConfigurationFile(configFile);

        const settings = await docSettings.getSettings({ uri: Uri.file(__filename).toString() });
        expect(settings.workspaceRootPath?.toLowerCase()).toBe(workspaceClient.toLowerCase());
    });

    test('test isExcluded', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([{}, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.resolve(Path.join(__dirname, '..', 'sampleSourceFiles', 'cSpell.json'));
        docSettings.registerConfigurationFile(configFile);

        const result = await docSettings.isExcluded(Uri.file(__filename).toString());
        expect(result).toBe(false);
    });

    test('test enableFiletypes', async () => {
        const mockFolders: WorkspaceFolder[] = [workspaceFolderServer];
        mockGetWorkspaceFolders.mockReturnValue(mockFolders);
        mockGetConfiguration.mockReturnValue([{...cspellConfigInVsCode, enableFiletypes: ['!typescript', '!javascript', 'pug']}, {}]);
        const docSettings = newDocumentSettings();
        const configFile = Path.resolve(Path.join(__dirname, '..', 'sampleSourceFiles', 'cSpell.json'));
        docSettings.registerConfigurationFile(configFile);

        const settings = await docSettings.getSettings({ uri: Uri.file(__filename).toString() });
        expect(settings.enabledLanguageIds).not.toContain('typescript');
        expect(settings.enabledLanguageIds).toEqual(expect.arrayContaining(['php', 'json', 'pug']));
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

describe('Validate workspace substitution resolver', () => {
    const rootPath = '/path to root/root';
    const clientPath = Path.normalize(Path.join(rootPath, 'client'));
    const serverPath = Path.normalize(Path.join(rootPath, '_server'));
    const clientTestPath = Path.normalize(Path.join(clientPath, 'test'));
    const rootUri = Uri.file(rootPath);
    const clientUri = Uri.file(clientPath);
    const serverUri = Uri.file(serverPath);
    const testUri = Uri.file(clientTestPath);
    const workspaceFolders = {
        root:
        {
            name: 'Root',
            uri: rootUri.toString()
        },
        client:
        {
            name: 'Client',
            uri: clientUri.toString()
        },
        server:
        {
            name: 'Server',
            uri: serverUri.toString()
        },
        test: {
            name: 'client-test',
            uri: testUri.toString()
        }
    };
    const workspaces: WorkspaceFolder[] = [
        workspaceFolders.root,
        workspaceFolders.client,
        workspaceFolders.server,
        workspaceFolders.test,
    ];

    const settingsImports: CSpellUserSettings = Object.freeze({
        'import': [
            'cspell.json',
            '${workspaceFolder}/cspell.json',
            '${workspaceFolder:Client}/cspell.json',
            '${workspaceFolder:Server}/cspell.json',
            '${workspaceFolder:Root}/cspell.json',
            '${workspaceFolder:Failed}/cspell.json',
            'path/${workspaceFolder:Client}/cspell.json',
        ]
    });

    const settingsIgnorePaths: CSpellUserSettings = Object.freeze({
        ignorePaths: [
            '**/node_modules/**',
            '${workspaceFolder}/node_modules/**',
            '${workspaceFolder:Server}/samples/**',
            '${workspaceFolder:client-test}/**/*.json',
        ]
    });

    const settingsDictionaryDefinitions: CSpellUserSettings = Object.freeze({
        dictionaryDefinitions: [
            {
                name: 'My Dictionary',
                path: '${workspaceFolder:Root}/words.txt'
            },
            {
                name: 'Company Dictionary',
                path: '${workspaceFolder}/node_modules/@company/terms/terms.txt'
            },
            {
                name: 'Project Dictionary',
                path: `${rootPath}/terms/terms.txt`
            },
        ].map(f => Object.freeze(f))
    });

    const settingsLanguageSettings: CSpellUserSettings = Object.freeze({
        languageSettings: [
            {
                languageId: 'typescript',
                dictionaryDefinitions: settingsDictionaryDefinitions.dictionaryDefinitions
            }
        ].map(f => Object.freeze(f))
    });

    const settingsOverride: CSpellUserSettings = {
        overrides: [
            {
                filename: '*.ts',
                ignorePaths: settingsIgnorePaths.ignorePaths,
                languageSettings: settingsLanguageSettings.languageSettings,
                dictionaryDefinitions: settingsDictionaryDefinitions.dictionaryDefinitions
            }
        ].map(f => Object.freeze(f))
    };

    test('resolveSettings Imports', () => {
        const resolver = debugExports.createWorkspaceNamesResolver(workspaces[1], workspaces, undefined);
        const result = debugExports.resolveSettings(settingsImports, resolver);
        expect(result.import).toEqual([
            'cspell.json',
            `${clientUri.fsPath}/cspell.json`,
            `${clientUri.fsPath}/cspell.json`,
            `${serverUri.fsPath}/cspell.json`,
            `${rootUri.fsPath}/cspell.json`,
            '${workspaceFolder:Failed}/cspell.json',
            'path/${workspaceFolder:Client}/cspell.json',
        ]);
    });

    test('resolveSettings ignorePaths', () => {
        const resolver = debugExports.createWorkspaceNamesResolver(workspaceFolders.client, workspaces, undefined);
        const result = debugExports.resolveSettings(settingsIgnorePaths, resolver);
        expect(result.ignorePaths).toEqual([
            '**/node_modules/**',
            '/node_modules/**',
            `${serverUri.path}/samples/**`,
            '/test/**/*.json',
        ]);
    });

    test('resolveSettings dictionaryDefinitions', () => {
        const resolver = debugExports.createWorkspaceNamesResolver(workspaces[1], workspaces, undefined);
        const result = debugExports.resolveSettings(settingsDictionaryDefinitions, resolver);
        expect(result.dictionaryDefinitions).toEqual([
            expect.objectContaining({ name: 'My Dictionary', path: `${rootUri.fsPath}/words.txt`}),
            expect.objectContaining({ name: 'Company Dictionary', path: `${clientUri.fsPath}/node_modules/@company/terms/terms.txt`}),
            expect.objectContaining({ name: 'Project Dictionary', path: `${rootPath}/terms/terms.txt`}),
        ]);
    });

    test('resolveSettings languageSettings', () => {
        const resolver = debugExports.createWorkspaceNamesResolver(workspaces[1], workspaces, undefined);
        const result = debugExports.resolveSettings(settingsLanguageSettings, resolver);
        expect(result?.languageSettings?.[0]).toEqual({
            languageId: 'typescript',
            dictionaryDefinitions: [
                { name: 'My Dictionary', path: `${rootUri.fsPath}/words.txt`},
                { name: 'Company Dictionary', path: `${clientUri.fsPath}/node_modules/@company/terms/terms.txt`},
                { name: 'Project Dictionary', path: `${rootPath}/terms/terms.txt` },
            ]
        });
    });

    test('resolveSettings overrides', () => {
        const resolver = debugExports.createWorkspaceNamesResolver(workspaces[1], workspaces, undefined);
        const result = debugExports.resolveSettings(settingsOverride, resolver);
        expect(result?.overrides?.[0]?.languageSettings?.[0]).toEqual({
            languageId: 'typescript',
            dictionaryDefinitions: [
                { name: 'My Dictionary', path: `${rootUri.fsPath}/words.txt`},
                { name: 'Company Dictionary', path: `${clientUri.fsPath}/node_modules/@company/terms/terms.txt`},
                { name: 'Project Dictionary', path: `${rootPath}/terms/terms.txt` },
            ]
        });
        expect(result?.overrides?.[0]?.dictionaryDefinitions).toEqual([
            { name: 'My Dictionary', path: `${rootUri.fsPath}/words.txt`},
            { name: 'Company Dictionary', path: `${clientUri.fsPath}/node_modules/@company/terms/terms.txt`},
            { name: 'Project Dictionary', path: `${rootPath}/terms/terms.txt` },
        ]);
        expect(result?.overrides?.[0]?.ignorePaths).toEqual([
            '**/node_modules/**',
            '/node_modules/**',
            `${serverUri.path}/samples/**`,
            '/test/**/*.json',
        ]);
    });

    test('resolve custom dictionaries', () => {
        const settings: CSpellUserSettings = {
            ...cspellConfigInVsCode,
            ...settingsDictionaryDefinitions,
            ...cspellConfigCustomFolderDictionary,
            ...cspellConfigCustomUserDictionary,
            ...cspellConfigCustomWorkspaceDictionary,
            dictionaries: [ 'typescript' ],
        }
        const resolver = debugExports.createWorkspaceNamesResolver(workspaces[1], workspaces, 'custom root');
        const result = debugExports.resolveSettings(settings, resolver);
        expect(result.dictionaries).toEqual([
            'Global Dictionary',
            'Workspace Dictionary',
            'Project Dictionary',
            'Folder Dictionary',
            'Folder Dictionary 2',
            'typescript',
        ]);
        expect(result.dictionaryDefinitions?.map(d => d.name)).toEqual([
            'Global Dictionary',
            'My Dictionary',
            'Company Dictionary',
            'Project Dictionary',
            'Workspace Dictionary',
            'Folder Dictionary',
            'Folder Dictionary 2',
        ]);
        expect(result.dictionaryDefinitions).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: 'Folder Dictionary',
                path: 'custom root/packages/_server/words.txt',
            }),
            expect.objectContaining({
                name: 'Folder Dictionary 2',
                path: expect.stringMatching(/^[/\\]path to root[/\\]root[/\\]client[/\\]words2\.txt$/),
            }),
        ]));
    });

    test('Unresolved workspaceFolder', () => {
        mockLogError.mockReset()
        const settings: CSpellUserSettings = {
            ...cspellConfigInVsCode,
            ...settingsDictionaryDefinitions,
            customWorkspaceDictionaries: [
                { name: 'Unknown Dictionary' }
            ],
            dictionaries: [ 'typescript' ],
        }
        const resolver = debugExports.createWorkspaceNamesResolver(workspaces[1], workspaces, 'custom root');
        const result = debugExports.resolveSettings(settings, resolver);

        expect(result.dictionaryDefinitions).not.toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: 'Unknown Dictionary',
            }),
        ]));
        expect(mockLogError).toHaveBeenCalledWith('Failed to resolve ${workspaceFolder:_server}');
        expect(mockLogError).toHaveBeenCalledWith("Unknown Dictionary: 'Unknown Dictionary', no path found.");
    });
});
