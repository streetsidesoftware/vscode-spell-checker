import type { VfsStat } from 'cspell-io';
import { getVirtualFS } from 'cspell-lib';
import type { URI } from 'vscode-uri';

import { toUrl } from '../utils/toUrl.mjs';

export async function stat(urlLike: URL | URI | string): Promise<VfsStat> {
    const url = toUrl(urlLike);
    const vfs = getVirtualFS();
    const fs = vfs.getFS(url);
    const stat = await fs.stat(url);
    return stat;
}

export async function readTextFile(url: URL | URI | string): Promise<string> {
    const _url = toUrl(url);
    const vfs = getVirtualFS();
    const fs = vfs.getFS(_url);
    const f = await fs.readFile(_url);
    return f.getText();
}

export async function isFile(url: URL | URI | string): Promise<boolean> {
    try {
        const statInfo = await stat(url);
        return statInfo.isFile();
    } catch {
        return false;
    }
}

export async function isDir(url: URL | URI | string): Promise<boolean> {
    try {
        const statInfo = await stat(url);
        return statInfo.isDirectory();
    } catch {
        return false;
    }
}

export async function exists(url: URL | URI | string): Promise<boolean> {
    try {
        await stat(url);
        return true;
    } catch {
        return false;
    }
}
