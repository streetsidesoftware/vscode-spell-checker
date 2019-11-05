import * as path from 'path';
import * as vscode from 'vscode';

console.log(`Current directory: ${__dirname}`);
const extensionPackage = require('../../client/package.json');

export interface DocumentContext {
    doc: vscode.TextDocument;
    editor: vscode.TextEditor;
    expActivate: any;
    extApi: any;
}

/**
 * Activates the vscode.lsp-sample extension
 */
export async function activate(docUri: vscode.Uri): Promise<DocumentContext | undefined> {
    const extensionId = getExtensionId();
    console.log(`Activate: ${extensionId}`);
    const ext = vscode.extensions.getExtension(extensionId)!;
    try {
        const expActivate = await ext.activate();
        const extApi = vscode.extensions.getExtension(extensionId)!.exports;
        const doc = await vscode.workspace.openTextDocument(docUri);
        const editor = await vscode.window.showTextDocument(doc);
        await sleep(2000); // Wait for server activation
        return {
            doc,
            editor,
            expActivate,
            extApi,
        };
    } catch (e) {
        console.error(e);
    }
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getDocPath = (p: string) => {
    return path.resolve(__dirname, '../testFixtures', p);
};
export const getDocUri = (p: string) => {
    return vscode.Uri.file(getDocPath(p));
};

export async function setTestContent(context: DocumentContext, content: string): Promise<boolean> {
    const { doc, editor } = context;
    const all = new vscode.Range(
        doc.positionAt(0),
        doc.positionAt(doc.getText().length)
    );
    return editor.edit(eb => eb.replace(all, content));
}

function getExtensionId() {
    // The extensionId is `publisher.name` from package.json
    const { name = '', publisher = '' } = extensionPackage;
    return `${publisher}.${name}`;
}
