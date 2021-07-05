import { Uri } from 'vscode';
import { access } from 'fs/promises';

export async function fileExits(uri: Uri): Promise<boolean> {
    try {
        await access(uri.fsPath);
        return true;
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        return false;
    }
}
