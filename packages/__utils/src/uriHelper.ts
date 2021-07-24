import { URI as Uri, Utils as UriUtils } from 'vscode-uri';

export const supportedSchemes = ['gist', 'file', 'sftp', 'untitled'];
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

const regExpIsUri = /^[\w.-]{2,}:/;

export function toUri(uri: string | Uri): Uri;
export function toUri(uri: string | Uri | undefined): Uri | undefined;
export function toUri(uri: string | Uri | undefined): Uri | undefined {
    if (typeof uri === 'string') {
        return Uri.parse(uri);
    }
    return uri;
}

export function toFileUri(uri: string | Uri): Uri;
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
    const fromSegments = splitUri(uriFrom);
    const toSegments = splitUri(uriTo);
    let i = 0;
    for (i = 0; i < fromSegments.length && i < toSegments.length && fromSegments[i] === toSegments[i]; ++i) {}
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
    return relativeTo(UriUtils.dirname(uriFromFile), uriTo);
}

export function cleanUri(uri: Uri): Uri {
    return uri.with({ fragment: '', query: '' });
}

/**
 * Try to make a friendly name out of a Uri
 * @param uri - uri of file
 */
export function uriToName(uri: Uri, segments = 2): string {
    const parts = splitUri(uri).slice(-segments);
    return parts.join('/');
}

function splitUri(uri: Uri) {
    return cleanUri(uri)
        .toString()
        .split('/')
        .filter((a) => !!a);
}
