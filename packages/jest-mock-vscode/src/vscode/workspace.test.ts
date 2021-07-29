import { workspace } from './workspace';

describe('workspace', () => {
    test('workspace', () => {
        expect(workspace.fs).toBeDefined();
        expect(workspace.getWorkspaceFolder).toBeDefined();
        expect(workspace.getWorkspaceFolder()).toBe(undefined);
        expect(workspace.workspaceFile).toBe(undefined);
        expect(workspace.name).toBe('mock-workspace');
        expect(workspace.workspaceFolders).toBe(undefined);
        expect(workspace.getConfiguration()).toBeDefined();
    });
});
