import { createMockWorkspaceConfiguration, readTextDocument, MockWorkspaceConfigurationData } from 'jest-mock-vscode';
import rfdc from 'rfdc';
import { ConfigurationScope, Uri, workspace, WorkspaceConfiguration } from 'vscode';
import { CSpellUserSettings } from '../client';
import {
    ConfigurationTarget,
    createTargetForDocument,
    createTargetForUri,
    extractTarget,
    extractTargetUri,
    getSectionName,
    GlobalTarget,
    inspectConfigKeys,
    isFolderLevelTarget,
    isGlobalLevelTarget,
    isGlobalTarget,
    isWorkspaceLevelTarget,
    Scopes,
    toScope,
    __testing__,
} from './vsConfig';

const clone = rfdc();
const { mergeInspect } = __testing__;

const uri = Uri.file(__filename);

const mockedWorkspace = jest.mocked(workspace, true);

const baseConfig: MockWorkspaceConfigurationData<{ cSpell: CSpellUserSettings }> = {
    '[*]': {
        defaultValue: {
            cSpell: {
                version: '0.2',
            },
        },
        globalValue: {
            cSpell: {
                userWords: ['cspell'],
                customDictionaries: {
                    'user-words': {
                        name: 'user-words',
                        path: '~/user-words',
                        addWords: true,
                    },
                },
            },
        },
        workspaceValue: {
            cSpell: {
                words: ['one', 'two'],
                ignorePaths: ['node_modules', '*.dat'],
                dictionaries: ['cpp', 'html'],
                customDictionaries: {
                    'workspace-words': {
                        name: 'workspace-words',
                        path: '~/workspace-words',
                        addWords: true,
                    },
                },
            },
        },
        workspaceFolderValue: {
            cSpell: {
                words: ['three'],
                ignorePaths: ['node_modules', 'dist', 'coverage'],
                dictionaries: [],
                customDictionaries: {
                    'folder-words': {
                        name: 'folder-words',
                        path: '~/folder-words',
                        addWords: true,
                    },
                },
            },
        },
    },
    '[cpp]': {
        workspaceValue: {
            cSpell: {
                customDictionaries: {
                    'workspace-words-cpp': {
                        path: '~/workspace-words',
                        addWords: true,
                    },
                },
            },
        },
    },
};

const WorkspaceTarget = createTargetForUri(ConfigurationTarget.Workspace, uri);

