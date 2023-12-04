import { createMockWorkspaceConfiguration } from 'jest-mock-vscode';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { when } from 'vitest-when';
import type { WorkspaceFolder } from 'vscode';
import { ConfigurationTarget, Uri, workspace } from 'vscode';

import { getPathToTemp } from '../test/helpers.js';
import { __testing__, createCSpellConfigRepository, createVSCodeConfigRepository } from './configRepository.js';
import { addWordsFn } from './configUpdaters.js';
import { MemoryConfigFileReaderWriter, MemoryConfigVSReaderWriter } from './test/memoryReaderWriter.js';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

const { isUri, hasUri, isWorkspaceFolder } = __testing__;

const uri = Uri.file(__filename);
const folderUri = Uri.file(__dirname);
const workspaceFolder: WorkspaceFolder = {
    uri: folderUri,
    name: 'Folder',
    index: 0,
};

const workspaceFolderWorkspace: WorkspaceFolder = {
    uri: folderUri,
    name: 'Workspace',
    index: 0,
};
const mockedWorkspace = vi.mocked(workspace);

describe('configRepository', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    test('CSpellConfigRepository', async () => {
        const uri = getPathToTemp('cspell.json');
        const rep = createCSpellConfigRepository(uri);
        const rw = rep.configRW;

        await rep.setValue('words', ['one', 'two', 'three']);
        const data1 = await rw.read(['words']);
        expect(data1.words).toEqual(['one', 'two', 'three']);
        await rep.updateValue('words', addWordsFn(['four']));
        const data2 = await rw.read(['words']);
        expect(data2.words).toEqual(['one', 'two', 'three', 'four'].sort());
    });

    test('CSpellConfigRepository Memory', async () => {
        const uri = getPathToTemp('cspell.json');
        const rw = new MemoryConfigFileReaderWriter(uri, {});
        const __mockConfig = createMockWorkspaceConfiguration(vi);
        const mockedGetConfig = vi.mocked(workspace.getConfiguration);
        mockedGetConfig.mockImplementation(__mockConfig.__getConfiguration.bind(__mockConfig));
        const rep = createCSpellConfigRepository(rw);

        await rep.setValue('words', ['one', 'two', 'three']);
        const data1 = await rw.read(['words']);
        expect(data1.words).toEqual(['one', 'two', 'three']);
        await rep.updateValue('words', addWordsFn(['four']));
        const data2 = await rw.read(['words']);
        expect(data2.words).toEqual(['one', 'two', 'three', 'four'].sort());
    });

    test('VSCodeConfigRepository Memory', async () => {
        const rw = new MemoryConfigVSReaderWriter(ConfigurationTarget.Workspace, uri, {});
        const rep = createVSCodeConfigRepository(rw);

        expect(rep.name).toBe('workspace');

        await rep.setValue('words', ['one', 'two', 'three']);
        const data1 = await rw.read(['words']);
        expect(data1.words).toEqual(['one', 'two', 'three']);
        await rep.updateValue('words', addWordsFn(['four']));
        const data2 = await rw.read(['words']);
        expect(data2.words).toEqual(['one', 'two', 'three', 'four'].sort());
    });

    test('VSCodeConfigRepository Memory Global userWords', async () => {
        // cspell:ignore hmmm
        const rw = new MemoryConfigVSReaderWriter(ConfigurationTarget.Global, uri, {
            words: ['hmmm'],
            userWords: ['user'],
        });
        const rep = createVSCodeConfigRepository(rw);

        expect(rep.name).toBe('user');

        await rep.updateValue('words', addWordsFn(['four']));
        const data0 = await rw.read(['words', 'userWords']);
        expect(data0.userWords).toEqual(['four', 'hmmm', 'user']);
        expect(data0.words).toBeUndefined();

        await rep.setValue('words', ['one', 'two', 'three']);
        const data1 = await rw.read(['words', 'userWords']);
        expect(data1.userWords).toEqual(['one', 'two', 'three']);
        expect(data1.words).toBeUndefined();
        await rep.updateValue('words', addWordsFn(['four']));
        const data2 = await rw.read(['words', 'userWords']);
        expect(data2.userWords).toEqual(['one', 'two', 'three', 'four'].sort());
        expect(data2.words).toBeUndefined();
    });

    test.each`
        target                                 | scope                          | expected
        ${ConfigurationTarget.WorkspaceFolder} | ${undefined}                   | ${undefined}
        ${ConfigurationTarget.WorkspaceFolder} | ${{ languageId: 'cpp ' }}      | ${workspaceFolderWorkspace}
        ${ConfigurationTarget.WorkspaceFolder} | ${{ uri, languageId: 'cpp ' }} | ${workspaceFolder}
        ${ConfigurationTarget.WorkspaceFolder} | ${uri}                         | ${workspaceFolder}
        ${ConfigurationTarget.WorkspaceFolder} | ${workspaceFolder}             | ${workspaceFolder}
        ${ConfigurationTarget.Workspace}       | ${uri}                         | ${workspaceFolderWorkspace}
        ${ConfigurationTarget.Global}          | ${uri}                         | ${undefined}
    `('getWorkspaceFolder $target $scope', ({ target, scope, expected }) => {
        const rw = new MemoryConfigVSReaderWriter(target, scope, {});
        const rep = createVSCodeConfigRepository(rw);

        when(mockedWorkspace.getWorkspaceFolder).calledWith(expect.objectContaining(uri)).thenReturn(workspaceFolder);
        const spy = vi.spyOn(workspace, 'workspaceFolders', 'get');
        spy.mockReturnValue([workspaceFolderWorkspace, workspaceFolder]);

        expect(rep.getWorkspaceFolder()).toEqual(expected);
    });

    test.each`
        u            | expected
        ${'hello'}   | ${false}
        ${5}         | ${false}
        ${undefined} | ${false}
        ${{}}        | ${false}
        ${[]}        | ${false}
        ${uri}       | ${true}
    `('isUri $u', ({ u, expected }) => {
        expect(isUri(u)).toBe(expected);
    });

    test.each`
        u                      | expected
        ${'hello'}             | ${false}
        ${5}                   | ${false}
        ${undefined}           | ${false}
        ${{}}                  | ${false}
        ${[]}                  | ${false}
        ${{ uri }}             | ${true}
        ${{ uri: __filename }} | ${false}
    `('hasUri $u', ({ u, expected }) => {
        expect(hasUri(u)).toBe(expected);
    });

    test.each`
        u                                  | expected
        ${'hello'}                         | ${false}
        ${5}                               | ${false}
        ${undefined}                       | ${false}
        ${{}}                              | ${false}
        ${[]}                              | ${false}
        ${{ uri }}                         | ${false}
        ${{ uri, name: '', index: 0 }}     | ${true}
        ${{ uri, name: '', index: '0' }}   | ${false}
        ${{ uri, name: {}, index: 0 }}     | ${false}
        ${{ uri: {}, name: '', index: 0 }} | ${false}
        ${{ uri: __filename }}             | ${false}
    `('isWorkspaceFolder $u', ({ u, expected }) => {
        expect(isWorkspaceFolder(u)).toBe(expected);
    });
});
