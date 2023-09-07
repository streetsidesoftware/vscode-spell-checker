import { access } from 'fs/promises';
import type { URI as Uri } from 'vscode-uri';

import { isErrnoException } from './errors';

const FileNotFoundErrorCodes: Record<string, undefined | true> = {
    FileNotFound: true,
    EntryNotFound: true,
    ENOENT: true,
    ENOTFOUND: true,
};

export async function fileExists(uri: Uri): Promise<boolean> {
    try {
        await access(uri.fsPath);
        return true;
    } catch (err) {
        if (!isErrnoException(err) || !err.code || !(err.code in FileNotFoundErrorCodes)) throw err;
        return false;
    }
}
