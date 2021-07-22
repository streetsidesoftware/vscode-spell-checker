import { URI as Uri } from 'vscode-uri';
import { access } from 'fs/promises';

export async function fileExists(uri: Uri): Promise<boolean> {
    try {
        await access(uri.fsPath);
        return true;
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        return false;
    }
}
