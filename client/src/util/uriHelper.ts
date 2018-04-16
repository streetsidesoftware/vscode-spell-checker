
import * as vscode from 'vscode';

export const supportedSchemes = ['file', 'untitled'];
export const setOfSupportedSchemes = new Set(supportedSchemes);

export function isSupportedUri(uri?: vscode.Uri): boolean {
    return !!uri && setOfSupportedSchemes.has(uri.scheme);
}

export function isSupportedDoc(doc?: vscode.TextDocument): boolean {
    return !!doc && !doc.isClosed && isSupportedUri(doc.uri);
}
