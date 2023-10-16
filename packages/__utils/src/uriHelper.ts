import { URI as Uri, Utils as UriUtils } from 'vscode-uri';

export const supportedSchemes = ['file', 'gist', 'repo', 'sftp', 'untitled', 'vscode-notebook-cell', 'vscode-scm', 'vscode-userdata'];
export const setOfSupportedSchemes = new Set(supportedSchemes);

export function isSupportedUri(uri?: Uri): boolean {
    return !!uri && setOfSupportedSchemes.has(uri.scheme);
}

interface TextDocumentLike {
    isClosed: boolean;
    uri: Uri;
}

export function isSupportedDoc(doc?: TextDocumentLike): boolean {
    return !!doc && !doc.isClosed && isSupportedUri(doc.uri);
}

const regExpIsUri = /^[\w._-]{2,}:/;

export function toUri(uri: string | Uri): Uri;
export function toUri(uri: undefined | null): undefined;
export function toUri(uri: string | Uri | undefined | null): Uri | undefined;
export function toUri(uri: string | Uri | undefined | null): Uri | undefined {
    return toFileUri(uri || undefined);
}

export function toFileUri(uri: string | Uri): Uri;
export function toFileUri(uri: undefined): undefined;
export function toFileUri(uri: string | Uri | undefined): Uri | undefined;
export function toFileUri(uri: string | Uri | undefined): Uri | undefined {
    if (typeof uri === 'string') {
        return regExpIsUri.test(uri) ? Uri.parse(uri) : Uri.file(uri);
    }
    return uri;
}

/**
 * Generate a relative path that will get from `uriFrom` to `uriTo`
 * Expected:
 * `uriFrom.joinPath(relativePath(uriFrom, uriTo)).toString() === uriTo().toString()`
 * @param uriFrom
 * @param uriTo
 */
export function relativeTo(uriFrom: Uri, uriTo: Uri): string {
    if (uriFrom.scheme !== uriTo.scheme) return cleanUri(uriTo).toString();
    const fromSegments = splitUri(uriFrom);
    const toSegments = splitUri(uriTo);
    let i = 0;
    for (i = 0; i < fromSegments.length && i < toSegments.length; ++i) {
        const a = fromSegments[i];
        const b = toSegments[i];
        if (a === b) continue;
        const a1 = decodeURIComponent(a).toLowerCase();
        const b1 = decodeURIComponent(b).toLowerCase();

        if (a1.endsWith(':') && a1 == b1 && a1.length == 2) continue;
        break;
    }
    const prefix = '../'.repeat(fromSegments.length - i);
    return (prefix + toSegments.slice(i).join('/')).replace(/\/$/, '');
}

/**
 * Generate a relative path from one file to another.
 * @param uriFromFile - uri of from file.
 * @param uriTo - uri of destination.
 * @returns
 */
export function relativeToFile(uriFromFile: Uri, uriTo: Uri): string {
    return relativeTo(uriFromFile.path.endsWith('/') ? uriFromFile : UriUtils.dirname(uriFromFile), uriTo);
}

export function cleanUri(uri: Uri): Uri {
    return uri.with({ fragment: '', query: '' });
}

export interface UriToNameOptions {
    segments?: number;
    relativeTo?: Uri | string;
}

/**
 * Try to make a friendly name out of a Uri
 * @param uri - uri of file
 */
export function uriToName(uri: Uri, options: UriToNameOptions = {}): string {
    const { segments = 2, relativeTo: relTo } = options;
    if (relTo) {
        const rel = relativeTo(toUri(relTo), uri);
        if (!regExpIsUri.test(rel)) {
            return rel.split('/').slice(-segments).join('/');
        }
    }
    const parts = splitUri(uri).slice(-segments);
    return parts.join('/');
}

function splitUri(uri: Uri) {
    return cleanUri(uri)
        .toString()
        .split('/')
        .filter((a) => !!a);
}
