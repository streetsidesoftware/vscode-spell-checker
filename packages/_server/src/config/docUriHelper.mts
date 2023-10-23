// import type { WorkspaceFolder } from 'vscode';
import { URI as Uri, Utils as UriUtils } from 'vscode-uri';

export const schemasWithSpecialHandling = {
    vscodeNoteBookCell: 'vscode-notebook-cell',
    vscodeScm: 'vscode-scm',
} as const satisfies Readonly<Record<string, string>>;

type SpecialHandlingFunction = (uri: Uri) => Uri;

const _schemaMapToHandler = {
    [schemasWithSpecialHandling.vscodeNoteBookCell]: forceToFileUri,
    [schemasWithSpecialHandling.vscodeScm]: handleExtractUriFromQuery('rootUri', 'COMMIT_MSG.txt'),
} as const satisfies Readonly<Record<string, SpecialHandlingFunction>>;

const schemaMapToHandler: Readonly<Record<string, SpecialHandlingFunction>> = _schemaMapToHandler;

const _alwaysIncludeMatchedFiles = [/^vscode-scm:/];

// handleSpecialUri
export function handleSpecialUri(uri: Uri): Uri {
    if (!uriNeedsSpecialHandling(uri)) return uri;
    return getHandler(uri)(uri);
}

export function forceToFileUri(uri: Uri): Uri {
    if (uri.scheme === 'file') return uri;

    return uri.with({
        scheme: 'file',
        query: '',
        fragment: '',
    });
}

export function extractUriFromQueryParam(uri: Uri | string, param: string): Uri | undefined {
    uri = typeof uri === 'string' ? Uri.parse(uri) : uri;
    const url = new URL(uri.toString(true));
    const newUrl = decodeURIComponent(url.searchParams.get(param) || '');
    if (!newUrl) return undefined;
    try {
        return Uri.parse(newUrl);
    } catch (e) {
        return undefined;
    }
}

export function uriNeedsSpecialHandling(uri: Uri): boolean {
    return uri.scheme in schemaMapToHandler;
}

export function isUrlIncludedByDefault(uri: Uri | string): boolean {
    const url = uri.toString();

    for (const reg of _alwaysIncludeMatchedFiles) {
        if (reg.test(url)) return true;
    }
    return false;
}

function handleExtractUriFromQuery(param: string, appendFile?: string): (uri: Uri) => Uri {
    return (uri) => {
        const _uri = extractUriFromQueryParam(uri, param);
        if (_uri) {
            return appendFile ? UriUtils.joinPath(_uri, appendFile) : _uri;
        }
        return uri;
    };
}

function getHandler(uri: Uri): SpecialHandlingFunction {
    return schemaMapToHandler[uri.scheme];
}

export function isScmUri(uri: Uri | string): boolean {
    if (typeof uri === 'string') {
        return uri.startsWith(schemasWithSpecialHandling.vscodeScm + ':');
    }
    return uri.scheme === schemasWithSpecialHandling.vscodeScm;
}
