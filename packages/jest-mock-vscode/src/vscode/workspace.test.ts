import { workspace } from './workspace';
import { Uri } from './uri';
import type { WorkspaceFolder } from 'vscode';

describe('workspace', () => {
    test('workspace', () => {
        expect(workspace.fs).toBeDefined();
        expect(workspace.getWorkspaceFolder).toBeDefined();
        expect(workspace.getWorkspaceFolder(Uri.file(__filename))).toBe(undefined);
        expect(workspace.workspaceFile).toBe(undefined);
        expect(workspace.name).toBe('mock-workspace');
        expect(workspace.workspaceFolders).toBe(undefined);
        expect(workspace.getConfiguration()).toBeDefined();
    });

    test('getWorkspaceFolder', () => {
        const rootUri = Uri.file(__dirname);
        const folders: WorkspaceFolder[] = [
            {
                uri: Uri.joinPath(rootUri, 'Folder1'),
                name: 'Folder1',
                index: 0,
            },
            {
                uri: Uri.joinPath(rootUri, 'Folder2'),
                name: 'Folder2',
                index: 1,
            },
            {
                uri: Uri.joinPath(rootUri, 'Folder1/NestedFolder'),
                name: 'NestedFolder',
                index: 2,
            },
        ];

        expect(workspace.workspaceFolders).toBeUndefined();
        workspace.setWorkspaceFolders([]);
        expect(workspace.workspaceFolders).toEqual([]);
        workspace.setWorkspaceFolders(folders);
        expect(workspace.getWorkspaceFolder(Uri.joinPath(rootUri, 'Folder1/README.md'))).toBe(folders[0]);
        expect(workspace.getWorkspaceFolder(Uri.joinPath(rootUri, 'Folder1/NestedFolder/README.md'))).toBe(folders[2]);
        expect(workspace.getWorkspaceFolder(rootUri)).toBeUndefined();
    });
});
