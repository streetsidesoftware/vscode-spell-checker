import { debugExports, createWorkspaceNamesResolver, resolveSettings } from './WorkspacePathResolver';
import * as Path from 'path';
import { WorkspaceFolder } from 'vscode-languageserver/node';
import { URI as Uri } from 'vscode-uri';
import { CSpellUserSettings } from '../config/cspellConfig';
import { logError } from 'common-utils/log.js';

jest.mock('vscode-languageserver/node');
jest.mock('./vscode.config');
jest.mock('common-utils/log.js');

const mockLogError = logError as jest.Mock;

const cspellConfigInVsCode: CSpellUserSettings = {
    ignorePaths: ['${workspaceFolder:_server}/**/*.json'],
    import: [
        '${workspaceFolder:_server}/sampleSourceFiles/overrides/cspell.json',
        '${workspaceFolder:_server}/sampleSourceFiles/cSpell.json',
    ],
    enabledLanguageIds: ['typescript', 'javascript', 'php', 'json', 'jsonc'],
};

const cspellConfigCustomUserDictionary: CSpellUserSettings = {
    customUserDictionaries: [
        {
            name: 'Global Dictionary',
            path: '~/words.txt',
            addWords: true,
        },
    ],
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
    ],
};

const cspellConfigCustomFolderDictionary: CSpellUserSettings = {
    customFolderDictionaries: [
        {
            name: 'Folder Dictionary',
            path: './packages/_server/words.txt',
            addWords: true,
        },
        {
            name: 'Root Dictionary',
            path: '${workspaceRoot}/words2.txt',
        },
        {
            name: 'Workspace Dictionary 2',
            path: '${workspaceFolder}/words3.txt',
        },
    ],
};

describe('Validate WorkspacePathResolver', () => {
    test('shallowCleanObject', () => {
        const clean = debugExports.shallowCleanObject;
        expect(clean('hello')).toBe('hello');
        expect(clean(42)).toBe(42);
        expect([1, 2, 3, 4]).toEqual([1, 2, 3, 4]);
        expect({}).toEqual({});
        expect({ name: 'name' }).toEqual({ name: 'name' });
        expect({ name: 'name', age: undefined }).toEqual({ name: 'name' });
    });
});

