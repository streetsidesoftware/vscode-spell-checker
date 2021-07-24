import { Uri } from 'vscode';
import { TargetInfoType } from './DictionaryTargetInfo';
import {
    ConfigurationTarget,
    createTargetForDocument,
    createTargetForUri,
    extractTarget,
    extractTargetUri,
    getSectionName,
    GlobalTarget,
    isFolderLevelTarget,
    isGlobalLevelTarget,
    isGlobalTarget,
    isWorkspaceLevelTarget,
    Scopes,
    toScope,
    WorkspaceTarget,
} from './vsConfig';
import { readTextDocument } from 'jest-mock-vscode';

const uri = Uri.file(__filename);

describe('Validate vsConfig', () => {
    const pDoc = readTextDocument(Uri.file(__filename));

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
        expect(isWorkspaceLevelTarget(TargetInfoType.Workspace)).toBe(true);
    });

    test('isFolderLevelTarget', () => {
        expect(isFolderLevelTarget(GlobalTarget)).toBe(false);
        expect(isFolderLevelTarget(WorkspaceTarget)).toBe(false);
        expect(isFolderLevelTarget(createTargetForUri(WorkspaceTarget, uri))).toBe(false);
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
        target                                   | expected
        ${GlobalTarget}                          | ${true}
        ${WorkspaceTarget}                       | ${false}
        ${createTargetForUri(GlobalTarget, uri)} | ${true}
    `('isGlobalTarget $target', ({ target, expected }) => {
        expect(isGlobalTarget(target)).toBe(expected);
    });
});
