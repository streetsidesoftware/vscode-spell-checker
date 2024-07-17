import { fileURLToPath, pathToFileURL } from 'node:url';

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

/**
 * Try to extract a file path from a URL.
 * If the URL is not a file URL, then the pathname is returned.
 * @param url - url
 * @returns path
 */
export function urlToFilepath(url: string | URL | Uri): string {
    const u = uriToUrl(url);
    return u.protocol === 'file:' ? normalizeWindowsRoot(fileURLToPath(u)) : u.pathname;
}

/**
 * Try to extract a file path from a URL.
 * If the URL is not a file URL, then the href is returned.
 * @param url - url
 * @returns path or href
 */
export function urlToFilePathOrHref(url: string | URL | Uri): string {
    const u = uriToUrl(url);
    return u.protocol === 'file:' ? normalizeWindowsRoot(fileURLToPath(u)) : u.href;
}

export function normalizeWindowsRoot(path: string): string {
    return path.replace(/^[a-z]:[/\\]/i, (p) => p.toUpperCase());
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
    return normalizeWindowsUrl(new URL(href));
}

const regExpDoesUrlHaveEncodedWindowsPath = /^\/([A-Z])%3A\//i;
const regExpDoesUrlContainsWindowsPath = /^\/[A-Z]:\//;

export function normalizeWindowsUrl(url: URL): URL {
    if (regExpDoesUrlHaveEncodedWindowsPath.test(url.pathname)) {
        url = new URL(url);
        url.pathname = url.pathname.replace(regExpDoesUrlHaveEncodedWindowsPath, (_, a) => `/${a.toLowerCase()}:/`);
    }
    if (regExpDoesUrlContainsWindowsPath.test(url.pathname)) {
        url = new URL(url);
        url.pathname = url.pathname.replace(regExpDoesUrlContainsWindowsPath, (a) => a.toLowerCase());
    }
    return url;
}