describe('Validate workspace substitution resolver', () => {
    const rootPath = '/path to root/root';
    const clientPath = Path.join(rootPath, 'client');
    const serverPath = Path.join(rootPath, '_server');
    const clientTestPath = Path.join(clientPath, 'test');
    const rootFolderUri = Uri.file(rootPath);
    const clientUri = Uri.file(clientPath);
    const serverUri = Uri.file(serverPath);
    const testUri = Uri.file(clientTestPath);
    const workspaceFolders = {
        root: {
            name: 'Root Folder',
            uri: rootFolderUri.toString(),
        },
        client: {
            name: 'Client',
            uri: clientUri.toString(),
        },
        server: {
            name: 'Server',
            uri: serverUri.toString(),
        },
        test: {
            name: 'client-test',
            uri: testUri.toString(),
        },
    };
    const workspaces: WorkspaceFolder[] = [workspaceFolders.root, workspaceFolders.client, workspaceFolders.server, workspaceFolders.test];

    const settingsImports: CSpellUserSettings = Object.freeze({
        import: [
            'cspell.json',
            '${workspaceFolder}/cspell.json',
            '${workspaceFolder:Client}/cspell.json',
            '${workspaceFolder:Server}/cspell.json',
            '${workspaceRoot}/cspell.json',
            '${workspaceFolder:Failed}/cspell.json',
            'path/${workspaceFolder:Client}/cspell.json',
        ],
    });

    const settingsIgnorePaths: CSpellUserSettings = Object.freeze({
        ignorePaths: [
            '**/node_modules/**',
            '${workspaceFolder}/node_modules/**',
            '${workspaceFolder:Server}/samples/**',
            '${workspaceFolder:client-test}/**/*.json',
            {
                glob: 'dist/**',
                root: '${workspaceFolder:Server}',
            },
        ],
    });

    const settingsDictionaryDefinitions: CSpellUserSettings = Object.freeze({
        dictionaryDefinitions: [
            {
                name: 'My Dictionary',
                path: '${workspaceFolder:Root Folder}/words.txt',
            },
            {
                name: 'Company Dictionary',
                path: '${root}/node_modules/@company/terms/terms.txt',
            },
            {
                name: 'Project Dictionary',
                path: `${rootPath}/terms/terms.txt`,
            },
        ].map((f) => Object.freeze(f)),
    });

    const settingsLanguageSettings: CSpellUserSettings = Object.freeze({
        languageSettings: [
            {
                languageId: 'typescript',
                dictionaryDefinitions: settingsDictionaryDefinitions.dictionaryDefinitions,
            },
        ].map((f) => Object.freeze(f)),
    });

    const overrides: CSpellUserSettings['overrides'] = [
        {
            filename: ['*.md', '**/*.ts', '**/*.js'],
            languageSettings: settingsLanguageSettings.languageSettings,
            dictionaryDefinitions: settingsDictionaryDefinitions.dictionaryDefinitions,
        },
        {
            filename: '${workspaceFolder:Client}/docs/nl_NL/**',
            language: 'nl',
        },
        {
            filename: ['${workspaceFolder:Client}/**/*.config.json', { glob: '**/*.config.json', root: '${workspaceFolder:Server}' }],
            languageId: 'jsonc',
        },
    ];

    const settingsOverride: CSpellUserSettings = {
        overrides: overrides.map((f) => Object.freeze(f)),
    };

    test('testUri assumptions', () => {
        const u = Uri.file('relative/to/current/dir/file.txt');
        // vscode-uri does not support relative paths.
        expect(u.path).toBe('/relative/to/current/dir/file.txt');
    });

    test('resolveSettings Imports', () => {
        const resolver = createWorkspaceNamesResolver(workspaces[1], workspaces, undefined);
        const result = resolveSettings(settingsImports, resolver);
        const imports = Array.isArray(result.import) ? pp(result.import) : result.import;
        expect(imports).toEqual([
            p('cspell.json'),
            p(`${clientUri.fsPath}/cspell.json`),
            p(`${clientUri.fsPath}/cspell.json`),
            p(`${serverUri.fsPath}/cspell.json`),
            p(`${rootFolderUri.fsPath}/cspell.json`),
            p('${workspaceFolder:Failed}/cspell.json'),
            p('path/${workspaceFolder:Client}/cspell.json'),
        ]);
    });

    test('resolveSettings ignorePaths', () => {
        const root = '/config root';
        const resolver = createWorkspaceNamesResolver(workspaceFolders.client, workspaces, root);
        const result = resolveSettings(settingsIgnorePaths, resolver);
        // '**/node_modules/**',
        // '${workspaceFolder}/node_modules/**',
        // '${workspaceFolder:Server}/samples/**',
        // '${workspaceFolder:client-test}/**/*.json',
        expect(result.ignorePaths).toEqual([
            { glob: '**/node_modules/**', root: root },
            { glob: '/node_modules/**', root: uriToFsPath(workspaceFolders.client.uri) },
            { glob: '/samples/**', root: uriToFsPath(workspaceFolders.server.uri) },
            { glob: '/**/*.json', root: uriToFsPath(workspaceFolders.test.uri) },
            { glob: 'dist/**', root: uriToFsPath(workspaceFolders.server.uri) },
        ]);
    });

    test('resolveSettings dictionaryDefinitions', () => {
        const resolver = createWorkspaceNamesResolver(workspaces[1], workspaces, undefined);
        const result = resolveSettings(settingsDictionaryDefinitions, resolver);
        expect(normalizePath(result.dictionaryDefinitions)).toEqual([
            expect.objectContaining({ name: 'My Dictionary', path: p(`${rootFolderUri.fsPath}/words.txt`) }),
            expect.objectContaining({
                name: 'Company Dictionary',
                path: p(`${rootFolderUri.fsPath}/node_modules/@company/terms/terms.txt`),
            }),
            expect.objectContaining({ name: 'Project Dictionary', path: p(`${rootFolderUri.fsPath}/terms/terms.txt`) }),
        ]);
    });

    test('resolveSettings languageSettings', () => {
        const resolver = createWorkspaceNamesResolver(workspaces[1], workspaces, undefined);
        const result = resolveSettings(settingsLanguageSettings, resolver);
        expect(result?.languageSettings?.[0].languageId).toEqual('typescript');
        expect(normalizePath(result?.languageSettings?.[0].dictionaryDefinitions)).toEqual([
            { name: 'My Dictionary', path: p(`${rootFolderUri.fsPath}/words.txt`) },
            { name: 'Company Dictionary', path: p(`${rootFolderUri.fsPath}/node_modules/@company/terms/terms.txt`) },
            { name: 'Project Dictionary', path: p(`${rootFolderUri.fsPath}/terms/terms.txt`) },
        ]);
    });

    test('resolveSettings overrides', () => {
        const resolver = createWorkspaceNamesResolver(workspaces[1], workspaces, undefined);
        const result = resolveSettings(settingsOverride, resolver);
        expect(result?.overrides?.[0]?.languageSettings?.[0].languageId).toEqual('typescript');
        expect(normalizePath(result?.overrides?.[0].dictionaryDefinitions)).toEqual([
            { name: 'My Dictionary', path: p(`${rootFolderUri.fsPath}/words.txt`) },
            { name: 'Company Dictionary', path: p(`${rootFolderUri.fsPath}/node_modules/@company/terms/terms.txt`) },
            { name: 'Project Dictionary', path: p(`${rootFolderUri.fsPath}/terms/terms.txt`) },
        ]);
        expect(normalizePath(result?.overrides?.[0]?.dictionaryDefinitions)).toEqual([
            { name: 'My Dictionary', path: p(`${rootFolderUri.fsPath}/words.txt`) },
            { name: 'Company Dictionary', path: p(`${rootFolderUri.fsPath}/node_modules/@company/terms/terms.txt`) },
            { name: 'Project Dictionary', path: p(`${rootFolderUri.fsPath}/terms/terms.txt`) },
        ]);
        // @todo need to test changes to filename glob patterns.
        expect(result?.overrides?.map((o) => o.filename)).toEqual([
            [
                {
                    glob: '*.md',
                    root: undefined,
                },
                {
                    glob: '**/*.ts',
                    root: undefined,
                },
                {
                    glob: '**/*.js',
                    root: undefined,
                },
            ],
            {
                glob: '/docs/nl_NL/**',
                root: uriToFsPath(workspaceFolders.client.uri),
            },
            [
                {
                    glob: '/**/*.config.json',
                    root: uriToFsPath(workspaceFolders.client.uri),
                },
                {
                    glob: '**/*.config.json',
                    root: uriToFsPath(workspaceFolders.server.uri),
                },
            ],
        ]);
    });

    test('resolve custom dictionaries', () => {
        const settings: CSpellUserSettings = {
            ...cspellConfigInVsCode,
            ...settingsDictionaryDefinitions,
            ...cspellConfigCustomFolderDictionary,
            ...cspellConfigCustomUserDictionary,
            ...cspellConfigCustomWorkspaceDictionary,
            dictionaries: ['typescript'],
        };
        const resolver = createWorkspaceNamesResolver(workspaces[1], workspaces, 'custom root');
        const result = resolveSettings(settings, resolver);
        expect(result.dictionaries).toEqual([
            'Global Dictionary',
            'Workspace Dictionary',
            'Project Dictionary',
            'Folder Dictionary',
            'Root Dictionary',
            'Workspace Dictionary 2',
            'typescript',
        ]);
        expect(result.dictionaryDefinitions?.map((d) => d.name)).toEqual([
            'Global Dictionary',
            'My Dictionary',
            'Company Dictionary',
            'Project Dictionary',
            'Workspace Dictionary',
            'Folder Dictionary',
            'Root Dictionary',
            'Workspace Dictionary 2',
        ]);
        expect(normalizePath(result.dictionaryDefinitions)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Folder Dictionary',
                    path: p(`${clientUri.fsPath}/packages/_server/words.txt`),
                }),
                expect.objectContaining({
                    name: 'Root Dictionary',
                    path: p('custom root/words2.txt'),
                }),
                expect.objectContaining({
                    name: 'Workspace Dictionary 2',
                    path: p(`${clientUri.fsPath}/words3.txt`),
                }),
            ])
        );
    });

    test('resolve custom dictionaries by name', () => {
        const settings: CSpellUserSettings = {
            ...cspellConfigInVsCode,
            ...settingsDictionaryDefinitions,
            customWorkspaceDictionaries: ['Project Dictionary'],
            customFolderDictionaries: ['Folder Dictionary'], // This dictionary doesn't exist.
            dictionaries: ['typescript'],
        };
        const resolver = createWorkspaceNamesResolver(workspaces[1], workspaces, 'custom root');
        const result = resolveSettings(settings, resolver);
        expect(result.dictionaries).toEqual(['Project Dictionary', 'Folder Dictionary', 'typescript']);
        expect(result.dictionaryDefinitions?.map((d) => d.name)).toEqual(['My Dictionary', 'Company Dictionary', 'Project Dictionary']);
        expect(normalizePath(result.dictionaryDefinitions)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Project Dictionary',
                    path: p('/path to root/root/terms/terms.txt'),
                }),
            ])
        );
        expect(result.dictionaryDefinitions).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Folder Dictionary',
                }),
            ])
        );
    });

    test('Unresolved workspaceFolder', () => {
        mockLogError.mockReset();
        const settings: CSpellUserSettings = {
            ...cspellConfigInVsCode,
            ...settingsDictionaryDefinitions,
            customWorkspaceDictionaries: [{ name: 'Unknown Dictionary' }],
            dictionaries: ['typescript'],
        };
        const resolver = createWorkspaceNamesResolver(workspaces[1], workspaces, 'custom root');
        const result = resolveSettings(settings, resolver);

        expect(result.dictionaryDefinitions).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Unknown Dictionary',
                }),
            ])
        );
        expect(mockLogError).toHaveBeenCalledWith('Failed to resolve ${workspaceFolder:_server}');
    });

    function uriToFsPath(u: string | Uri): string {
        if (typeof u === 'string') {
            u = Uri.parse(u);
        }
        return u.fsPath;
    }

    function normalizePath<T extends { path?: string }>(values?: T[]): T[] | undefined {
        function m(v: T): T {
            const r: T = { ...v };
            r.path = p(v.path || '');
            return r;
        }
        return values?.map(m);
    }

    function pp(paths: string[] | undefined): string[] | undefined {
        return paths?.map(p);
    }

    function p(path: string): string {
        return Uri.file(path).fsPath;
    }
});
