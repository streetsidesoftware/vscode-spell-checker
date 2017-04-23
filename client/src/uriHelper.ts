
import * as vscode from 'vscode';

export const supportedSchemes = ['file', 'untitled'];
export const setOfSupportedSchemes = new Set(supportedSchemes);

export function isSupportedUri(uri: vscode.Uri): boolean {
    return setOfSupportedSchemes.has(uri.scheme);
}

