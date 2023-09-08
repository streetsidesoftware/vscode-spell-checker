import * as path from 'path';
import * as vscode from 'vscode';

import type { ExtensionApi } from './ExtensionApi.cjs';
import assert = require('assert');
import { esmMethods } from './esmHelper.cjs';

// eslint-disable-next-line @typescript-eslint/no-var-requires, node/no-unpublished-require
const extensionPackage = require('../../../package.json');
const fixturesPath = path.resolve(__dirname, '../testFixtures');

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
export async function activateExtension(): Promise<ExtensionActivation> {
    const extensionId = getExtensionId();
    await log(`Activate: ${extensionId}`);
    const ext = vscode.extensions.getExtension<ExtensionApi>(extensionId);
    try {
        assert(ext);
        const extActivate = await ext.activate();
        const extApi = vscode.extensions.getExtension(extensionId)?.exports;
        return {
            ext,
            extActivate,
            extApi,
        };
    } catch (e) {
        console.error(e);
        throw e;
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

export const sampleWorkspaceRoot = vscode.Uri.file(path.resolve(__dirname, '../sampleWorkspaces'));

export function sampleWorkspaceUri(...pathSegments: string[]): vscode.Uri {
    return vscode.Uri.joinPath(sampleWorkspaceRoot, ...pathSegments);
}

export async function log(...params: Parameters<typeof console.log>): Promise<void> {
    return (await esmMethods()).log(...params);
}

export async function logYellow(...params: Parameters<typeof console.log>): Promise<void> {
    const { log, chalk } = await esmMethods();
    const [message, ...rest] = params;
    if (!message) return log('');
    return log(chalk.yellow(message), ...rest);
}
