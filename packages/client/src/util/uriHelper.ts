import * as vscode from 'vscode';

export const supportedSchemes = ['gist', 'file', 'sftp', 'untitled'];
export const setOfSupportedSchemes = new Set(supportedSchemes);

export function isSupportedUri(uri?: vscode.Uri): boolean {
    return !!uri && setOfSupportedSchemes.has(uri.scheme);
}

interface TextDocumentLike {
    isClosed: boolean;
    uri: vscode.Uri;
}

export function isSupportedDoc(doc?: vscode.TextDocument | TextDocumentLike): boolean {
    return !!doc && !doc.isClosed && isSupportedUri(doc.uri);
}

const regExpIsUri = /^[\w.-]{2,}:/;

export function toUri(uri: string | vscode.Uri): vscode.Uri;
export function toUri(uri: string | vscode.Uri | undefined): vscode.Uri | undefined;
export function toUri(uri: string | vscode.Uri | undefined): vscode.Uri | undefined {
    if (typeof uri === 'string') {
        return vscode.Uri.parse(uri);
    }
    return uri;
}

export function toFileUri(uri: string | vscode.Uri): vscode.Uri;
export function toFileUri(uri: string | vscode.Uri | undefined): vscode.Uri | undefined;
export function toFileUri(uri: string | vscode.Uri | undefined): vscode.Uri | undefined {
    if (typeof uri === 'string') {
        return regExpIsUri.test(uri) ? vscode.Uri.parse(uri) : vscode.Uri.file(uri);
    }
    return uri;
}
