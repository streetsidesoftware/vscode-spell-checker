import { Logger } from './logger';

export { LogLevel } from './logger';

let workspaceBase = '';
let workspaceFolders: string[] = [];

export const logger = new Logger();
export function log(msg: string, uri?: string | string[]) {
    logger.log(formatMessage(msg, uri));
}

export function logError(msg: string, uri?: string | string[]) {
    logger.error(formatMessage(msg, uri));
}

export function logInfo(msg: string, uri?: string | string[]) {
    logger.info(formatMessage(msg, uri));
}

export function setWorkspaceBase(uri: string) {
    log(`setWorkspaceBase URI: ${uri}`);
    workspaceBase = uri;
    log(`setWorkspaceBase: ${workspaceBase}`);
}

export function setWorkspaceFolders(folders: string[]) {
    log(`setWorkspaceFolders folders URI: [${folders.join('\n')}]`);
    workspaceFolders = folders;
    setWorkspaceBase(findCommonBasis(workspaceFolders));
}

function formatMessage(msg: string, uri?: string | string[]) {
    const uris = Array.isArray(uri) ? uri : [uri];
    return msg + '\t' + uris.map(normalizeUri).join('\n\t\t\t');
}

function normalizeUri(uri?: string) {
    if (!uri) {
        return '';
    }
    const base = findCommonBase(uri, workspaceBase);
    return base ? uri.replace(base, '...') : uri;
}

function findCommonBasis(folders: string[]): string {
    return folders.reduce((a, b) => findCommonBase(a || b, b), '');
}

function findCommonBase(a: string, b: string): string {
    const limit = matchingUriLength(a, b);
    return a.slice(0, limit);
}

function matchingUriLength(a: string, b: string): number {
    const sep = '/';
    const aParts = a.split(sep);
    const bParts = b.split(sep);
    const limit = Math.min(aParts.length, bParts.length);
    let i = 0;
    for (i = 0; i < limit && aParts[i] === bParts[i]; i += 1) {}
    return aParts.slice(0, i).join(sep).length;
}
