import { Logger } from './logger';

export { LogLevel } from './logger';
import Uri from 'vscode-uri';

let workspaceBase = '';
let workspaceFolders: string[] = [];

export const logger = new Logger();
export function log(msg: string, uri?: string | string[]) {
    logger.log(formatMessage(msg, uri));
}

export function logError(msg: string, uri?: string | string[]) {
    logger.error(formatMessage(msg, uri));
}

export function setWorkspaceBase(uri: string) {
    workspaceBase = Uri.parse(uri).fsPath;
    log(`setWorkspaceBase: ${workspaceBase}`);
}

export function setWorkspaceFolders(folders: string[]) {
    workspaceFolders = folders.map(folder => Uri.parse(folder).fsPath);
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
    uri = Uri.parse(uri).fsPath;
    const base = findCommonBase(uri, workspaceBase);
    return uri.replace(base, '...');
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
