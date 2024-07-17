import { pathToFileURL } from 'node:url';

import { isUrlLike as _isUrlLike } from 'cspell-io';
import { URI as Uri } from 'vscode-uri';

import { stat } from '../vfs/vfs.mjs';

export async function filterUrl(uri: Uri | string | URL): Promise<Uri | undefined> {
    const url = uriToUrl(uri);
    try {
        const stats = await stat(url);
        const found = stats.isFile() ? Uri.parse(url.href) : undefined;
        return found;
    } catch {
        return undefined;
    }
}

const regExpIsUriLike = /^[a-z][\w-]+:/;

export function isUriLike(uri: string | URL | Uri): boolean {
    if (typeof uri !== 'string') return true;
    return _isUrlLike(uri) || regExpIsUriLike.test(uri);
}

export const isUrlLike = isUriLike;

/**
 * See if it is possible to join the rel to the base.
 * This helps detect `untitled:untitled-1` uri's that are not valid.
 * @param rel - relative path
 * @param base - base URL
 * @returns the joined path or undefined if it is not possible.
 */
export function tryJoinURL(rel: string, base: URL | string): URL | undefined {
    try {
        return new URL(rel, base);
    } catch {
        return undefined;
    }
}

export function toDirURL(url: string | URL | Uri): URL {
    url = uriToUrl(url);
    if (url.pathname.endsWith('/')) {
        return url;
    }
    url = url.href;
    url = new URL(url);
    if (!url.pathname.endsWith('/')) {
        url.pathname += '/';
    }
    return url;
}

export function uriToGlobPath(uri: string | URL | Uri): string {
    if (typeof uri === 'string' && !isUriLike(uri)) {
        // console.log(`uriToGlobPath: uri is not a URL: %s`, uri);
        return uri;
    }
    const url = uriToUrl(uri);
    // console.log('uriToGlobPath:\n\t%s ->\n\t%s', uri.toString(), url.href);
    return url.href;
}

export function uriToGlobRoot(uri: string | URL | Uri): string {
    const url = toDirURL(uriToUrl(uri));
    // console.log('uriToGlobRoot:\n\t%s ->\n\t%s', uri.toString(), url.href);
    return url.href;
}

export function uriToUrl(uri: string | URL | Uri): URL {
    if (uri instanceof URL) return uri;
    uri = typeof uri === 'string' && !isUriLike(uri) ? pathToFileURL(uri) : uri;
    const href = typeof uri === 'string' ? uri : uri.toString();
    const [front, pHash] = href.split('#');
    const hash = pHash ? `#` + pHash : '';
    let [path, query] = front.split('?');
    query = query ? `?` + query : '';
    // Clean up windows paths.
    path = path.replace(/\/([A-Z])%3A\//i, (_, a) => `/${a.toLowerCase()}:/`).replace(/\/[a-z]:\//i, (a) => a.toLowerCase());
    const url = path + query + hash;
    return new URL(url);
}
