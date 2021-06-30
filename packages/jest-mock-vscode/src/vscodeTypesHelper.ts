import type * as vscode from 'vscode';
import { TextDocument } from './vscode';
import { readFile } from 'fs/promises';

export function createTextDocument(uri: vscode.Uri, content: string, version?: number): vscode.TextDocument {
    return TextDocument.create(uri, content, version);
}

export async function readTextDocument(uri: vscode.Uri): Promise<vscode.TextDocument> {
    const content = await readFile(uri.fsPath, 'utf8');
    return createTextDocument(uri, content);
}
