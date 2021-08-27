import { access } from 'fs/promises';
import { URI as Uri } from 'vscode-uri';
import { isErrnoException } from './errors';

export async function fileExists(uri: Uri): Promise<boolean> {
    try {
        await access(uri.fsPath);
        return true;
    } catch (err) {
        if (!isErrnoException(err) || err.code !== 'ENOENT') throw err;
        return false;
    }
}
