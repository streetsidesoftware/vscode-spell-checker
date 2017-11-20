import { Logger } from './logger';

export { LogLevel } from './logger';
import Uri from 'vscode-uri';

let workspaceBase = '';
let workspaceFolders: string[] = [];

export const logger = new Logger();
export function log(msg: string, uri?: string) {
    if (uri) {
        msg += '\t' + normalizeUri(uri);
    }
    logger.log(msg);
}

export function logError(msg: string, uri?: string) {
    if (uri) {
        msg += '\t' + normalizeUri(uri);
    }
    logger.error(msg);
}

export function setWorkspaceBase(uri: string) {
    workspaceBase = Uri.parse(uri).fsPath;
    log(`setWorkspaceBase: ${workspaceBase}`);
}

export function setWorkspaceFolders(folders: string[]) {
    workspaceFolders = folders.map(folder => Uri.parse(folder).fsPath);
    setWorkspaceBase(findCommonBasis(workspaceFolders));
}

function normalizeUri(uri: string) {
    uri = Uri.parse(uri).fsPath;
    const base = findCommonBase(uri, workspaceBase);
    return uri.replace(base, '...');
}

function findCommonBasis(folders: string[]): string {
    return folders.reduce((a, b) => findCommonBase(a || b, b), '');
}

function findCommonBase(a: string, b: string): string {
    const limit = matchingLength(a, b);
    return a.slice(0, limit);
}

function matchingLength(a: string, b: string): number {
    const limit = Math.min(a.length, b.length);
    for (let i = 0; i < limit; i += 1) {
        if (a[i] !== b[i]) {
            return i;
        }
    }
    return limit;
}
