import type { Uri } from 'vscode';
import { FileSystemError, workspace } from 'vscode';

export async function fileExists(file: Uri): Promise<boolean> {
    try {
        const result = await workspace.fs.stat(file);
        return !!result.type;
    } catch (e) {
        if (!(e instanceof FileSystemError)) throw e;
        return false;
    }
}
