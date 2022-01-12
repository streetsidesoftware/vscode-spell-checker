//
import { homedir } from 'os';
import { ConfigurationTarget, ExtensionContext, Uri, workspace, WorkspaceFolder } from 'vscode';
import { Utils as UriUtils } from 'vscode-uri';
import { CSpellUserSettings, CustomDictionaries, CustomDictionaryEntry, DictionaryDefinitionCustom } from '../client';
import { CSpellClient } from '../client/client';
import { getPathToTemp } from '../test/helpers';
import { createConfigFileReaderWriter } from './configFileReadWrite';
import { createCSpellConfigRepository, createVSCodeConfigRepository } from './configRepository';
import { createClientConfigTargetCSpell } from './configTargetHelper';
import { DictionaryHelper, __testing__ } from './DictionaryHelper';
import { createDictionaryTargetForConfigRep } from './DictionaryTarget';
import { MemoryConfigFileReaderWriter, MemoryConfigVSReaderWriter } from './test/memoryReaderWriter';

const {
    addCustomDictionaryToConfig,
    calcDictInfoForConfigRep,
    combineCustomDictionaries,
    createCustomDictionaryForConfigRep,
    isTextDocument,
} = __testing__;

jest.mock('../client/client', () => {
    return {
        CSpellClient: jest.fn().mockImplementation(() => {
            return {
                getConfigurationForDocument: jest.fn(),
                notifySettingsChanged: () => Promise.resolve(),
            };
        }),
    };
});

const fakeExtensionContext: ExtensionContext = {} as any;

const defByName = {
    'custom-workspace': cd('custom-workspace'),
    'custom-words': cd('custom-words'),
    terms: cd('terms'),
} as const;

const customFolderDictionaries: CustomDictionaryEntry[] = ['custom-folder'];
const customDictionariesFolder: CustomDictionaries = {
    'custom-folder': true,
};

const customWorkspaceDictionaries: CustomDictionaryEntry[] = [defByName['custom-workspace'], 'company-terms'];
const customDictionariesWorkspace: CustomDictionaries = {
    'company-terms': true,
    'custom-workspace': cd('custom-workspace', true, 'workspace'),
};

const cfg_1_In: CSpellUserSettings = {
    customWorkspaceDictionaries,
};

const cfg_1_out: CSpellUserSettings = {
    customDictionaries: customDictionariesWorkspace,
};

describe('Validate DictionaryHelper', () => {
    beforeEach(() => {});

    test('DictionaryHelper', () => {
        const client = new CSpellClient(fakeExtensionContext, []);
        const helper = new DictionaryHelper(client);
        expect(helper).toBeDefined();
    });

    test('addWordsToConfigRep/removeWordsFromConfigRep', async () => {
        const uri = getPathToTemp('cspell.json');
        const rw = new MemoryConfigFileReaderWriter(uri, {});
        const rep = createCSpellConfigRepository(rw);
        const client = new CSpellClient(fakeExtensionContext, []);
        const helper = new DictionaryHelper(client);

        await helper.addWordsToConfigRep(['one', 'two'], rep);

        expect(await rep.getValue('words')).toEqual({ words: ['one', 'two'] });

        await helper.removeWordsFromConfigRep(['two'], rep);
        expect(await rep.getValue('words')).toEqual({ words: ['one'] });
    });

    test('addWordToDictionaries/removeWordFromDictionaries', async () => {
        const uri = getPathToTemp('cspell.json');
        const rw = new MemoryConfigFileReaderWriter(uri, {});
        const rep = createCSpellConfigRepository(rw);
        const client = new CSpellClient(fakeExtensionContext, []);
        const helper = new DictionaryHelper(client);
        const dict = createDictionaryTargetForConfigRep(rep);

        await helper.addWordToDictionaries(['one', 'two'], [dict]);

        expect(await rep.getValue('words')).toEqual({ words: ['one', 'two'] });

        await helper.removeWordFromDictionaries(['two'], [dict]);
        expect(await rep.getValue('words')).toEqual({ words: ['one'] });
    });

    test('addWordToDictionaries/removeWordFromDictionaries', async () => {
        const uri = getPathToTemp('cspell.json');
        const target = createClientConfigTargetCSpell(uri, 'unknown');
        const rep = createCSpellConfigRepository(uri);
        const client = new CSpellClient(fakeExtensionContext, []);
        const helper = new DictionaryHelper(client);

        await helper.addWordsToTargets(['one', 'two'], [target], undefined);

        expect(await rep.getValue('words')).toEqual({ words: ['one', 'two'] });

        await helper.removeWordsFromTargets(['two'], [target], undefined);
        expect(await rep.getValue('words')).toEqual({ words: ['one'] });
    });
});