describe('Validate vsConfig', () => {
    const pDoc = readTextDocument(Uri.file(__filename));

    beforeEach(() => {
        mockedWorkspace.getConfiguration.mockClear();
    });

    test('getSectionName', () => {
        expect(getSectionName('words')).toBe('cSpell.words');
    });

    test('toScope', () => {
        expect(toScope(GlobalTarget)).toEqual(Scopes.Global);
    });

    test('isGlobalLevelTarget', () => {
        expect(isGlobalLevelTarget(GlobalTarget)).toBe(true);
        expect(isGlobalLevelTarget(WorkspaceTarget)).toBe(false);
    });

    test('isWorkspaceLevelTarget', () => {
        expect(isWorkspaceLevelTarget(GlobalTarget)).toBe(false);
        expect(isWorkspaceLevelTarget(WorkspaceTarget)).toBe(true);
    });

    test('isFolderLevelTarget', () => {
        expect(isFolderLevelTarget(GlobalTarget)).toBe(false);
        expect(isFolderLevelTarget(WorkspaceTarget)).toBe(false);
        expect(isFolderLevelTarget(createTargetForUri(ConfigurationTarget.Workspace, uri))).toBe(false);
        expect(isFolderLevelTarget(createTargetForUri(ConfigurationTarget.WorkspaceFolder, uri))).toBe(true);
    });

    test('createTargetForDocument', async () => {
        const doc = await pDoc;
        const target = ConfigurationTarget.WorkspaceFolder;
        expect(createTargetForDocument(target, doc)).toEqual(createTargetForUri(target, doc.uri));
    });

    test('extractTarget', async () => {
        const doc = await pDoc;
        const target = ConfigurationTarget.WorkspaceFolder;
        expect(extractTarget(createTargetForUri(target, doc.uri))).toEqual(target);
    });

    test('extractTargetUri', async () => {
        const doc = await pDoc;
        const target = ConfigurationTarget.WorkspaceFolder;
        expect(extractTargetUri(createTargetForUri(target, doc.uri))).toEqual(doc.uri);
    });

    test.each`
        target                                                    | expected
        ${GlobalTarget}                                           | ${true}
        ${createTargetForUri(ConfigurationTarget.Workspace, uri)} | ${false}
        ${createTargetForUri(GlobalTarget, uri)}                  | ${true}
    `('isGlobalTarget $target', ({ target, expected }) => {
        expect(isGlobalTarget(target)).toBe(expected);
    });

    test('inspectConfigKeys', async () => {
        const wsConfig = workspace.getConfiguration(undefined, { languageId: 'cpp' });
        await applySampleConfig(wsConfig);
        const r = inspectConfigKeys(Uri.file(__filename), ['words', 'ignorePaths', 'userWords']);
        expect(r).toEqual({
            words: {
                key: 'cSpell.words',
                workspaceValue: ['one', 'two'],
                workspaceFolderValue: ['three'],
            },
            ignorePaths: {
                key: 'cSpell.ignorePaths',
                workspaceValue: ['node_modules', '*.dat'],
                workspaceFolderValue: ['node_modules', 'dist', 'coverage'],
            },
            userWords: {
                key: 'cSpell.userWords',
                globalValue: ['cspell'],
            },
        });
    });

    test.each`
        section                        | target                                 | expected
        ${'cSpell.words'}              | ${ConfigurationTarget.Global}          | ${undefined}
        ${'cSpell.words'}              | ${ConfigurationTarget.Workspace}       | ${['one', 'two']}
        ${'cSpell.words'}              | ${ConfigurationTarget.WorkspaceFolder} | ${['three']}
        ${'cSpell.userWords'}          | ${ConfigurationTarget.Global}          | ${['cspell']}
        ${'cSpell.userWords'}          | ${ConfigurationTarget.Workspace}       | ${['cspell']}
        ${'cSpell.userWords'}          | ${ConfigurationTarget.WorkspaceFolder} | ${['cspell']}
        ${'cSpell.version'}            | ${ConfigurationTarget.Global}          | ${'0.2'}
        ${'cSpell.version'}            | ${ConfigurationTarget.Workspace}       | ${'0.2'}
        ${'cSpell.version'}            | ${ConfigurationTarget.WorkspaceFolder} | ${'0.2'}
        ${'cSpell.customDictionaries'} | ${ConfigurationTarget.Global}          | ${baseConfig['[*]'].globalValue?.cSpell.customDictionaries}
    `('mergeInspect $section $target', async ({ section, target, expected }) => {
        const config = sampleConfig();
        const values = config.inspect(section);
        expect(mergeInspect(target, values)).toEqual(expected);
    });
});

type UpdateParams = Parameters<WorkspaceConfiguration['update']>;

function applyToConfig(config: WorkspaceConfiguration, updates: UpdateParams[]) {
    return Promise.all(updates.map((params) => config.update(...params)));
}

async function applySampleConfig(config: WorkspaceConfiguration) {
    const cfg = clone(baseConfig);
    return applyToConfig(config, [
        ['cSpell', cfg['[*]'].globalValue?.cSpell, ConfigurationTarget.Global],
        ['cSpell', cfg['[*]'].workspaceFolderValue?.cSpell, ConfigurationTarget.WorkspaceFolder],
        ['cSpell', cfg['[*]'].workspaceValue?.cSpell, ConfigurationTarget.Workspace],
        ['cSpell', cfg['[cpp]'].globalValue?.cSpell, ConfigurationTarget.Global, true],
        ['cSpell', cfg['[cpp]'].workspaceFolderValue?.cSpell, ConfigurationTarget.WorkspaceFolder, true],
        ['cSpell', cfg['[cpp]'].workspaceValue?.cSpell, ConfigurationTarget.Workspace, true],
    ]);
}

function sampleConfig(key?: string, scope?: ConfigurationScope | null) {
    const config = createMockWorkspaceConfiguration(clone(baseConfig), key, scope);
    return config;
}
