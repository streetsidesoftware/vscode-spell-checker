/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as path from 'path';
import * as vscode from 'vscode';
import { ExtensionApi } from './ExtensionApi';
import { format } from 'util';
import * as Chalk from 'chalk';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const extensionPackage = require('../../../package.json');
const fixturesPath = path.resolve(__dirname, '../testFixtures');

export const chalk = new Chalk.Instance({ level: 1 });

export interface DocumentContext {
    doc: vscode.TextDocument;
    editor: vscode.TextEditor;
}

export interface ExtensionActivation {
    ext: vscode.Extension<ExtensionApi>;
    extActivate: ExtensionApi;
    extApi: ExtensionApi;
}

/**
 * Activates the spell checker extension
 */
export async function activateExtension(): Promise<ExtensionActivation | undefined> {
    const extensionId = getExtensionId();
    log(`Activate: ${extensionId}`);
    const ext = vscode.extensions.getExtension<ExtensionApi>(extensionId)!;
    try {
        const extActivate = await ext.activate();
        const extApi = vscode.extensions.getExtension(extensionId)!.exports;
        return {
            ext,
            extActivate,
            extApi,
        };
    } catch (e) {
        console.error(e);
    }
}

/**
 * Activates the spell checker extension
 */
export async function loadDocument(docUri: vscode.Uri): Promise<DocumentContext | undefined> {
    try {
        const doc = await vscode.workspace.openTextDocument(docUri);
        const editor = await vscode.window.showTextDocument(doc);
        return {
            doc,
            editor,
        };
    } catch (e) {
        console.error(e);
    }
}

export async function sleep(ms: number): Promise<undefined> {
    return new Promise((resolve) => setTimeout(() => resolve(undefined), ms));
}

export const getDocPath = (p: string) => {
    return path.resolve(fixturesPath, p);
};
export const getDocUri = (p: string) => {
    return vscode.Uri.file(getDocPath(p));
};

export async function setTestContent(context: DocumentContext, content: string): Promise<boolean> {
    const { doc, editor } = context;
    const all = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
    return editor.edit((eb) => eb.replace(all, content));
}

function getExtensionId() {
    // The extensionId is `publisher.name` from package.json
    const { name = '', publisher = '' } = extensionPackage;
    return `${publisher}.${name}`;
}

export function log(...params: Parameters<typeof console.log>): void {
    const dt = new Date();
    console.log(`${chalk.cyan(dt.toISOString())} ${format(...params)}`);
}

export const sampleWorkspaceRoot = vscode.Uri.file(path.resolve(__dirname, '../sampleWorkspaces'));

export function sampleWorkspaceUri(...pathSegments: string[]): vscode.Uri {
    return vscode.Uri.joinPath(sampleWorkspaceRoot, ...pathSegments);
}