describe('Validate DictionaryHelper methods', () => {
    beforeEach(() => {});

    test('isTextDocument', () => {
        const uri = Uri.file(__filename);
        expect(isTextDocument(uri)).toBe(false);
    });

    test.each`
        cspell                          | expected
        ${{}}                           | ${{ customDictionaries: {} }}
        ${{ customFolderDictionaries }} | ${{ customDictionaries: customDictionariesFolder }}
        ${cfg_1_In}                     | ${cfg_1_out}
    `('combineCustomDictionaries', ({ cspell, expected }) => {
        expect(combineCustomDictionaries(cspell)).toEqual(expected);
    });

    test.each`
        cspell                             | def                          | expected
        ${{}}                              | ${defByName['custom-words']} | ${{ customDictionaries: { 'custom-words': defByName['custom-words'] } }}
        ${{ customFolderDictionaries }}    | ${defByName['custom-words']} | ${{ customDictionaries: { ...customDictionariesFolder, 'custom-words': defByName['custom-words'] } }}
        ${{ customWorkspaceDictionaries }} | ${defByName['custom-words']} | ${{ customDictionaries: { ...customDictionariesWorkspace, 'custom-words': defByName['custom-words'] } }}
    `('addCustomDictionaryToConfig vscode', async ({ cspell, def, expected }) => {
        const uri = getPathToTemp('cspell.json');
        const rw = new MemoryConfigVSReaderWriter(ConfigurationTarget.Workspace, uri, cspell);
        const rep = createVSCodeConfigRepository(rw);
        await addCustomDictionaryToConfig(rep, def);
        expect(rw.data).toEqual(expected);
    });

    test.each`
        cspell                                                               | def                          | expected
        ${{}}                                                                | ${defByName['custom-words']} | ${{ dictionaries: ['custom-words'], dictionaryDefinitions: [defByName['custom-words']] }}
        ${{ dictionaryDefinitions: [] }}                                     | ${defByName['custom-words']} | ${{ dictionaries: ['custom-words'], dictionaryDefinitions: [defByName['custom-words']] }}
        ${{ dictionaryDefinitions: [cd('terms')], dictionaries: ['terms'] }} | ${defByName['custom-words']} | ${{ dictionaries: ['terms', 'custom-words'], dictionaryDefinitions: [cd('terms'), defByName['custom-words']] }}
    `('addCustomDictionaryToConfig cspell', async ({ cspell, def, expected }) => {
        const uri = getPathToTemp('cspell.json');
        const rw = new MemoryConfigFileReaderWriter(uri, cspell);
        const rep = createCSpellConfigRepository(rw);
        await addCustomDictionaryToConfig(rep, def);
        expect(rw.data).toEqual(expected);
    });

    test('calcDictInfoForConfigRep vscode workspace', () => {
        const info = mockWorkspace(['packages/pkg-a', 'packages/pkg-b', 'packages/pkg-c']);
        const scope = info.workspaceFolders[0];
        jest.mocked(workspace.getWorkspaceFolder).mockReturnValue(scope);
        const rw = new MemoryConfigVSReaderWriter(ConfigurationTarget.Workspace, undefined, {});
        const rep = createVSCodeConfigRepository(rw);
        expect(calcDictInfoForConfigRep(rep)).toEqual({
            name: 'custom-dictionary-workspace',
            relPath: '${workspaceFolder:pkg-a}/.cspell/custom-dictionary-workspace.txt',
            scope: 'workspace',
            uri: ocUri(Uri.joinPath(scope.uri, '.cspell/custom-dictionary-workspace.txt')),
        });
    });

    test('calcDictInfoForConfigRep vscode folder', () => {
        const info = mockWorkspace(['packages/pkg-a', 'packages/pkg-b', 'packages/pkg-c']);
        const scope = info.workspaceFolders[1];
        jest.mocked(workspace.getWorkspaceFolder).mockReturnValue(scope);
        const rw = new MemoryConfigVSReaderWriter(ConfigurationTarget.WorkspaceFolder, scope, {});
        const rep = createVSCodeConfigRepository(rw);
        const folderName = 'pkg-b';
        const name = `custom-dictionary-folder-${folderName}`;
        expect(calcDictInfoForConfigRep(rep)).toEqual({
            name,
            relPath: `\${workspaceFolder:${folderName}}/.cspell/${name}.txt`,
            scope: 'folder',
            uri: ocUri(Uri.joinPath(scope.uri, `.cspell/${name}.txt`)),
        });
    });

    test('calcDictInfoForConfigRep vscode folder uri', () => {
        const info = mockWorkspace(['packages/pkg-a', 'packages/pkg-b', 'packages/pkg-c']);
        const scope = info.workspaceFolders[2];
        jest.mocked(workspace.getWorkspaceFolder).mockReturnValue(scope);
        const uri = Uri.joinPath(scope.uri, 'package.json');
        const rw = new MemoryConfigVSReaderWriter(ConfigurationTarget.WorkspaceFolder, uri, {});
        const rep = createVSCodeConfigRepository(rw);
        const folderName = 'pkg-c';
        const name = `custom-dictionary-folder-${folderName}`;
        expect(calcDictInfoForConfigRep(rep)).toEqual({
            name,
            relPath: `\${workspaceFolder:${folderName}}/.cspell/${name}.txt`,
            scope: 'folder',
            uri: ocUri(Uri.joinPath(scope.uri, `.cspell/${name}.txt`)),
        });
    });

    test('calcDictInfoForConfigRep vscode user', () => {
        const info = mockWorkspace(['packages/pkg-a', 'packages/pkg-b', 'packages/pkg-c']);
        const scope = info.workspaceFolders[0];
        jest.mocked(workspace.getWorkspaceFolder).mockReturnValue(scope);
        const rw = new MemoryConfigVSReaderWriter(ConfigurationTarget.Global, scope, {});
        const rep = createVSCodeConfigRepository(rw);
        expect(calcDictInfoForConfigRep(rep)).toEqual({
            name: 'custom-dictionary-user',
            relPath: '~/.cspell/custom-dictionary-user.txt',
            scope: 'user',
            uri: ocUri(Uri.joinPath(Uri.file(homedir()), '.cspell/custom-dictionary-user.txt')),
        });
    });

    test('calcDictInfoForConfigRep cspell', () => {
        const uri = getPathToTemp('cspell.json');
        const rw = new MemoryConfigFileReaderWriter(uri, {});
        const rep = createCSpellConfigRepository(rw);
        expect(calcDictInfoForConfigRep(rep)).toEqual({
            name: 'custom-dictionary',
            relPath: './.cspell/custom-dictionary.txt',
            scope: undefined,
            uri: ocUri(getPathToTemp('.cspell/custom-dictionary.txt')),
        });
    });

    test('createCustomDictionaryForConfigRep', async () => {
        const uri = getPathToTemp('cspell.json');
        const rw = createConfigFileReaderWriter(uri);
        await rw.write({});
        const rep = createCSpellConfigRepository(rw);

        const r = await createCustomDictionaryForConfigRep(rep);
        expect(r).toEqual({
            name: 'custom-dictionary',
            relPath: './.cspell/custom-dictionary.txt',
            scope: undefined,
            uri: ocUri(getPathToTemp('.cspell/custom-dictionary.txt')),
        });
    });

    test('createCustomDictionary', async () => {
        const uri = getPathToTemp('cspell.json');
        const rw = createConfigFileReaderWriter(uri);
        await rw.write({});
        const rep = createCSpellConfigRepository(rw);
        const dh = new DictionaryHelper(client());
        await dh.createCustomDictionary(rep);
        const data = await rw.read(['dictionaries', 'dictionaryDefinitions']);
        expect(data).toEqual({
            dictionaries: ['custom-dictionary'],
            dictionaryDefinitions: [
                {
                    addWords: true,
                    name: 'custom-dictionary',
                    path: './.cspell/custom-dictionary.txt',
                },
            ],
        });
    });
});

