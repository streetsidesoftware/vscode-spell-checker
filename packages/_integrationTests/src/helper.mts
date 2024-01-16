/* eslint-disable import/no-duplicates */
import assert from 'node:assert';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Extension, TextDocument, TextEditor, Uri } from 'vscode';
import type * as ModuleVSCode from 'vscode';

import type { ExtensionApi } from './ExtensionApi.mjs';
import { chalk, log } from './logger.mjs';

export { log } from './logger.mjs';

const require = createRequire(import.meta.url);

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const extensionPackage = require('../../../package.json');
const fixturesPath = path.resolve(__dirname, '../testFixtures');

const vscode = require('vscode') as typeof ModuleVSCode;

export interface DocumentContext {
    doc: TextDocument;
    editor: TextEditor;
}

export interface ExtensionActivation {
    ext: Extension<ExtensionApi>;
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
export async function loadDocument(docUri: Uri): Promise<DocumentContext | undefined> {
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

export function sampleWorkspaceUri(...pathSegments: string[]): Uri {
    return vscode.Uri.joinPath(sampleWorkspaceRoot, ...pathSegments);
}

export function logYellow(...params: Parameters<typeof console.log>): void {
    const [message, ...rest] = params;
    if (!message) return log('');
    log(chalk.yellow(message), ...rest);
}
