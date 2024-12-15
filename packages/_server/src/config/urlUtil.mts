import { fileURLToPath } from 'node:url';

import { toFileURL } from '@cspell/url';
import { isUrlLike as _isUrlLike } from 'cspell-io';
import { URI as Uri } from 'vscode-uri';

import { stat } from '../vfs/vfs.mjs';

type UrlLike = Readonly<Uri | URL | string>;

export async function filterUrl(uri: UrlLike): Promise<Uri | undefined> {
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

export function isUriLike(uri: UrlLike): boolean {
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
export function tryJoinURL(rel: string, base: Readonly<URL | string>): URL | undefined {
    try {
        return new URL(rel, base);
    } catch {
        return undefined;
    }
}

/**
 * Some URL protocols (like `untitled:`) used by VSCode do not have a path that starts with a `/`.
 * This causes issues with the URL class when trying to resolve relative paths.
 * This function will fix the URL so that it has a path that starts with a `/`.
 * @param urlIn
 * @returns URL
 */
function fixUrlRoot(urlIn: UrlLike): Readonly<URL> {
    const url = uriToUrl(urlIn);
    if (url.pathname.startsWith('/')) return url;
    return new URL(url.protocol + '/' + url.pathname);
}

/**
 * Remove the base name from a URL if one exists.
 * @param url - url or url like.
 * @returns URL
 */
export function toPathURL(url: UrlLike): Readonly<URL> {
    url = fixUrlRoot(url);
    if (url.pathname.endsWith('/')) {
        return url;
    }
    return new URL('.', url);
}

export function toDirURL(url: UrlLike): Readonly<URL> {
    url = fixUrlRoot(url);
    if (url.pathname.endsWith('/')) {
        return url;
    }
    return new URL(url.pathname + '/', url);
}

/**
 * Try to extract a file path from a URL.
 * If the URL is not a file URL, then the pathname is returned.
 * @param url - url
 * @returns path
 */
export function urlToFilepath(url: UrlLike): string {
    const u = uriToUrl(url);
    return u.protocol === 'file:' ? normalizeWindowsRoot(fileURLToPath(u)) : u.pathname;
}

/**
 * Try to extract a file path from a URL.
 * If the URL is not a file URL, then the href is returned.
 * @param url - url
 * @returns path or href
 */
export function urlToFilePathOrHref(url: UrlLike): string {
    const u = uriToUrl(url);
    return u.protocol === 'file:' ? normalizeWindowsRoot(fileURLToPath(u)) : u.href;
}

export function normalizeWindowsRoot(path: string): string {
    return path.replace(/^[a-z]:[/\\]/i, (p) => p.toUpperCase());
}

export function uriToGlobPath(uri: UrlLike): string {
    if (typeof uri === 'string' && !isUriLike(uri)) {
        // console.log(`uriToGlobPath: uri is not a URL: %s`, uri);
        return uri;
    }
    const url = uriToUrl(uri);
    // console.log('uriToGlobPath:\n\t%s ->\n\t%s', uri.toString(), url.href);
    return url.href;
}

export function uriToGlobRoot(uri: UrlLike): string {
    const url = uriToUrl(uri);
    const urlDir = toDirURL(url);
    // console.log('uriToGlobRoot:\n\t%s ->\n\t%s', uri.toString(), url.href);
    return urlDir.href;
}

export function uriToUrl(uri: UrlLike): Readonly<URL> {
    if (uri instanceof URL) return uri;
    uri = typeof uri === 'string' && !isUriLike(uri) ? toFileURL(uri) : uri;
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