function client(): CSpellClient {
    return new CSpellClient(fakeExtensionContext, []);
}

function cd(name: string, addWords?: boolean, scope?: DictionaryDefinitionCustom['scope']): DictionaryDefinitionCustom {
    return {
        name,
        path: `path/${name}.txt`,
        addWords: addWords ?? true,
        scope,
    };
}

function oc<T>(t: Partial<T>): T {
    return expect.objectContaining(t);
}

function ocUri(uri: Uri): Uri {
    return oc<Uri>({
        scheme: uri.scheme,
        path: uri.path,
        fragment: uri.fragment,
        query: uri.query,
    });
}

function mockWorkspace(workspaceFolders: string[]) {
    const workspaceFolderUris = workspaceFolders.map((s) => getPathToTemp(s));
    const info = workspaceInfo(workspaceFolderUris);
    jest.spyOn(workspace, 'workspaceFile', 'get').mockReturnValue(info.workspaceFile);
    jest.spyOn(workspace, 'workspaceFolders', 'get').mockReturnValue(info.workspaceFolders);
    return info;
}

type WorkspaceInfoBase = Required<Pick<typeof workspace, 'workspaceFile' | 'workspaceFolders'>>;

type WorkspaceInfo = {
    [K in keyof WorkspaceInfoBase]: Exclude<WorkspaceInfoBase[K], undefined>;
};

function workspaceInfo(workspaceFolderUris: Uri[]): WorkspaceInfo {
    const workspaceFolders: WorkspaceFolder[] = workspaceFolderUris.map(wf);

    return {
        workspaceFile: getPathToTemp('workspace.code-workspace'),
        workspaceFolders,
    };
}

function wf(uri: Uri, index: number): WorkspaceFolder {
    return {
        uri,
        name: UriUtils.basename(uri),
        index,
    };
}
